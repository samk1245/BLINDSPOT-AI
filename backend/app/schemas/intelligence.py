from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.investigation import CoverageStatus
from app.models.intelligence import ConflictType, ConflictPriority, TaskPriority, TaskStatus

class InformationGapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    investigation_id: str
    requirement_id: Optional[str]
    gap_title: str
    description: str
    category: str
    classification: CoverageStatus
    impact_level: str
    suggested_action: str
    epistemic_note: str
    created_at: Any

class ConflictResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    investigation_id: str
    claim_a_id: Optional[str]
    claim_b_id: Optional[str]
    claim_a_text: str
    claim_b_text: str
    source_a_title: str
    source_b_title: str
    source_a_url: Optional[str]
    source_b_url: Optional[str]
    source_a_date: Optional[str]
    source_b_date: Optional[str]
    conflict_type: ConflictType
    difference_explanation: str
    priority: ConflictPriority
    resolution_guidance: str
    created_at: Any

class VerificationTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    investigation_id: str
    title: str
    reason_it_matters: str
    suggested_official_source: str
    supporting_evidence_snippet: Optional[str]
    priority: TaskPriority
    status: TaskStatus
    is_completed: bool
    completed_at: Optional[Any]
    notes: Optional[str]
    created_at: Any

class TaskUpdateRequest(BaseModel):
    is_completed: Optional[bool] = None
    status: Optional[TaskStatus] = None
    notes: Optional[str] = None
