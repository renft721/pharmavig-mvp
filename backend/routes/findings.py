"""
API routes for Findings and approval workflow
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db, Finding, FindingComment, Finding Status, UserRole

router = APIRouter()

# ─────────────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────────────

class FindingCommentCreate(BaseModel):
    comment: str
    decision: str  # "approve", "reject", "request_more_info"

class FindingCommentResponse(BaseModel):
    id: str
    reviewer_name: str
    comment: str
    decision: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FindingCreate(BaseModel):
    drug_id: str
    source_id: str
    adverse_reaction: str
    frequency: Optional[str] = None
    severity: Optional[str] = None
    affected_population: dict = {}
    author_conclusion: Optional[str] = None
    study_type: str = "other"

class FindingResponse(BaseModel):
    id: str
    drug_id: str
    source_id: str
    adverse_reaction: str
    frequency: Optional[str]
    severity: Optional[str]
    affected_population: dict
    author_conclusion: Optional[str]
    study_type: str
    status: str
    extracted_date: datetime
    
    class Config:
        from_attributes = True

class FindingDetailResponse(FindingResponse):
    comments: List[FindingCommentResponse] = []
    
    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────
# Route handlers
# ─────────────────────────────────────────────────────

@router.post("", response_model=FindingResponse, status_code=status.HTTP_201_CREATED)
async def create_finding(
    finding: FindingCreate,
    db: Session = Depends(get_db)
):
    """Create a new finding (from extraction pipeline)"""
    
    new_finding = Finding(
        id=uuid.uuid4(),
        drug_id=uuid.UUID(finding.drug_id),
        source_id=uuid.UUID(finding.source_id),
        adverse_reaction=finding.adverse_reaction,
        frequency=finding.frequency,
        severity=finding.severity,
        affected_population=finding.affected_population,
        author_conclusion=finding.author_conclusion,
        study_type=finding.study_type,
        status=FindingStatus.PENDING_REVIEW
    )
    
    db.add(new_finding)
    db.commit()
    db.refresh(new_finding)
    
    return new_finding

@router.get("/pending", response_model=List[FindingResponse])
async def get_pending_findings(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get findings pending QPPV review (Approval Queue)"""
    
    findings = db.query(Finding).filter(
        Finding.status == FindingStatus.PENDING_REVIEW
    ).offset(skip).limit(limit).all()
    
    return findings

@router.get("/{finding_id}", response_model=FindingDetailResponse)
async def get_finding(
    finding_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific finding with comments"""
    
    try:
        finding_uuid = uuid.UUID(finding_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid finding ID format"
        )
    
    finding = db.query(Finding).filter(Finding.id == finding_uuid).first()
    
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found"
        )
    
    return finding

@router.post("/{finding_id}/approve", response_model=FindingResponse)
async def approve_finding(
    finding_id: str,
    comment_data: FindingCommentCreate,
    db: Session = Depends(get_db)
):
    """
    QPPV approves a finding
    (Updates status to APPROVED and saves to database)
    """
    
    try:
        finding_uuid = uuid.UUID(finding_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid finding ID format"
        )
    
    finding = db.query(Finding).filter(Finding.id == finding_uuid).first()
    
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found"
        )
    
    # Add comment
    comment = FindingComment(
        id=uuid.uuid4(),
        finding_id=finding_uuid,
        reviewer_name="QPPV",  # TODO: Get from auth token
        reviewer_role=UserRole.QPPV,
        comment=comment_data.comment,
        decision="approve"
    )
    
    # Update finding status
    finding.status = FindingStatus.APPROVED
    
    db.add(comment)
    db.commit()
    db.refresh(finding)
    
    return finding

@router.post("/{finding_id}/reject", response_model=FindingResponse)
async def reject_finding(
    finding_id: str,
    comment_data: FindingCommentCreate,
    db: Session = Depends(get_db)
):
    """
    QPPV rejects a finding
    (Does NOT save to database)
    """
    
    try:
        finding_uuid = uuid.UUID(finding_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid finding ID format"
        )
    
    finding = db.query(Finding).filter(Finding.id == finding_uuid).first()
    
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found"
        )
    
    # Add comment
    comment = FindingComment(
        id=uuid.uuid4(),
        finding_id=finding_uuid,
        reviewer_name="QPPV",  # TODO: Get from auth token
        reviewer_role=UserRole.QPPV,
        comment=comment_data.comment,
        decision="reject"
    )
    
    # Update finding status
    finding.status = FindingStatus.REJECTED
    
    db.add(comment)
    db.commit()
    db.refresh(finding)
    
    return finding

@router.post("/{finding_id}/comment", response_model=FindingCommentResponse)
async def add_comment(
    finding_id: str,
    comment_data: FindingCommentCreate,
    db: Session = Depends(get_db)
):
    """Add a comment to a finding (without approving/rejecting)"""
    
    try:
        finding_uuid = uuid.UUID(finding_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid finding ID format"
        )
    
    finding = db.query(Finding).filter(Finding.id == finding_uuid).first()
    
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found"
        )
    
    comment = FindingComment(
        id=uuid.uuid4(),
        finding_id=finding_uuid,
        reviewer_name="QPPV",  # TODO: Get from auth token
        reviewer_role=UserRole.QPPV,
        comment=comment_data.comment,
        decision="comment"
    )
    
    # Update status to UNDER_REVIEW if still pending
    if finding.status == FindingStatus.PENDING_REVIEW:
        finding.status = FindingStatus.UNDER_REVIEW
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return comment
