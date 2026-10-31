from typing import Any
from pydantic import BaseModel, ConfigDict

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    investigation_id: str
    title: str
    summary: str
    report_json: str
    html_content: str
    created_at: Any
