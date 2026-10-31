import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from app.database import get_db
from app.models.user import User
from app.models.investigation import (
    Investigation,
    InvestigationStatus,
    ResearchRequirement,
    CoverageStatus,
    RequirementCategory,
    RequirementImportance
)
from app.models.source import Source, SourceType, SourceStatus, EvidencePassage
from app.models.intelligence import InformationGap, Conflict, VerificationTask
from app.schemas.investigation import (
    InvestigationCreateRequest,
    InvestigationResponse
)
from app.api.deps import get_current_user
from app.services.decomposer import decompose_investigation_goal
from app.services.gap_engine import detect_information_gaps
from app.services.contradiction import detect_cross_source_conflicts
from app.services.temporal import analyze_temporal_freshness
from app.services.readiness import calculate_decision_readiness
from app.services.scraper import compute_sha256, segment_text_into_passages

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.post("", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def create_investigation(
    body: InvestigationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_id = str(uuid.uuid4())
    investigation = Investigation(
        id=inv_id,
        user_id=current_user.id,
        title=body.title,
        research_question=body.research_question,
        objective=body.objective,
        domain=body.domain,
        status=InvestigationStatus.DRAFT,
        readiness_score=0.0,
        readiness_breakdown="{}"
    )
    db.add(investigation)
    db.commit()

    decompose_investigation_goal(db, investigation)

    return InvestigationResponse(
        id=investigation.id,
        user_id=investigation.user_id,
        title=investigation.title,
        research_question=investigation.research_question,
        objective=investigation.objective,
        domain=investigation.domain,
        status=investigation.status,
        readiness_score=investigation.readiness_score,
        readiness_breakdown=investigation.readiness_breakdown,
        created_at=investigation.created_at.isoformat(),
        updated_at=investigation.updated_at.isoformat(),
        requirements_count=len(investigation.requirements),
        sources_count=0,
        gaps_count=0,
        conflicts_count=0,
        tasks_count=0
    )

@router.get("", response_model=List[InvestigationResponse])
def list_investigations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(Investigation)
        .where(Investigation.user_id == current_user.id)
        .order_by(Investigation.created_at.desc())
    )
    invs = db.execute(query).scalars().all()

    return [
        InvestigationResponse(
            id=inv.id,
            user_id=inv.user_id,
            title=inv.title,
            research_question=inv.research_question,
            objective=inv.objective,
            domain=inv.domain,
            status=inv.status,
            readiness_score=inv.readiness_score,
            readiness_breakdown=inv.readiness_breakdown,
            created_at=inv.created_at.isoformat(),
            updated_at=inv.updated_at.isoformat(),
            requirements_count=len(inv.requirements),
            sources_count=len(inv.sources),
            gaps_count=len(inv.gaps),
            conflicts_count=len(inv.conflicts),
            tasks_count=len(inv.tasks)
        )
        for inv in invs
    ]

@router.get("/{id}", response_model=InvestigationResponse)
def get_investigation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = select(Investigation).where(Investigation.id == id, Investigation.user_id == current_user.id)
    inv = db.execute(query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    return InvestigationResponse(
        id=inv.id,
        user_id=inv.user_id,
        title=inv.title,
        research_question=inv.research_question,
        objective=inv.objective,
        domain=inv.domain,
        status=inv.status,
        readiness_score=inv.readiness_score,
        readiness_breakdown=inv.readiness_breakdown,
        created_at=inv.created_at.isoformat(),
        updated_at=inv.updated_at.isoformat(),
        requirements_count=len(inv.requirements),
        sources_count=len(inv.sources),
        gaps_count=len(inv.gaps),
        conflicts_count=len(inv.conflicts),
        tasks_count=len(inv.tasks)
    )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investigation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = select(Investigation).where(Investigation.id == id, Investigation.user_id == current_user.id)
    inv = db.execute(query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    db.delete(inv)
    db.commit()
    return None

@router.post("/{id}/analyze")
def analyze_investigation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = select(Investigation).where(Investigation.id == id, Investigation.user_id == current_user.id)
    inv = db.execute(query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    if not inv.sources:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot run analysis without at least one ingested source document or URL."
        )

    inv.status = InvestigationStatus.ANALYZING
    db.commit()

    db.execute(delete(InformationGap).where(InformationGap.investigation_id == inv.id))
    db.execute(delete(Conflict).where(Conflict.investigation_id == inv.id))
    db.execute(delete(VerificationTask).where(VerificationTask.investigation_id == inv.id))
    db.commit()

    gaps = detect_information_gaps(db, inv, inv.requirements, inv.sources)
    conflicts = detect_cross_source_conflicts(db, inv, inv.sources)
    tasks = analyze_temporal_freshness(db, inv, inv.sources)

    readiness_breakdown = calculate_decision_readiness(
        inv.requirements, inv.sources, gaps, conflicts, tasks
    )
    inv.readiness_score = readiness_breakdown["score"]
    inv.readiness_breakdown = json.dumps(readiness_breakdown)
    inv.status = InvestigationStatus.COMPLETED
    db.commit()

    return {
        "status": "COMPLETED",
        "investigation_id": inv.id,
        "readiness_score": inv.readiness_score,
        "readiness_breakdown": readiness_breakdown,
        "gaps_count": len(gaps),
        "conflicts_count": len(conflicts),
        "tasks_count": len(tasks)
    }

@router.post("/{id}/load-demo-data")
async def load_scholarship_demo(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = select(Investigation).where(Investigation.id == id, Investigation.user_id == current_user.id)
    inv = db.execute(query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    db.execute(delete(Source).where(Source.investigation_id == inv.id))
    db.execute(delete(ResearchRequirement).where(ResearchRequirement.investigation_id == inv.id))
    db.execute(delete(InformationGap).where(InformationGap.investigation_id == inv.id))
    db.execute(delete(Conflict).where(Conflict.investigation_id == inv.id))
    db.execute(delete(VerificationTask).where(VerificationTask.investigation_id == inv.id))
    db.commit()

    inv.title = "National Merit & STEM Excellence Scholarship (Demo)"
    inv.research_question = "What should I verify before applying for the 2026 STEM Fellowship?"
    inv.objective = "Identify eligibility limits, renewal clauses, conflicting documents, and deadlines."
    inv.domain = "Education & Government Grants"

    official_content = (
        "OFFICIAL 2026 HIGHER EDUCATION STEM GRANT PORTAL\n"
        "Published: January 15, 2026. Official Notification No: ED-2026-99.\n"
        "Eligibility Guidelines:\n"
        "1. Academic benchmark: Applicants must demonstrate a minimum cumulative GPA of 3.8 on a 4.0 scale.\n"
        "2. Financial criteria: Maximum family household adjusted gross income ceiling is $65,000.\n"
        "3. Application deadline: All submissions must be received before April 30, 2026 at 11:59 PM EST.\n"
        "4. Required documentation: Certified academic transcripts, FAFSA SAR statement, and 2 faculty recommendations.\n"
        "5. Portal submission: Applications must be submitted through portal.ed.gov/stem2026."
    )
    s1 = Source(
        id=str(uuid.uuid4()),
        investigation_id=inv.id,
        source_type=SourceType.OFFICIAL_PORTAL,
        url="https://portal.ed.gov/grants/stem2026-official-bulletin",
        title="Department of Education Official 2026 STEM Grant Portal",
        domain="portal.ed.gov",
        publication_date="2026-01-15",
        last_updated_date="2026-01-15",
        raw_content=official_content,
        content_hash=compute_sha256(official_content),
        reliability_score=0.98,
        status=SourceStatus.PARSED
    )
    db.add(s1)

    secondary_content = (
        "STUDENT SCHOLARSHIP COMPENDIUM (SECONDARY ADVISORY GUIDE)\n"
        "Published: March 10, 2023. Unofficial student summary.\n"
        "Notice: STEM Grant provides up to $10,000 per academic year.\n"
        "Income Limit: Household income must be strictly under $50,000.\n"
        "Eligibility: Open to all state residents with minimum GPA of 3.5.\n"
        "Renewal Warning: Some students reported funding was discontinued after sophomore year if minimum 15 credits per semester were not maintained."
    )
    s2 = Source(
        id=str(uuid.uuid4()),
        investigation_id=inv.id,
        source_type=SourceType.RESEARCH_REPORT,
        url="https://scholarshipadvisory.org/guides/national-stem-overview",
        title="Scholarship Advisory Compendium (2023 Guide)",
        domain="scholarshipadvisory.org",
        publication_date="2023-03-10",
        last_updated_date="2023-03-10",
        raw_content=secondary_content,
        content_hash=compute_sha256(secondary_content),
        reliability_score=0.65,
        status=SourceStatus.PARSED
    )
    db.add(s2)
    db.commit()

    for s in [s1, s2]:
        passages = segment_text_into_passages(s.raw_content)
        for idx, (p_text, start_o, end_o) in enumerate(passages):
            p = EvidencePassage(
                id=str(uuid.uuid4()),
                source_id=s.id,
                passage_index=idx,
                text=p_text,
                char_offset_start=start_o,
                char_offset_end=end_o
            )
            db.add(p)
    db.commit()

    reqs = decompose_investigation_goal(db, inv)
    sources_list = [s1, s2]
    gaps = detect_information_gaps(db, inv, reqs, sources_list)
    conflicts = detect_cross_source_conflicts(db, inv, sources_list)
    tasks = analyze_temporal_freshness(db, inv, sources_list)

    readiness = calculate_decision_readiness(reqs, sources_list, gaps, conflicts, tasks)
    inv.readiness_score = readiness["score"]
    inv.readiness_breakdown = json.dumps(readiness)
    inv.status = InvestigationStatus.COMPLETED
    db.commit()

    return {
        "status": "SUCCESS",
        "message": "Scholarship demo dataset loaded and analyzed successfully.",
        "investigation_id": inv.id,
        "readiness_score": inv.readiness_score
    }
