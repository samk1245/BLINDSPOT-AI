import uuid
import re
from typing import List
from sqlalchemy.orm import Session
from app.models.investigation import Investigation
from app.models.source import Source
from app.models.intelligence import Conflict, ConflictType, ConflictPriority

def detect_cross_source_conflicts(
    db: Session,
    investigation: Investigation,
    sources: List[Source]
) -> List[Conflict]:
    if len(sources) < 2:
        return []

    created_conflicts = []
    source_facts = []

    for s in sources:
        text = s.raw_content
        money_matches = re.findall(r"\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)", text)
        gpa_matches = re.findall(r"(?:gpa|grade point average)[\s:]*([0-4]\.[0-9]+)", text, re.IGNORECASE)
        dates = re.findall(r"(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}", text, re.IGNORECASE)

        source_facts.append({
            "source": s,
            "money": list(set(money_matches)),
            "gpa": list(set(gpa_matches)),
            "dates": list(set(dates))
        })

    for i in range(len(source_facts)):
        for j in range(i + 1, len(source_facts)):
            sf1 = source_facts[i]
            sf2 = source_facts[j]
            s1 = sf1["source"]
            s2 = sf2["source"]

            # Financial discrepancy check
            if sf1["money"] and sf2["money"] and sf1["money"][0] != sf2["money"][0]:
                amt1 = sf1["money"][0]
                amt2 = sf2["money"][0]
                c_type = ConflictType.TEMPORAL_SUPERSEDED if (s1.publication_date and s2.publication_date and s1.publication_date != s2.publication_date) else ConflictType.DIRECT_FACTUAL
                
                conflict = Conflict(
                    id=str(uuid.uuid4()),
                    investigation_id=investigation.id,
                    claim_a_text=f"Maximum family income ceiling is specified as ${amt1}.",
                    claim_b_text=f"Income limitation threshold is cited as ${amt2}.",
                    source_a_title=s1.title,
                    source_b_title=s2.title,
                    source_a_url=s1.url,
                    source_b_url=s2.url,
                    source_a_date=s1.publication_date or "Date Unspecified",
                    source_b_date=s2.publication_date or "Date Unspecified",
                    conflict_type=c_type,
                    difference_explanation=(
                        f"Source A quotes ${amt1} whereas Source B states ${amt2}. "
                        "This may stem from updated financial brackets for the newer fiscal cycle or differing eligibility tiers."
                    ),
                    priority=ConflictPriority.CRITICAL,
                    resolution_guidance="Consult the official gazette or portal financial schedule before submitting income verification documents."
                )
                db.add(conflict)
                created_conflicts.append(conflict)

            # GPA discrepancy check
            if sf1["gpa"] and sf2["gpa"] and sf1["gpa"][0] != sf2["gpa"][0]:
                gpa1 = sf1["gpa"][0]
                gpa2 = sf2["gpa"][0]
                conflict = Conflict(
                    id=str(uuid.uuid4()),
                    investigation_id=investigation.id,
                    claim_a_text=f"Minimum required academic standing is GPA {gpa1}.",
                    claim_b_text=f"Academic eligibility standard requires GPA {gpa2}.",
                    source_a_title=s1.title,
                    source_b_title=s2.title,
                    source_a_url=s1.url,
                    source_b_url=s2.url,
                    source_a_date=s1.publication_date or "Unspecified",
                    source_b_date=s2.publication_date or "Unspecified",
                    conflict_type=ConflictType.SCOPE_DIFFERENCE,
                    difference_explanation=(
                        f"Divergence in academic benchmark ({gpa1} vs {gpa2}). "
                        "Verify whether one reflects cumulative college GPA while the other pertains to high school graduation."
                    ),
                    priority=ConflictPriority.HIGH,
                    resolution_guidance="Request clarification from academic advisor regarding cumulative vs incoming threshold."
                )
                db.add(conflict)
                created_conflicts.append(conflict)

    db.commit()
    return created_conflicts
