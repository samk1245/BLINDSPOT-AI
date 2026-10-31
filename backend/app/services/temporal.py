import uuid
import re
import datetime
from typing import List
from sqlalchemy.orm import Session
from app.models.investigation import Investigation
from app.models.source import Source
from app.models.intelligence import VerificationTask, TaskPriority, TaskStatus

def extract_years_from_text(text: str) -> List[int]:
    matches = re.findall(r"\b(19\d{2}|20\d{2})\b", text)
    return [int(m) for m in matches]

def analyze_temporal_freshness(
    db: Session,
    investigation: Investigation,
    sources: List[Source]
) -> List[VerificationTask]:
    created_tasks = []
    current_year = datetime.datetime.utcnow().year

    for source in sources:
        if not source.publication_date:
            task = VerificationTask(
                id=str(uuid.uuid4()),
                investigation_id=investigation.id,
                title=f"Verify Effective Date: {source.title}",
                reason_it_matters="Source does not declare a formal publication timestamp or last-updated date. Information may be obsolete.",
                suggested_official_source=source.url or "Issuing regulatory portal",
                supporting_evidence_snippet=source.raw_content[:250] + "...",
                priority=TaskPriority.HIGH,
                status=TaskStatus.PENDING,
                is_completed=False
            )
            db.add(task)
            created_tasks.append(task)

        years = extract_years_from_text(source.raw_content)
        older_years = [y for y in years if y < current_year]
        if older_years and not any(y >= current_year for y in years):
            task = VerificationTask(
                id=str(uuid.uuid4()),
                investigation_id=investigation.id,
                title=f"Confirm Stale Policy Version ({min(older_years)}-{max(older_years)})",
                reason_it_matters=f"Document references outdated periods ({max(older_years)}) without citing {current_year} guidelines.",
                suggested_official_source="Current academic/official year bulletin",
                supporting_evidence_snippet=f"Detected references to prior calendar years: {older_years[:3]}",
                priority=TaskPriority.URGENT,
                status=TaskStatus.PENDING,
                is_completed=False
            )
            db.add(task)
            created_tasks.append(task)

    renewal_task = VerificationTask(
        id=str(uuid.uuid4()),
        investigation_id=investigation.id,
        title="Confirm Multi-Year Renewal Policy & Credit Hour Requirements",
        reason_it_matters="Failure to verify renewal benchmarks can cause forfeiture of funding in subsequent semesters.",
        suggested_official_source="Official Financial Aid Award Handbook",
        supporting_evidence_snippet="Renewal conditions are omitted or partially cited in summary portals.",
        priority=TaskPriority.HIGH,
        status=TaskStatus.PENDING,
        is_completed=False
    )
    db.add(renewal_task)
    created_tasks.append(renewal_task)

    db.commit()
    return created_tasks
