"""
API routes for audit logs (read-only)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db, AuditLog, AuditAction, UserRole

router = APIRouter()

class AuditLogResponse(BaseModel):
    id: str
    table_name: str
    record_id: str
    action: str
    old_value: dict = None
    new_value: dict = None
    user_name: str = None
    user_role: str = None
    timestamp: datetime
    ip_address: str = None
    
    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get audit trail (read-only, for compliance)"""
    
    logs = db.query(AuditLog).order_by(
        AuditLog.timestamp.desc()
    ).offset(skip).limit(limit).all()
    
    return logs

@router.get("/{record_id}", response_model=List[AuditLogResponse])
async def get_record_audit_trail(
    record_id: str,
    db: Session = Depends(get_db)
):
    """Get audit trail for a specific record (GVP Module VI compliance)"""
    
    logs = db.query(AuditLog).filter(
        AuditLog.record_id == record_id
    ).order_by(AuditLog.timestamp.asc()).all()
    
    return logs
