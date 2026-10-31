import json
from typing import Dict, Any, List
from app.models.investigation import Investigation, ResearchRequirement, CoverageStatus
from app.models.source import Source
from app.models.intelligence import InformationGap, Conflict, VerificationTask

def calculate_decision_readiness(
    requirements: List[ResearchRequirement],
    sources: List[Source],
    gaps: List[InformationGap],
    conflicts: List[Conflict],
    tasks: List[VerificationTask]
) -> Dict[str, Any]:
    """
    Explainable Decision Readiness Score calculation.
    Range: 0.0 to 100.0.
    """
    # 1. Requirement Coverage Component (Base 40 pts)
    total_reqs = max(len(requirements), 1)
    supported_reqs = sum(1 for r in requirements if r.coverage_status == CoverageStatus.SUPPORTED)
    partial_reqs = sum(1 for r in requirements if r.coverage_status == CoverageStatus.PARTIALLY_SUPPORTED)
    coverage_ratio = (supported_reqs * 1.0 + partial_reqs * 0.5) / total_reqs
    coverage_score = round(coverage_ratio * 40.0, 1)

    # 2. Source Diversity & Reliability Component (Base 25 pts)
    source_count = len(sources)
    if source_count == 0:
        source_score = 0.0
    elif source_count == 1:
        source_score = 12.0
    else:
        avg_rel = sum(s.reliability_score for s in sources) / source_count
        source_score = round(min(25.0, (15.0 + (source_count - 1) * 3.0) * avg_rel), 1)

    # 3. Freshness & Provenance (Base 15 pts)
    dated_sources = sum(1 for s in sources if s.publication_date)
    freshness_score = round((dated_sources / max(source_count, 1)) * 15.0, 1)

    # 4. Penalties
    # Contradictions penalty: 8 points per unresolved conflict
    conflict_penalty = min(25.0, len(conflicts) * 8.0)

    # Critical gaps penalty: 6 points per critical missing gap
    critical_gaps = sum(1 for g in gaps if g.impact_level == "CRITICAL")
    gap_penalty = min(25.0, critical_gaps * 6.0)

    # Unverified tasks penalty: 2 points per pending task
    pending_tasks = sum(1 for t in tasks if not t.is_completed)
    task_penalty = min(15.0, pending_tasks * 2.5)

    # Raw total calculation
    raw_score = (coverage_score + source_score + freshness_score) - (conflict_penalty + gap_penalty + task_penalty)
    final_score = max(0.0, min(100.0, round(raw_score, 1)))

    # Determine confidence band
    if final_score >= 80.0:
        band = "HIGH_READINESS"
        recommendation = "Research requirements are extensively documented with high source provenance."
    elif final_score >= 55.0:
        band = "MODERATE_READINESS"
        recommendation = "Core prerequisites identified, but pending conflicts or critical gaps require human verification."
    else:
        band = "INSUFFICIENT_READINESS"
        recommendation = "Severe information gaps, unresolved contradictions, or missing official sources make action premature."

    breakdown = {
        "score": final_score,
        "band": band,
        "recommendation": recommendation,
        "components": {
            "requirement_coverage": {"score": coverage_score, "max": 40.0, "details": f"{supported_reqs}/{total_reqs} supported"},
            "source_reliability": {"score": source_score, "max": 25.0, "details": f"{source_count} sources evaluated"},
            "temporal_freshness": {"score": freshness_score, "max": 15.0, "details": f"{dated_sources}/{source_count} dated sources"}
        },
        "penalties": {
            "unresolved_conflicts": {"deduction": conflict_penalty, "count": len(conflicts)},
            "critical_gaps": {"deduction": gap_penalty, "count": critical_gaps},
            "unverified_tasks": {"deduction": task_penalty, "count": pending_tasks}
        },
        "limitations": [
            "This score represents document completeness across submitted sources, NOT a mathematical guarantee of real-world outcome.",
            "Sources not submitted to the platform were not evaluated.",
            "Official administrative discretion or unpublished internal criteria cannot be accounted for."
        ]
    }

    return breakdown
