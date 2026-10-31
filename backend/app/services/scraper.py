import io
import hashlib
from typing import Tuple, List, Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader

from app.core.ssrf import validate_url_security
from app.config import settings

def compute_sha256(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8", errors="ignore")).hexdigest()

def segment_text_into_passages(text: str, max_passage_chars: int = 400) -> List[Tuple[str, int, int]]:
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    passages: List[Tuple[str, int, int]] = []
    current_char_offset = 0

    for p in paragraphs:
        # Split very long paragraphs into chunks
        words = p.split()
        current_chunk = []
        current_len = 0

        for w in words:
            if current_len + len(w) + 1 > max_passage_chars and current_chunk:
                passage_text = " ".join(current_chunk)
                start_offset = current_char_offset
                end_offset = start_offset + len(passage_text)
                passages.append((passage_text, start_offset, end_offset))
                current_char_offset = end_offset + 1
                current_chunk = [w]
                current_len = len(w)
            else:
                current_chunk.append(w)
                current_len += len(w) + 1

        if current_chunk:
            passage_text = " ".join(current_chunk)
            start_offset = current_char_offset
            end_offset = start_offset + len(passage_text)
            passages.append((passage_text, start_offset, end_offset))
            current_char_offset = end_offset + 1

    return passages

async def fetch_web_page(url: str) -> Tuple[bool, str, str, str, str]:
    """
    Returns (success, error_or_content, title, domain, publication_date)
    """
    # 1. Strict SSRF Pre-flight Validation
    is_safe, error_msg = validate_url_security(url)
    if not is_safe:
        return False, error_msg, "", "", ""

    parsed = urlparse(url)
    domain = parsed.netloc

    # 2. HTTP Request with strict timeout and content length limits
    try:
        async with httpx.AsyncClient(
            timeout=settings.SCRAPE_TIMEOUT_SECONDS,
            follow_redirects=True,
            max_redirects=3,
            headers={"User-Agent": "BlindspotAI-IntelligenceBot/1.0 (+https://blindspot.ai/robot)"}
        ) as client:
            response = await client.get(url)

            if response.status_code != 200:
                return False, f"HTTP request returned status {response.status_code}", "", domain, ""

            content_bytes = response.content
            if len(content_bytes) > settings.MAX_CONTENT_LENGTH_BYTES:
                return False, f"Content exceeded limit of {settings.MAX_CONTENT_LENGTH_BYTES} bytes", "", domain, ""

            html_text = response.text
            soup = BeautifulSoup(html_text, "html.parser")

            # Extract page title
            title = soup.title.string.strip() if soup.title and soup.title.string else domain

            # Attempt to extract publication date from common metadata tags
            pub_date = ""
            date_meta = soup.find("meta", attrs={"property": "article:published_time"}) or \
                        soup.find("meta", attrs={"name": "date"}) or \
                        soup.find("meta", attrs={"name": "pubdate"})
            if date_meta and date_meta.get("content"):
                pub_date = date_meta["content"]

            # Remove scripts, styles, navigations
            for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                tag.decompose()

            raw_text = soup.get_text(separator="\n", strip=True)
            return True, raw_text, title, domain, pub_date

    except httpx.TimeoutException:
        return False, f"Request to {domain} timed out after {settings.SCRAPE_TIMEOUT_SECONDS}s", "", domain, ""
    except Exception as e:
        return False, f"Failed to ingest URL: {str(e)}", "", domain, ""

def parse_pdf_content(file_bytes: bytes) -> Tuple[bool, str, str, str]:
    """
    Returns (success, text_content_or_error, title, publication_date)
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []

        title = "Uploaded PDF Document"
        pub_date = ""
        if reader.metadata:
            if reader.metadata.title:
                title = reader.metadata.title
            if reader.metadata.creation_date:
                pub_date = str(reader.metadata.creation_date)

        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text.strip())

        full_text = "\n\n".join(extracted_pages)
        if not full_text.strip():
            return False, "PDF contained no extractable textual content", "", ""

        return True, full_text, title, pub_date
    except Exception as e:
        return False, f"PDF extraction error: {str(e)}", "", ""
