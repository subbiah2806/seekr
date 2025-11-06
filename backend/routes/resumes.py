"""
API routes for resume CRUD operations
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from models.schemas import ResumeCreate, ResumeUpdate, ResumeResponse, ResumesListResponse
from db.models import Resume
from db.database import get_db_dependency

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


@router.post("", response_model=ResumeResponse, status_code=201)
async def create_resume(
    resume: ResumeCreate,
    db: Session = Depends(get_db_dependency)
):
    """
    Create a new resume

    Args:
        resume: Resume data (company_name + position_name must be unique)
        db: Database session

    Returns:
        Created resume with id and timestamps

    Raises:
        HTTPException 400: If company_name + position_name combination already exists
    """
    try:
        db_resume = Resume(
            company_name=resume.company_name,
            position_name=resume.position_name,
            resume_json=resume.resume_json
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        return db_resume
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Resume for company '{resume.company_name}' and position '{resume.position_name}' already exists"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("", response_model=ResumesListResponse)
async def get_resumes(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    company_name: Optional[str] = Query(None, description="Filter by company name (keyword search, case-insensitive)"),
    db: Session = Depends(get_db_dependency)
):
    """
    Get all resumes with pagination and optional filtering

    Args:
        page: Page number (default 1)
        page_size: Items per page (default 10, max 100)
        company_name: Optional keyword search for company name (case-insensitive partial match)
        db: Database session

    Returns:
        List of resumes for the current page (no total count for performance)
    """
    try:
        # Build query with filters
        query = db.query(Resume)

        # Apply company filter if provided (case-insensitive keyword search)
        if company_name:
            query = query.filter(Resume.company_name.ilike(f"%{company_name}%"))

        # Apply pagination directly to query
        offset = (page - 1) * page_size
        resumes = query.offset(offset).limit(page_size).all()

        return ResumesListResponse(
            page=page,
            page_size=page_size,
            resumes=resumes
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    db: Session = Depends(get_db_dependency)
):
    """
    Get a single resume by ID

    Args:
        resume_id: Resume ID
        db: Database session

    Returns:
        Resume data

    Raises:
        HTTPException 404: If resume not found
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail=f"Resume with id {resume_id} not found")
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: int,
    resume_update: ResumeUpdate,
    db: Session = Depends(get_db_dependency)
):
    """
    Update an existing resume

    Args:
        resume_id: Resume ID to update
        resume_update: Fields to update (only provided fields will be updated)
        db: Database session

    Returns:
        Updated resume

    Raises:
        HTTPException 404: If resume not found
        HTTPException 400: If company_name + position_name conflicts with existing resume
    """
    try:
        # Find resume
        db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not db_resume:
            raise HTTPException(status_code=404, detail=f"Resume with id {resume_id} not found")

        if resume_update.company_name is not None:
            db_resume.company_name = resume_update.company_name
        if resume_update.position_name is not None:
            db_resume.position_name = resume_update.position_name
        if resume_update.resume_json is not None:
            db_resume.resume_json = resume_update.resume_json

        db.commit()
        db.refresh(db_resume)
        return db_resume
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Resume for company '{db_resume.company_name}' and position '{db_resume.position_name}' already exists"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{resume_id}", status_code=204)
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db_dependency)
):
    """
    Delete a resume

    Args:
        resume_id: Resume ID to delete
        db: Database session

    Returns:
        No content (204)

    Raises:
        HTTPException 404: If resume not found
    """
    try:
        db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not db_resume:
            raise HTTPException(status_code=404, detail=f"Resume with id {resume_id} not found")

        db.delete(db_resume)
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
