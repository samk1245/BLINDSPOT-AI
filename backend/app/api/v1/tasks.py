import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.investigation import Investigation
from app.models.intelligence import VerificationTask, TaskStatus
from app.schemas.intelligence import VerificationTaskResponse, TaskUpdateRequest
from app.api.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Verification Copilot"])

@router.get("/{investigation_id}", response_model=List[VerificationTaskResponse])
def list_verification_tasks(
    investigation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_query = select(Investigation).where(Investigation.id == investigation_id, Investigation.user_id == current_user.id)
    if not db.execute(inv_query).scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

    tasks_query = (
        select(VerificationTask)
        .where(VerificationTask.investigation_id == investigation_id)
        .order_by(VerificationTask.is_completed.asc(), VerificationTask.created_at.desc())
    )
    return db.execute(tasks_query).scalars().all()

@router.patch("/{task_id}", response_model=VerificationTaskResponse)
def update_verification_task(
    task_id: str,
    body: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        select(VerificationTask)
        .join(Investigation)
        .where(VerificationTask.id == task_id, Investigation.user_id == current_user.id)
    )
    task = db.execute(query).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or access denied")

    if body.is_completed is not None:
        task.is_completed = body.is_completed
        task.completed_at = datetime.datetime.utcnow() if body.is_completed else None
        task.status = TaskStatus.VERIFIED if body.is_completed else TaskStatus.PENDING

    if body.status is not None:
        task.status = body.status
        if body.status == TaskStatus.VERIFIED:
            task.is_completed = True
            task.completed_at = datetime.datetime.utcnow()
        elif body.status == TaskStatus.PENDING:
            task.is_completed = False

    if body.notes is not None:
        task.notes = body.notes

    db.commit()
    return task
