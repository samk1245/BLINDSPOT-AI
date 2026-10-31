import uuid
import json
from typing import List, Optional
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

def populate_stem_investigation(db: Session, user_id: str) -> Investigation:
    inv = Investigation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title="National Merit & STEM Excellence Fellowship (2026)",
        research_question="What should I verify before applying for the 2026 STEM Fellowship?",
        objective="Identify income limits, renewal GPA clauses, conflicting eligibility documents, and deadlines.",
        domain="Education & Grants",
        status=InvestigationStatus.COMPLETED,
        readiness_score=42.5
    )
    db.add(inv)
    db.commit()

    official_content = (
        "OFFICIAL 2026 HIGHER EDUCATION STEM GRANT PORTAL\n"
        "Published: January 15, 2026. Official Notification ED-2026-99.\n"
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
        "Renewal Warning: Funding was discontinued after sophomore year if minimum 15 credits per semester were not maintained."
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
    db.commit()
    return inv

def populate_clinical_investigation(db: Session, user_id: str) -> Investigation:
    inv = Investigation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title="FDA Phase-III Clinical Trial Protocol (CardioVax-9)",
        research_question="What clinical exclusion criteria and drug interactions are omitted in the 2026 patient briefing?",
        objective="Verify cardiac contraindications, renal impairment dosing, and dietary fasting requirements across trial documents.",
        domain="Healthcare & Clinical",
        status=InvestigationStatus.COMPLETED,
        readiness_score=58.0
    )
    db.add(inv)
    db.commit()

    clinical_protocol = (
        "NATIONAL CLINICAL TRIALS REGISTRY - PROTOCOL CV-301 (PHASE III)\n"
        "Drug Compound: CardioVax-9 (Synthetic Lipoprotein Inhibitor)\n"
        "Published: February 2026. Primary Investigator: Dr. H. Vance, FACC.\n"
        "Inclusion Criteria: Adults aged 40-75 with confirmed atherosclerotic cardiovascular disease.\n"
        "Dietary Protocol: Patients may administer oral dosage without dietary restrictions or mandatory fasting.\n"
        "Monitored Outcomes: 24-month MACE reduction, LDL-C plasma clearance."
    )
    s1 = Source(
        id=str(uuid.uuid4()),
        investigation_id=inv.id,
        source_type=SourceType.OFFICIAL_PORTAL,
        url="https://clinicaltrials.gov/study/CV-301-Phase3",
        title="ClinicalTrials.gov Protocol Record CV-301",
        domain="clinicaltrials.gov",
        publication_date="2026-02-01",
        last_updated_date="2026-02-01",
        raw_content=clinical_protocol,
        content_hash=compute_sha256(clinical_protocol),
        reliability_score=0.96,
        status=SourceStatus.PARSED
    )
    db.add(s1)

    journal_paper = (
        "JOURNAL OF CLINICAL PHARMACOLOGY - EARLY PHASE II REVIEw\n"
        "Published: September 2024. Pharmacokinetic Safety Analysis.\n"
        "Warning: CardioVax-9 absorption increases 3.4x when ingested with lipid-dense meals.\n"
        "Strict Requirement: Mandatory 12-hour overnight fasting prior to morning administration to prevent acute hypotensive peaks.\n"
        "Exclusion Warning: Severe renal impairment (eGFR < 30 mL/min) requires 50% dose titration."
    )
    s2 = Source(
        id=str(uuid.uuid4()),
        investigation_id=inv.id,
        source_type=SourceType.RESEARCH_REPORT,
        url="https://jclinpharm.org/articles/cv-9-pharmacokinetics",
        title="Journal of Clinical Pharmacology (Phase II Pharmacokinetics)",
        domain="jclinpharm.org",
        publication_date="2024-09-15",
        last_updated_date="2024-09-15",
        raw_content=journal_paper,
        content_hash=compute_sha256(journal_paper),
        reliability_score=0.91,
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
    db.commit()
    return inv

def populate_legal_investigation(db: Session, user_id: str) -> Investigation:
    inv = Investigation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title="EU AI Act & Sovereign Data Pipeline Compliance (2026)",
        research_question="Are cross-border telemetry pipelines compliant with 2026 EU High-Risk AI mandates?",
        objective="Audit biometric surveillance exemptions, conformity assessment logging, and third-party audit deadlines.",
        domain="Legal & Regulatory",
        status=InvestigationStatus.COMPLETED,
        readiness_score=64.5
    )
    db.add(inv)
    db.commit()

    eu_act = (
        "OFFICIAL JOURNAL OF THE EUROPEAN UNION - REGULATION (EU) 2024/1689\n"
        "Harmonised Rules on Artificial Intelligence (Artificial Intelligence Act)\n"
        "Article 12: Technical documentation and automated record logging for High-Risk AI systems must be retained for at least 6 months.\n"
        "Article 43: Third-party conformity assessment mandatory prior to placing on Union market.\n"
        "Exemption Clause: Purely internal research prototypes not deployed to public consumer endpoints are exempt from CE-marking."
    )
    s1 = Source(
        id=str(uuid.uuid4()),
        investigation_id=inv.id,
        source_type=SourceType.OFFICIAL_PORTAL,
        url="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
        title="EUR-Lex Regulation (EU) 2024/1689 Official Directive",
        domain="eur-lex.europa.eu",
        publication_date="2024-07-12",
        last_updated_date="2024-07-12",
        raw_content=eu_act,
        content_hash=compute_sha256(eu_act),
        reliability_score=0.99,
        status=SourceStatus.PARSED
    )
    db.add(s1)

    compliance_brief = (
        "ENTERPRISE LEGAL ADVISORY BRIEF - TECH COMPLIANCE BULLETIN\n"
        "Published: January 2026. Cross-Border Cloud Telemetry Analysis.\n"
        "Summary: Cloud inference pipelines processing EU customer logs claim exemption under R&D prototype defense.\n"
        "Contradiction Note: Directive specifies that commercial telemetry collection invalidates the R&D defense once enterprise revenue is generated.\n"
        "Missing Record: No conformity assessment documentation exists in technical annex repository."
    )
    s2 = Source(
        id=str(uuid.uuid4()),
        investigation_id=inv.id,
        source_type=SourceType.RESEARCH_REPORT,
        url="https://compliance-observer.eu/briefings/eu-ai-act-telemetry",
        title="European Tech Legal Advisory Bulletin (2026)",
        domain="compliance-observer.eu",
        publication_date="2026-01-10",
        last_updated_date="2026-01-10",
        raw_content=compliance_brief,
        content_hash=compute_sha256(compliance_brief),
        reliability_score=0.88,
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
    db.commit()
    return inv

def populate_clean_hydrogen_investigation(db: Session, user_id: str) -> Investigation:
    inv = Investigation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title="Clean Hydrogen Tax Credit (Section 45V) Clawback Risk",
        research_question="What emissions accounting and hourly matching criteria are required to prevent tax clawbacks?",
        objective="Verify three-pillar requirements: additionality, deliverability, and hourly time-matching for 2026 tax credits.",
        domain="Financial & Investment",
        status=InvestigationStatus.COMPLETED,
        readiness_score=76.0
    )
    db.add(inv)
    db.commit()

    irs_guidance = (
        "INTERNAL REVENUE SERVICE (IRS) NOTICE 2025-78\n"
        "Clean Hydrogen Production Credit under Internal Revenue Code Section 45V.\n"
        "Lifecycle Greenhouse Gas Emissions: Credit tiers range from $0.60 to $3.00 per kilogram of clean hydrogen.\n"
        "Hourly Matching Rule: Production facilities commencing after 2028 must verify hourly matching with clean renewable generators.\n"
        "Reporting Requirement: Annual greenhouse gas lifecycle report certified by an accredited third-party verification body."
    )
    s1 = Source(
        id=str(uuid.uuid4()),
        investigation_id=inv.id,
        source_type=SourceType.OFFICIAL_PORTAL,
        url="https://irs.gov/irb/2025-78_IRB",
        title="IRS Internal Revenue Bulletin Notice 2025-78",
        domain="irs.gov",
        publication_date="2025-11-20",
        last_updated_date="2025-11-20",
        raw_content=irs_guidance,
        content_hash=compute_sha256(irs_guidance),
        reliability_score=0.97,
        status=SourceStatus.PARSED
    )
    db.add(s1)
    db.commit()

    passages = segment_text_into_passages(s1.raw_content)
    for idx, (p_text, start_o, end_o) in enumerate(passages):
        p = EvidencePassage(
            id=str(uuid.uuid4()),
            source_id=s1.id,
            passage_index=idx,
            text=p_text,
            char_offset_start=start_o,
            char_offset_end=end_o
        )
        db.add(p)
    db.commit()

    reqs = decompose_investigation_goal(db, inv)
    sources_list = [s1]
    gaps = detect_information_gaps(db, inv, reqs, sources_list)
    conflicts = detect_cross_source_conflicts(db, inv, sources_list)
    tasks = analyze_temporal_freshness(db, inv, sources_list)

    readiness = calculate_decision_readiness(reqs, sources_list, gaps, conflicts, tasks)
    inv.readiness_score = readiness["score"]
    inv.readiness_breakdown = json.dumps(readiness)
    db.commit()
    return inv

def seed_all_default_investigations(db: Session, user_id: str):
    populate_stem_investigation(db, user_id)
    populate_clinical_investigation(db, user_id)
    populate_legal_investigation(db, user_id)
    populate_clean_hydrogen_investigation(db, user_id)

@router.post("/seed-all-demos")
def seed_all_demos_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Remove existing investigations for this user
    existing_invs = db.execute(select(Investigation).where(Investigation.user_id == current_user.id)).scalars().all()
    for inv in existing_invs:
        db.delete(inv)
    db.commit()

    seed_all_default_investigations(db, current_user.id)

    query = select(Investigation).where(Investigation.user_id == current_user.id).order_by(Investigation.created_at.desc())
    invs = db.execute(query).scalars().all()

    return {
        "status": "SUCCESS",
        "message": f"Seeded {len(invs)} multi-domain research investigations.",
        "count": len(invs)
    }

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

    # Automatically seed the 4 diverse investigations if new user has 0 investigations
    if len(invs) == 0:
        seed_all_default_investigations(db, current_user.id)
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

    inv.title = "National Merit & STEM Excellence Scholarship (2026)"
    inv.research_question = "What should I verify before applying for the 2026 STEM Fellowship?"
    inv.objective = "Identify eligibility limits, renewal clauses, conflicting documents, and deadlines."
    inv.domain = "Education & Grants"

    official_content = (
        "OFFICIAL 2026 HIGHER EDUCATION STEM GRANT PORTAL\n"
        "Published: January 15, 2026. Official Notification ED-2026-99.\n"
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
