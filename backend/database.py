"""
Database models and ORM setup for pharmacovigilance system
"""

from sqlalchemy import create_engine, Column, String, Text, DateTime, Enum, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid
import enum

from config import settings

# Database engine
engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─────────────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────────────

class SourceType(str, enum.Enum):
    AERZTEBLATT = "aerzteblatt"
    PDF = "pdf"
    WEB = "web"
    EMA = "ema"
    FAERS = "faers"
    PUBMED = "pubmed"

class FindingStatus(str, enum.Enum):
    PENDING_REVIEW = "pending_review"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class Severity(str, enum.Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    FATAL = "fatal"

class StudyType(str, enum.Enum):
    RCT = "rct"
    OBSERVATIONAL = "observational"
    CASE_REPORT = "case_report"
    REVIEW = "review"
    OTHER = "other"

class AuditAction(str, enum.Enum):
    INSERT = "insert"
    UPDATE = "update"
    DELETE = "delete"
    APPROVE = "approve"
    REJECT = "reject"
    COMMENT = "comment"

class UserRole(str, enum.Enum):
    ANALYST = "analyst"
    QPPV = "qppv"  # Qualified Person for Pharmacovigilance
    ADMIN = "admin"

# ─────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────

class Drug(Base):
    """Representation of a drug/active ingredient"""
    __tablename__ = "drugs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    active_ingredient = Column(String(255), unique=True, nullable=False, index=True)
    brand_names = Column(JSON, default=[])  # Array of brand names
    atc_code = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    findings = relationship("Finding", back_populates="drug", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Drug {self.active_ingredient}>"

class Source(Base):
    """A document/article source"""
    __tablename__ = "sources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String(512), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    source_type = Column(Enum(SourceType), nullable=False)
    published_date = Column(DateTime, nullable=True)
    language = Column(String(5), default="en")  # ISO 639-1 code
    accessed_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    raw_content = Column(Text, nullable=True)  # For audit trail
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    findings = relationship("Finding", back_populates="source", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Source {self.title}>"

class Finding(Base):
    """An extracted safety-relevant finding"""
    __tablename__ = "findings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    drug_id = Column(UUID(as_uuid=True), ForeignKey("drugs.id"), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False, index=True)
    
    # Extracted information
    adverse_reaction = Column(String(255), nullable=False)
    frequency = Column(String(100), nullable=True)  # e.g., "rare", "1 in 10,000"
    severity = Column(Enum(Severity), nullable=True)
    affected_population = Column(JSON, default={})  # {age_group, gender, comorbidities, etc.}
    author_conclusion = Column(Text, nullable=True)
    study_type = Column(Enum(StudyType), nullable=False, default=StudyType.OTHER)
    
    # Status
    status = Column(Enum(FindingStatus), default=FindingStatus.PENDING_REVIEW, nullable=False, index=True)
    
    # Timestamps
    extracted_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    drug = relationship("Drug", back_populates="findings")
    source = relationship("Source", back_populates="findings")
    comments = relationship("FindingComment", back_populates="finding", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Finding {self.adverse_reaction}>"

class FindingComment(Base):
    """Comments/reviews on findings from QPPV"""
    __tablename__ = "finding_comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finding_id = Column(UUID(as_uuid=True), ForeignKey("findings.id"), nullable=False, index=True)
    
    reviewer_name = Column(String(255), nullable=False)  # QPPV name
    reviewer_role = Column(Enum(UserRole), default=UserRole.QPPV, nullable=False)
    comment = Column(Text, nullable=True)
    decision = Column(String(50), nullable=False)  # "approve", "reject", "request_more_info"
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    finding = relationship("Finding", back_populates="comments")
    
    def __repr__(self):
        return f"<FindingComment by {self.reviewer_name}>"

class AuditLog(Base):
    """Immutable audit trail (GVP Module VI compliance)"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # What changed
    table_name = Column(String(100), nullable=False, index=True)
    record_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    action = Column(Enum(AuditAction), nullable=False, index=True)
    
    # Before/after state
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    
    # Who did it
    user_id = Column(String(100), nullable=True)
    user_name = Column(String(255), nullable=True)
    user_role = Column(Enum(UserRole), nullable=True)
    
    # When and where
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 support
    
    def __repr__(self):
        return f"<AuditLog {self.action} on {self.table_name}>"
