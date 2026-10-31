from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.source import SourceType, SourceStatus

class SourceURLCreateRequest(BaseModel):
    investigation_id: str
    url: str = Field(description="Must be a valid HTTP or HTTPS public URL")
    title: Optional[str] = Field(default=None, max_length=500)

class EvidencePassageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_id: str
    passage_index: int
    text: str
    char_offset_start: int
    char_offset_end: int

class ExtractedClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_id: str
    passage_id: Optional[str]
    claim_text: str
    topic_category: str
    confidence_score: float
    is_temporal: bool
    temporal_date: Optional[str]

class SourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    investigation_id: str
    source_type: SourceType
    url: Optional[str]
    title: str
    domain: Optional[str]
    retrieval_timestamp: Any
    publication_date: Optional[str]
    last_updated_date: Optional[str]
    content_hash: str
    reliability_score: float
    status: SourceStatus
    passages: List[EvidencePassageResponse] = []
    claims: List[ExtractedClaimResponse] = []
