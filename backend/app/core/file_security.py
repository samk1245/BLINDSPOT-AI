import os
import uuid
from typing import Tuple
from app.config import settings

# PDF standard header magic bytes
PDF_MAGIC_BYTES = b"%PDF-"

def validate_pdf_content(file_bytes: bytes) -> Tuple[bool, str]:
    if len(file_bytes) == 0:
        return False, "File is empty"

    if len(file_bytes) > settings.UPLOAD_MAX_SIZE_BYTES:
        max_mb = settings.UPLOAD_MAX_SIZE_BYTES // (1024 * 1024)
        return False, f"File exceeds maximum allowed size of {max_mb} MB"

    # Verify PDF magic bytes at the beginning of the file
    if not file_bytes.startswith(PDF_MAGIC_BYTES):
        return False, "Invalid file format: Missing PDF magic header (%PDF-)"

    return True, "Valid PDF"

def save_uploaded_pdf(file_bytes: bytes, original_filename: str) -> Tuple[str, str]:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}.pdf"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return file_id, file_path
