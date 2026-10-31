import enum
import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class SourceType(str, enum.Enum):
    URL = "URL"
    PDF = "PDF"
    OFFICIAL_PORTAL = "OFFICIAL_PORTAL"
    RESEARCH_REPORT = "RESEARCH_REPORT"

class SourceStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARSED = "PARSED"
    FAILED = "FAILED"

class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    investigation_id: Mapped[str] = mapped_column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), index=True, nullable=False)
    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType), default=SourceType.URL, nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=True)
    retrieval_timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    publication_date: Mapped[str] = mapped_column(String(100), nullable=True)
    last_updated_date: Mapped[str] = mapped_column(String(100), nullable=True)
    raw_content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256
    reliability_score: Mapped[float] = mapped_column(Float, default=0.8, nullable=False)
    status: Mapped[SourceStatus] = mapped_column(Enum(SourceStatus), default=SourceStatus.PARSED, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="sources")
    passages: Mapped[list["EvidencePassage"]] = relationship("EvidencePassage", back_populates="source", cascade="all, delete-orphan")
    claims: Mapped[list["ExtractedClaim"]] = relationship("ExtractedClaim", back_populates="source", cascade="all, delete-orphan")

class EvidencePassage(Base):
    __tablename__ = "evidence_passages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), index=True, nullable=False)
    passage_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    char_offset_start: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    char_offset_end: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    source: Mapped["Source"] = relationship("Source", back_populates="passages")

class ExtractedClaim(Base):
    __tablename__ = "extracted_claims"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), index=True, nullable=False)
    passage_id: Mapped[str] = mapped_column(String(36), nullable=True)
    claim_text: Mapped[str] = mapped_column(Text, nullable=False)
    topic_category: Mapped[str] = mapped_column(String(100), default="General", nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.9, nullable=False)
    is_temporal: Mapped[bool] = mapped_column(default=False, nullable=False)
    temporal_date: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    source: Mapped["Source"] = relationship("Source", back_populates="claims")
