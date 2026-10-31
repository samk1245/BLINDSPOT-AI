import uuid
from typing import List
from sqlalchemy.orm import Session
from app.models.investigation import (
    Investigation,
    ResearchRequirement,
    RequirementCategory,
    RequirementImportance,
    CoverageStatus
)
from app.services.ai_provider import ai_provider

def decompose_investigation_goal(
    db: Session,
    investigation: Investigation
) -> List[ResearchRequirement]:
    prompt = f"""
    Research Question: {investigation.research_question}
    Research Objective: {investigation.objective}
    Domain: {investigation.domain}
    """
    system_instruction = """
    You are an expert epistemic research investigator.
    Decompose the user's research goal into 4 to 8 essential, atomic information requirements.
    Return JSON matching:
    {
      "requirements": [
        {
          "category": "ELIGIBILITY" | "FINANCIAL" | "DOCUMENTATION" | "DEADLINES" | "PROCEDURES" | "EXCEPTIONS" | "GENERAL",
          "description": "string",
          "importance": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
          "expected_evidence": "string",
          "verification_criteria": "string"
        }
      ]
    }
    """

    data = ai_provider.generate_json_sync(prompt, system_instruction)
    reqs_data = data.get("requirements", [])

    created_requirements = []
    for item in reqs_data:
        category_str = item.get("category", "GENERAL").upper()
        try:
            category = RequirementCategory(category_str)
        except ValueError:
            category = RequirementCategory.GENERAL

        importance_str = item.get("importance", "HIGH").upper()
        try:
            importance = RequirementImportance(importance_str)
        except ValueError:
            importance = RequirementImportance.HIGH

        req = ResearchRequirement(
            id=str(uuid.uuid4()),
            investigation_id=investigation.id,
            category=category,
            description=item.get("description", "Mandatory requirement"),
            importance=importance,
            expected_evidence=item.get("expected_evidence", "Official documentation"),
            verification_criteria=item.get("verification_criteria", "Verification against source records"),
            coverage_status=CoverageStatus.UNVERIFIED
        )
        db.add(req)
        created_requirements.append(req)

    db.commit()
    return created_requirements
