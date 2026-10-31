import enum
import datetime
from sqlalchemy import String, Text, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class RequirementCategory(str, enum.Enum):
    ELIGIBILITY = "ELIGIBILITY"
    FINANCIAL = "FINANCIAL"
    DOCUMENTATION = "DOCUMENTATION"
    DEADLINES = "DEADLINES"
    PROCEDURES = "PROCEDURES"
    EXCEPTIONS = "EXCEPTIONS"
    GENERAL = "GENERAL"

class RequirementImportance(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class CoverageStatus(str, enum.Enum):
    SUPPORTED = "SUPPORTED"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    MISSING = "MISSING"
    CONFLICTING = "CONFLICTING"
    POTENTIALLY_OUTDATED = "POTENTIALLY_OUTDATED"
    UNVERIFIED = "UNVERIFIED"

class InvestigationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ANALYZING = "ANALYZING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Investigation(Base):
    __tablename__ = "investigations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    research_question: Mapped[str] = mapped_column(Text, nullable=False)
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="General", nullable=False)
    status: Mapped[InvestigationStatus] = mapped_column(Enum(InvestigationStatus), default=InvestigationStatus.DRAFT, nullable=False)
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    readiness_breakdown: Mapped[str] = mapped_column(Text, default="{}", nullable=False)  # JSON serialized metrics
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="investigations")
    requirements: Mapped[list["ResearchRequirement"]] = relationship("ResearchRequirement", back_populates="investigation", cascade="all, delete-orphan")
    sources: Mapped[list["Source"]] = relationship("Source", back_populates="investigation", cascade="all, delete-orphan")
    gaps: Mapped[list["InformationGap"]] = relationship("InformationGap", back_populates="investigation", cascade="all, delete-orphan")
    conflicts: Mapped[list["Conflict"]] = relationship("Conflict", back_populates="investigation", cascade="all, delete-orphan")
    tasks: Mapped[list["VerificationTask"]] = relationship("VerificationTask", back_populates="investigation", cascade="all, delete-orphan")
    reports: Mapped[list["InvestigationReport"]] = relationship("InvestigationReport", back_populates="investigation", cascade="all, delete-orphan")

class ResearchRequirement(Base):
    __tablename__ = "research_requirements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    investigation_id: Mapped[str] = mapped_column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), index=True, nullable=False)
    category: Mapped[RequirementCategory] = mapped_column(Enum(RequirementCategory), default=RequirementCategory.GENERAL, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    importance: Mapped[RequirementImportance] = mapped_column(Enum(RequirementImportance), default=RequirementImportance.HIGH, nullable=False)
    expected_evidence: Mapped[str] = mapped_column(Text, nullable=False)
    verification_criteria: Mapped[str] = mapped_column(Text, nullable=False)
    coverage_status: Mapped[CoverageStatus] = mapped_column(Enum(CoverageStatus), default=CoverageStatus.UNVERIFIED, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="requirements")
