import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.investigation import Investigation
from app.models.source import Source, SourceType, SourceStatus, EvidencePassage, ExtractedClaim
from app.schemas.source import SourceURLCreateRequest, SourceResponse, EvidencePassageResponse, ExtractedClaimResponse
from app.api.deps import get_current_user
from app.core.file_security import validate_pdf_content, save_uploaded_pdf
from app.core.rate_limiter import enforce_rate_limit
from app.services.scraper import fetch_web_page, parse_pdf_content, compute_sha256, segment_text_into_passages

router = APIRouter(prefix="/sources", tags=["Sources"])

@router.post("/url", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def ingest_url(
    request: Request,
    body: SourceURLCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enforce_rate_limit(request, "source_url_scrape", max_requests=20, window_seconds=60)

    inv_query = select(Investigation).where(Investigation.id == body.investigation_id, Investigation.user_id == current_user.id)
    inv = db.execute(inv_query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    success, content_or_err, page_title, domain, pub_date = await fetch_web_page(body.url)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Ingestion failed: {content_or_err}")

    source_id = str(uuid.uuid4())
    content_hash = compute_sha256(content_or_err)

    rel_score = 0.75
    if domain.endswith(".gov") or domain.endswith(".mil"):
        rel_score = 0.98
    elif domain.endswith(".edu"):
        rel_score = 0.92
    elif domain.endswith(".org"):
        rel_score = 0.85

    source = Source(
        id=source_id,
        investigation_id=inv.id,
        source_type=SourceType.URL,
        url=body.url,
        title=body.title or page_title or domain,
        domain=domain,
        publication_date=pub_date,
        raw_content=content_or_err,
        content_hash=content_hash,
        reliability_score=rel_score,
        status=SourceStatus.PARSED
    )
    db.add(source)
    db.commit()

    passages = segment_text_into_passages(content_or_err)
    created_passages = []
    for idx, (p_text, start_o, end_o) in enumerate(passages[:50]):
        p = EvidencePassage(
            id=str(uuid.uuid4()),
            source_id=source.id,
            passage_index=idx,
            text=p_text,
            char_offset_start=start_o,
            char_offset_end=end_o
        )
        db.add(p)
        created_passages.append(p)

    db.commit()

    return SourceResponse(
        id=source.id,
        investigation_id=source.investigation_id,
        source_type=source.source_type,
        url=source.url,
        title=source.title,
        domain=source.domain,
        retrieval_timestamp=source.retrieval_timestamp.isoformat(),
        publication_date=source.publication_date,
        last_updated_date=source.last_updated_date,
        content_hash=source.content_hash,
        reliability_score=source.reliability_score,
        status=source.status,
        passages=[
            EvidencePassageResponse(
                id=p.id,
                source_id=p.source_id,
                passage_index=p.passage_index,
                text=p.text,
                char_offset_start=p.char_offset_start,
                char_offset_end=p.char_offset_end
            ) for p in created_passages
        ],
        claims=[]
    )

@router.post("/upload", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    request: Request,
    investigation_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enforce_rate_limit(request, "source_pdf_upload", max_requests=10, window_seconds=60)

    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    inv = db.execute(inv_query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    file_bytes = await file.read()
    is_valid_pdf, err_msg = validate_pdf_content(file_bytes)
    if not is_valid_pdf:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

    file_id, file_path = save_uploaded_pdf(file_bytes, file.filename)
    success, text_or_err, title, pub_date = parse_pdf_content(file_bytes)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"PDF extraction error: {text_or_err}")

    content_hash = compute_sha256(text_or_err)
    source_id = str(uuid.uuid4())
    doc_title = title if (title and title != "Uploaded PDF Document") else (file.filename or "Uploaded PDF")

    source = Source(
        id=source_id,
        investigation_id=inv.id,
        source_type=SourceType.PDF,
        url=None,
        title=doc_title,
        domain="PDF Document",
        publication_date=pub_date,
        raw_content=text_or_err,
        content_hash=content_hash,
        reliability_score=0.90,
        status=SourceStatus.PARSED
    )
    db.add(source)
    db.commit()

    passages = segment_text_into_passages(text_or_err)
    created_passages = []
    for idx, (p_text, start_o, end_o) in enumerate(passages[:50]):
        p = EvidencePassage(
            id=str(uuid.uuid4()),
            source_id=source.id,
            passage_index=idx,
            text=p_text,
            char_offset_start=start_o,
            char_offset_end=end_o
        )
        db.add(p)
        created_passages.append(p)
    db.commit()

    return SourceResponse(
        id=source.id,
        investigation_id=source.investigation_id,
        source_type=source.source_type,
        url=source.url,
        title=source.title,
        domain=source.domain,
        retrieval_timestamp=source.retrieval_timestamp.isoformat(),
        publication_date=source.publication_date,
        last_updated_date=source.last_updated_date,
        content_hash=source.content_hash,
        reliability_score=source.reliability_score,
        status=source.status,
        passages=[
            EvidencePassageResponse(
                id=p.id,
                source_id=p.source_id,
                passage_index=p.passage_index,
                text=p.text,
                char_offset_start=p.char_offset_start,
                char_offset_end=p.char_offset_end
            ) for p in created_passages
        ],
        claims=[]
    )

@router.get("/{investigation_id}", response_model=List[SourceResponse])
def list_sources(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    if not db.execute(inv_query).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    sources_query = (
        select(Source)
        .where(Source.investigation_id == investigation_id)
        .order_by(Source.created_at.desc())
    )
    sources = db.execute(sources_query).scalars().all()

    return [
        SourceResponse(
            id=s.id,
            investigation_id=s.investigation_id,
            source_type=s.source_type,
            url=s.url,
            title=s.title,
            domain=s.domain,
            retrieval_timestamp=s.retrieval_timestamp.isoformat(),
            publication_date=s.publication_date,
            last_updated_date=s.last_updated_date,
            content_hash=s.content_hash,
            reliability_score=s.reliability_score,
            status=s.status,
            passages=[
                EvidencePassageResponse(
                    id=p.id,
                    source_id=p.source_id,
                    passage_index=p.passage_index,
                    text=p.text,
                    char_offset_start=p.char_offset_start,
                    char_offset_end=p.char_offset_end
                ) for p in s.passages
            ],
            claims=[
                ExtractedClaimResponse(
                    id=c.id,
                    source_id=c.source_id,
                    passage_id=c.passage_id,
                    claim_text=c.claim_text,
                    topic_category=c.topic_category,
                    confidence_score=c.confidence_score,
                    is_temporal=c.is_temporal,
                    temporal_date=c.temporal_date
                ) for c in s.claims
            ]
        )
        for s in sources
    ]
