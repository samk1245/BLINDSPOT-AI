import pytest
from app.models.investigation import ResearchRequirement, RequirementCategory, RequirementImportance, CoverageStatus
from app.models.source import Source, SourceType, SourceStatus
from app.models.intelligence import InformationGap, Conflict, ConflictType, ConflictPriority, VerificationTask, TaskPriority, TaskStatus
from app.services.readiness import calculate_decision_readiness

def test_decision_readiness_calculation_and_penalties():
    req1 = ResearchRequirement(
        id="r1",
        investigation_id="inv1",
        category=RequirementCategory.ELIGIBILITY,
        description="GPA requirement",
        importance=RequirementImportance.CRITICAL,
        expected_evidence="Official policy",
        verification_criteria="Min 3.5 GPA",
        coverage_status=CoverageStatus.SUPPORTED
    )
    req2 = ResearchRequirement(
        id="r2",
        investigation_id="inv1",
        category=RequirementCategory.FINANCIAL,
        description="Income ceiling",
        importance=RequirementImportance.CRITICAL,
        expected_evidence="Tax transcript",
        verification_criteria="Income < $65,000",
        coverage_status=CoverageStatus.PARTIALLY_SUPPORTED
    )

    source1 = Source(
        id="s1",
        investigation_id="inv1",
        source_type=SourceType.OFFICIAL_PORTAL,
        title="Department Bulletin",
        publication_date="2026-01-10",
        raw_content="Content",
        content_hash="abc123hash",
        reliability_score=0.95,
        status=SourceStatus.PARSED
    )

    # 1. Test calculation with zero conflicts or gaps
    res = calculate_decision_readiness(
        requirements=[req1, req2],
        sources=[source1],
        gaps=[],
        conflicts=[],
        tasks=[]
    )
    assert res["score"] > 0
    assert "band" in res
    assert "components" in res
    assert "limitations" in res

    # 2. Test calculation with conflicts and severe gaps (penalties applied)
    conflict = Conflict(
        id="c1",
        investigation_id="inv1",
        claim_a_text="Income limit is $65,000",
        claim_b_text="Income limit is $50,000",
        source_a_title="Source A",
        source_b_title="Source B",
        conflict_type=ConflictType.DIRECT_FACTUAL,
        difference_explanation="Discrepancy",
        priority=ConflictPriority.CRITICAL,
        resolution_guidance="Verify"
    )
    gap = InformationGap(
        id="g1",
        investigation_id="inv1",
        gap_title="Missing Renewal Policy",
        description="No mention of renewal",
        category="EXCEPTIONS",
        classification=CoverageStatus.MISSING,
        impact_level="CRITICAL",
        suggested_action="Check handbook",
        epistemic_note="Not found"
    )

    penalized_res = calculate_decision_readiness(
        requirements=[req1, req2],
        sources=[source1],
        gaps=[gap],
        conflicts=[conflict],
        tasks=[]
    )
    # The score must be strictly less than the clean score due to penalties
    assert penalized_res["score"] < res["score"]
    assert penalized_res["penalties"]["unresolved_conflicts"]["count"] == 1
    assert penalized_res["penalties"]["critical_gaps"]["count"] == 1
