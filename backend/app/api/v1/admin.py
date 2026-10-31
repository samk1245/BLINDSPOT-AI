from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User
from app.models.investigation import Investigation
from app.models.source import Source
from app.models.intelligence import InformationGap, Conflict, VerificationTask
from app.models.audit import AuditLog
from app.api.deps import require_admin
from app.schemas.auth import UserProfileResponse

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/dashboard")
def get_admin_dashboard_metrics(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    total_users = db.execute(select(func.count(User.id))).scalar_one()
    total_investigations = db.execute(select(func.count(Investigation.id))).scalar_one()
    total_sources = db.execute(select(func.count(Source.id))).scalar_one()
    total_gaps = db.execute(select(func.count(InformationGap.id))).scalar_one()
    total_conflicts = db.execute(select(func.count(Conflict.id))).scalar_one()
    total_tasks = db.execute(select(func.count(VerificationTask.id))).scalar_one()

    recent_logs = db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(15)).scalars().all()

    return {
        "metrics": {
            "total_users": total_users,
            "total_investigations": total_investigations,
            "total_sources_analyzed": total_sources,
            "total_information_gaps": total_gaps,
            "total_contradictions": total_conflicts,
            "total_verification_tasks": total_tasks
        },
        "recent_audit_events": [
            {
                "id": log.id,
                "action": log.action,
                "user_id": log.user_id,
                "resource_type": log.resource_type,
                "ip_address": log.ip_address,
                "details": log.details,
                "timestamp": log.created_at.isoformat()
            }
            for log in recent_logs
        ]
    }

@router.get("/users", response_model=List[UserProfileResponse])
def list_all_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.execute(select(User).order_by(User.created_at.desc())).scalars().all()
    return [
        UserProfileResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at.isoformat()
        )
        for u in users
    ]

@router.get("/audit-logs")
def get_all_audit_logs(
    limit: int = 50,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)).scalars().all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "user_id": l.user_id,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "ip_address": l.ip_address,
            "details": l.details,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]
