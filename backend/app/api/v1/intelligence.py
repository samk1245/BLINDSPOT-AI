from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.investigation import Investigation, ResearchRequirement
from app.models.source import Source
from app.models.intelligence import InformationGap, Conflict
from app.schemas.investigation import RequirementResponse
from app.schemas.intelligence import InformationGapResponse, ConflictResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])

@router.get("/{investigation_id}/requirements", response_model=List[RequirementResponse])
def get_requirements(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    if not db.execute(inv_query).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    query = select(ResearchRequirement).where(ResearchRequirement.investigation_id == investigation_id)
    reqs = db.execute(query).scalars().all()
    return reqs

@router.get("/{investigation_id}/gaps", response_model=List[InformationGapResponse])
def get_gaps(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    if not db.execute(inv_query).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    query = select(InformationGap).where(InformationGap.investigation_id == investigation_id)
    return db.execute(query).scalars().all()

@router.get("/{investigation_id}/conflicts", response_model=List[ConflictResponse])
def get_conflicts(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    if not db.execute(inv_query).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    query = select(Conflict).where(Conflict.investigation_id == investigation_id)
    return db.execute(query).scalars().all()

@router.get("/{investigation_id}/graph")
def get_evidence_traceability_graph(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    inv = db.execute(inv_query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    nodes = []
    edges = []

    # 1. Root Node (Investigation Objective)
    root_node_id = f"inv-{inv.id}"
    nodes.append({
        "id": root_node_id,
        "type": "input",
        "data": {
            "label": inv.title,
            "type": "OBJECTIVE",
            "subtitle": inv.research_question,
            "domain": inv.domain,
            "readiness": inv.readiness_score
        },
        "position": {"x": 500, "y": 40}
    })

    # 2. Requirement Nodes
    y_req = 180
    for idx, req in enumerate(inv.requirements):
        req_node_id = f"req-{req.id}"
        x_pos = 100 + (idx * 220)
        nodes.append({
            "id": req_node_id,
            "data": {
                "label": f"[{req.category.value}]",
                "description": req.description,
                "importance": req.importance.value,
                "status": req.coverage_status.value,
                "type": "REQUIREMENT"
            },
            "position": {"x": x_pos, "y": y_req}
        })
        edges.append({
            "id": f"e-{root_node_id}-{req_node_id}",
            "source": root_node_id,
            "target": req_node_id,
            "animated": True,
            "style": {"stroke": "#38bdf8", "strokeWidth": 2}
        })

    # 3. Source Nodes
    y_source = 360
    for idx, src in enumerate(inv.sources):
        src_node_id = f"src-{src.id}"
        x_pos = 200 + (idx * 340)
        sample_passage = src.passages[0].text if src.passages else src.raw_content[:200]
        nodes.append({
            "id": src_node_id,
            "data": {
                "label": src.title,
                "type": "SOURCE",
                "sourceType": src.source_type.value,
                "domain": src.domain,
                "date": src.publication_date or "Unspecified",
                "fingerprint": src.content_hash[:10] + "...",
                "evidenceSnippet": sample_passage
            },
            "position": {"x": x_pos, "y": y_source}
        })

    # 4. Gap Nodes
    y_gap = 520
    for idx, gap in enumerate(inv.gaps):
        gap_node_id = f"gap-{gap.id}"
        x_pos = 150 + (idx * 260)
        nodes.append({
            "id": gap_node_id,
            "data": {
                "label": f"GAP: {gap.gap_title}",
                "type": "GAP",
                "classification": gap.classification.value,
                "impact": gap.impact_level,
                "description": gap.description,
                "epistemicNote": gap.epistemic_note
            },
            "position": {"x": x_pos, "y": y_gap}
        })
        if gap.requirement_id:
            edges.append({
                "id": f"e-req{gap.requirement_id}-{gap_node_id}",
                "source": f"req-{gap.requirement_id}",
                "target": gap_node_id,
                "style": {"stroke": "#f59e0b", "strokeDasharray": "5,5"}
            })

    # 5. Conflict Nodes
    y_conflict = 680
    for idx, conf in enumerate(inv.conflicts):
        conf_node_id = f"conf-{conf.id}"
        nodes.append({
            "id": conf_node_id,
            "data": {
                "label": f"CONFLICT: {conf.conflict_type.value}",
                "type": "CONFLICT",
                "claimA": conf.claim_a_text,
                "claimB": conf.claim_b_text,
                "sourceA": conf.source_a_title,
                "sourceB": conf.source_b_title,
                "explanation": conf.difference_explanation,
                "priority": conf.priority.value
            },
            "position": {"x": 350 + (idx * 300), "y": y_conflict}
        })

    return {
        "investigation_id": inv.id,
        "nodes": nodes,
        "edges": edges
    }
