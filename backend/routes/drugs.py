"""
API routes for Drug management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import uuid

from database import get_db, Drug, Finding

router = APIRouter()

# ─────────────────────────────────────────────────────
# Pydantic schemas for request/response
# ─────────────────────────────────────────────────────

class DrugCreate(BaseModel):
    active_ingredient: str
    brand_names: List[str] = []
    atc_code: str = None

class DrugResponse(BaseModel):
    id: str
    active_ingredient: str
    brand_names: List[str]
    atc_code: str = None
    
    class Config:
        from_attributes = True

class DrugDetailResponse(DrugResponse):
    finding_count: int = 0
    
    class Config:
        from_attributes = True

# ─────────────────────────────────────────────────────
# Route handlers
# ─────────────────────────────────────────────────────

@router.post("", response_model=DrugResponse, status_code=status.HTTP_201_CREATED)
async def create_drug(
    drug: DrugCreate,
    db: Session = Depends(get_db)
):
    """Create a new drug record"""
    
    # Check if drug already exists
    existing = db.query(Drug).filter(
        Drug.active_ingredient == drug.active_ingredient
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Drug '{drug.active_ingredient}' already exists"
        )
    
    new_drug = Drug(
        id=uuid.uuid4(),
        active_ingredient=drug.active_ingredient,
        brand_names=drug.brand_names,
        atc_code=drug.atc_code
    )
    
    db.add(new_drug)
    db.commit()
    db.refresh(new_drug)
    
    return new_drug

@router.get("", response_model=List[DrugResponse])
async def list_drugs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all drugs (paginated)"""
    
    drugs = db.query(Drug).offset(skip).limit(limit).all()
    return drugs

@router.get("/{drug_id}", response_model=DrugDetailResponse)
async def get_drug(
    drug_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific drug and its findings"""
    
    try:
        drug_uuid = uuid.UUID(drug_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid drug ID format"
        )
    
    drug = db.query(Drug).filter(Drug.id == drug_uuid).first()
    
    if not drug:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drug not found"
        )
    
    finding_count = db.query(Finding).filter(Finding.drug_id == drug_uuid).count()
    
    response = DrugDetailResponse(
        **drug.__dict__,
        finding_count=finding_count
    )
    
    return response

@router.get("/search/{drug_name}", response_model=List[DrugResponse])
async def search_drugs(
    drug_name: str,
    db: Session = Depends(get_db)
):
    """Search drugs by name (case-insensitive partial match)"""
    
    drugs = db.query(Drug).filter(
        Drug.active_ingredient.ilike(f"%{drug_name}%")
    ).all()
    
    return drugs

@router.delete("/{drug_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_drug(
    drug_id: str,
    db: Session = Depends(get_db)
):
    """Delete a drug (cascade deletes findings)"""
    
    try:
        drug_uuid = uuid.UUID(drug_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid drug ID format"
        )
    
    drug = db.query(Drug).filter(Drug.id == drug_uuid).first()
    
    if not drug:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drug not found"
        )
    
    db.delete(drug)
    db.commit()
    
    return None
