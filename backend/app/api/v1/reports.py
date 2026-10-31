import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.investigation import Investigation
from app.models.report import InvestigationReport
from app.schemas.report import ReportResponse
from app.api.deps import get_current_user
from app.services.report_gen import generate_investigation_report_data, generate_styled_html_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/{investigation_id}/generate", response_model=ReportResponse)
def generate_report(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    inv = db.execute(inv_query).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    readiness = json.loads(inv.readiness_breakdown) if inv.readiness_breakdown else {}
    report_data = generate_investigation_report_data(
        inv, inv.requirements, inv.sources, inv.gaps, inv.conflicts, inv.tasks, readiness
    )
    report_json_str = json.dumps(report_data, indent=2)
    html_str = generate_styled_html_report(report_data)

    report_id = str(uuid.uuid4())
    report = InvestigationReport(
        id=report_id,
        investigation_id=inv.id,
        title=f"Intelligence Audit: {inv.title}",
        summary=f"Audit completed with Decision Readiness {inv.readiness_score}/100. Discovered {len(inv.gaps)} information gaps and {len(inv.conflicts)} cross-source contradictions.",
        report_json=report_json_str,
        html_content=html_str
    )
    db.add(report)
    db.commit()

    return ReportResponse(
        id=report.id,
        investigation_id=report.investigation_id,
        title=report.title,
        summary=report.summary,
        report_json=report.report_json,
        html_content=report.html_content,
        created_at=report.created_at.isoformat()
    )

@router.get("/{id}", response_model=ReportResponse)
def get_report(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(InvestigationReport)
        .join(Investigation)
        .where(InvestigationReport.id == id, Investigation.user_id == current_user.id)
    )
    report = db.execute(query).scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    return ReportResponse(
        id=report.id,
        investigation_id=report.investigation_id,
        title=report.title,
        summary=report.summary,
        report_json=report.report_json,
        html_content=report.html_content,
        created_at=report.created_at.isoformat()
    )

@router.get("/{id}/download-html")
def download_report_html(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(InvestigationReport)
        .join(Investigation)
        .where(InvestigationReport.id == id, Investigation.user_id == current_user.id)
    )
    report = db.execute(query).scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    return Response(
        content=report.html_content,
        media_type="text/html",
        headers={"Content-Disposition": f"attachment; filename=Blindspot_Report_{report.id[:8]}.html"}
    )
