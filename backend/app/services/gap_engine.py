import uuid
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.investigation import (
    Investigation,
    ResearchRequirement,
    CoverageStatus,
    RequirementCategory
)
from app.models.source import Source, ExtractedClaim
from app.models.intelligence import InformationGap

def detect_information_gaps(
    db: Session,
    investigation: Investigation,
    requirements: List[ResearchRequirement],
    sources: List[Source]
) -> List[InformationGap]:
    claims_query = select(ExtractedClaim).join(Source).where(Source.investigation_id == investigation.id)
    all_claims = db.execute(claims_query).scalars().all()

    combined_source_text = " ".join([s.raw_content.lower() for s in sources])
    created_gaps = []

    for req in requirements:
        req_category = req.category

        category_keywords = {
            RequirementCategory.ELIGIBILITY: ["gpa", "eligible", "citizen", "residency", "prerequisite", "qualification"],
            RequirementCategory.FINANCIAL: ["income", "limit", "ceiling", "need", "dollar", "$", "financial", "threshold"],
            RequirementCategory.DEADLINES: ["deadline", "due date", "cutoff", "apply by", "submission date", "2026", "2025"],
            RequirementCategory.DOCUMENTATION: ["document", "transcript", "affidavit", "form", "proof", "recommendation"],
            RequirementCategory.PROCEDURES: ["portal", "how to apply", "application step", "procedure", "submit online"],
            RequirementCategory.EXCEPTIONS: ["renewal", "probation", "maintain", "retain", "minimum credits", "exception"],
            RequirementCategory.GENERAL: ["general", "overview", "criteria"]
        }

        keywords = category_keywords.get(req_category, ["criteria"])
        found_keywords = [kw for kw in keywords if kw in combined_source_text]

        if not found_keywords:
            status = CoverageStatus.MISSING
            impact = "CRITICAL" if req.importance == "CRITICAL" else "HIGH"
            gap_title = f"Missing Evidence: {req.category.value.title()} Requirements Unaddressed"
            description = (
                f"None of the {len(sources)} ingested sources provided verifiable evidence addressing: "
                f"'{req.description}'."
            )
            suggested_action = (
                f"Contact the issuing authority or locate primary policy bulletin for {req.category.value} guidelines."
            )
            epistemic_note = (
                "Epistemic Distinction: This information was not located within the reviewed sources. "
                "This does NOT certify that the requirement does not exist; it highlights a critical research blindspot."
            )
        elif len(found_keywords) < 2 and req_category in [RequirementCategory.EXCEPTIONS, RequirementCategory.FINANCIAL]:
            status = CoverageStatus.PARTIALLY_SUPPORTED
            impact = "HIGH"
            gap_title = f"Incomplete Specification: {req.category.value.title()}"
            description = (
                f"Sources make reference to {', '.join(found_keywords)}, but lack exhaustive details on "
                f"exact thresholds, renewal terms, or exceptions."
            )
            suggested_action = (
                f"Verify specific numeric thresholds and renewal caveats directly with official records."
            )
            epistemic_note = (
                "Information is partially documented but lacks actionable completeness."
            )
        else:
            status = CoverageStatus.SUPPORTED
            impact = "LOW"
            gap_title = f"Documented: {req.category.value.title()}"
            description = f"Sufficient matching documentation identified for {req.description}."
            suggested_action = "Review backing evidence passages to ensure freshness."
            epistemic_note = "Documented in analyzed sources."

        req.coverage_status = status
        db.add(req)

        if status in [CoverageStatus.MISSING, CoverageStatus.PARTIALLY_SUPPORTED]:
            gap = InformationGap(
                id=str(uuid.uuid4()),
                investigation_id=investigation.id,
                requirement_id=req.id,
                gap_title=gap_title,
                description=description,
                category=req.category.value,
                classification=status,
                impact_level=impact,
                suggested_action=suggested_action,
                epistemic_note=epistemic_note
            )
            db.add(gap)
            created_gaps.append(gap)

    db.commit()
    return created_gaps
