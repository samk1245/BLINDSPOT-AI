import enum
import datetime
from sqlalchemy import String, Text, Float, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.investigation import CoverageStatus

class ConflictType(str, enum.Enum):
    DIRECT_FACTUAL = "DIRECT_FACTUAL"
    TEMPORAL_SUPERSEDED = "TEMPORAL_SUPERSEDED"
    SCOPE_DIFFERENCE = "SCOPE_DIFFERENCE"
    CONDITIONAL_DIFFERENCE = "CONDITIONAL_DIFFERENCE"

class ConflictPriority(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class TaskPriority(str, enum.Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    NORMAL = "NORMAL"

class TaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    DISMISSED = "DISMISSED"

class InformationGap(Base):
    __tablename__ = "information_gaps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    investigation_id: Mapped[str] = mapped_column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), index=True, nullable=False)
    requirement_id: Mapped[str] = mapped_column(String(36), nullable=True)
    gap_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="General", nullable=False)
    classification: Mapped[CoverageStatus] = mapped_column(Enum(CoverageStatus), default=CoverageStatus.MISSING, nullable=False)
    impact_level: Mapped[str] = mapped_column(String(50), default="HIGH", nullable=False)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)
    epistemic_note: Mapped[str] = mapped_column(Text, nullable=False)  # Note distinguishing missing in source vs non-existent
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="gaps")

class Conflict(Base):
    __tablename__ = "conflicts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    investigation_id: Mapped[str] = mapped_column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), index=True, nullable=False)
    claim_a_id: Mapped[str] = mapped_column(String(36), nullable=True)
    claim_b_id: Mapped[str] = mapped_column(String(36), nullable=True)
    claim_a_text: Mapped[str] = mapped_column(Text, nullable=False)
    claim_b_text: Mapped[str] = mapped_column(Text, nullable=False)
    source_a_title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_b_title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_a_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    source_b_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    source_a_date: Mapped[str] = mapped_column(String(100), nullable=True)
    source_b_date: Mapped[str] = mapped_column(String(100), nullable=True)
    conflict_type: Mapped[ConflictType] = mapped_column(Enum(ConflictType), default=ConflictType.DIRECT_FACTUAL, nullable=False)
    difference_explanation: Mapped[Text] = mapped_column(Text, nullable=False)
    priority: Mapped[ConflictPriority] = mapped_column(Enum(ConflictPriority), default=ConflictPriority.HIGH, nullable=False)
    resolution_guidance: Mapped[Text] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="conflicts")

class VerificationTask(Base):
    __tablename__ = "verification_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    investigation_id: Mapped[str] = mapped_column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    reason_it_matters: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_official_source: Mapped[str] = mapped_column(String(500), nullable=False)
    supporting_evidence_snippet: Mapped[str] = mapped_column(Text, nullable=True)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.HIGH, nullable=False)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="tasks")
