from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.investigation import (
    InvestigationStatus,
    RequirementCategory,
    RequirementImportance,
    CoverageStatus
)

class RequirementCreate(BaseModel):
    category: RequirementCategory
    description: str
    importance: RequirementImportance = RequirementImportance.HIGH
    expected_evidence: str
    verification_criteria: str

class RequirementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category: RequirementCategory
    description: str
    importance: RequirementImportance
    expected_evidence: str
    verification_criteria: str
    coverage_status: CoverageStatus
    created_at: Any

class InvestigationCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    research_question: str = Field(min_length=5)
    objective: str = Field(min_length=5)
    domain: str = Field(default="General", max_length=100)

class InvestigationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    research_question: str
    objective: str
    domain: str
    status: InvestigationStatus
    readiness_score: float
    readiness_breakdown: str
    created_at: Any
    updated_at: Any
    requirements_count: Optional[int] = 0
    sources_count: Optional[int] = 0
    gaps_count: Optional[int] = 0
    conflicts_count: Optional[int] = 0
    tasks_count: Optional[int] = 0
