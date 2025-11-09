"""
API routes for resume CRUD operations
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from models.schemas import ResumeCreate, ResumeUpdate, ResumeResponse, ResumesListResponse
from db.models import Resume, UserSettings
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
        resume: Resume data (name must be unique)
        db: Database session

    Returns:
        Created resume with id and timestamps

    Raises:
        HTTPException 400: If resume name already exists
    """
    try:
        db_resume = Resume(
            name=resume.name,
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
            detail=f"Resume with name '{resume.name}' already exists"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("", response_model=ResumesListResponse)
async def get_resumes(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    name: Optional[str] = Query(None, description="Filter by resume name (keyword search, case-insensitive)"),
    db: Session = Depends(get_db_dependency)
):
    """
    Get all resumes with pagination and optional filtering

    Args:
        page: Page number (default 1)
        page_size: Items per page (default 10, max 100)
        name: Optional keyword search for resume name (case-insensitive partial match)
        db: Database session

    Returns:
        List of resumes for the current page (no total count for performance)
    """
    try:
        # Build query with filters
        query = db.query(Resume)

        # Apply name filter if provided (case-insensitive keyword search)
        if name:
            query = query.filter(Resume.name.ilike(f"%{name}%"))

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
        HTTPException 400: If resume name conflicts with existing resume
    """
    try:
        # Find resume
        db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not db_resume:
            raise HTTPException(status_code=404, detail=f"Resume with id {resume_id} not found")

        if resume_update.name is not None:
            db_resume.name = resume_update.name
        if resume_update.resume_json is not None:
            db_resume.resume_json = resume_update.resume_json

        db.commit()
        db.refresh(db_resume)
        return db_resume
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Resume with name '{db_resume.name}' already exists"
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


@router.put("/{resume_id}/set-default", response_model=dict)
async def set_default_resume(
    resume_id: int,
    db: Session = Depends(get_db_dependency)
):
    """
    Set a resume as the default resume

    Args:
        resume_id: Resume ID to set as default
        db: Database session

    Returns:
        Success message with resume_id

    Raises:
        HTTPException 404: If resume not found
    """
    try:
        # Verify resume exists
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Update or create user_settings entry
        setting = db.query(UserSettings).filter(UserSettings.name == "default_resume").first()
        if setting:
            setting.value = str(resume_id)
        else:
            setting = UserSettings(name="default_resume", value=str(resume_id))
            db.add(setting)

        db.commit()
        return {"message": "Default resume updated", "resume_id": resume_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
