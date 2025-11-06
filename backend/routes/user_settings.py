"""
API routes for user settings CRUD operations
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from models.schemas import UserSettingCreate, UserSettingUpdate, UserSettingResponse, UserSettingsListResponse
from db.models import UserSettings
from db.database import get_db_dependency

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.post("", response_model=UserSettingResponse, status_code=201)
async def create_setting(
    setting: UserSettingCreate,
    db: Session = Depends(get_db_dependency)
):
    """
    Create a new user setting

    Args:
        setting: Setting data (name must be unique)
        db: Database session

    Returns:
        Created setting with id and timestamps

    Raises:
        HTTPException 400: If setting name already exists
    """
    try:
        db_setting = UserSettings(
            name=setting.name,
            value=setting.value
        )
        db.add(db_setting)
        db.commit()
        db.refresh(db_setting)
        return db_setting
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Setting with name '{setting.name}' already exists"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("", response_model=UserSettingsListResponse)
async def get_settings(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    name: Optional[str] = Query(None, description="Filter by setting name (keyword search, case-insensitive)"),
    db: Session = Depends(get_db_dependency)
):
    """
    Get all user settings with pagination and optional filtering

    Args:
        page: Page number (default 1)
        page_size: Items per page (default 10, max 100)
        name: Optional keyword search for setting name (case-insensitive partial match)
        db: Database session

    Returns:
        List of settings for the current page (no total count for performance)
    """
    try:
        # Build query with filters
        query = db.query(UserSettings)

        # Apply name filter if provided (case-insensitive keyword search)
        if name:
            query = query.filter(UserSettings.name.ilike(f"%{name}%"))

        # Apply pagination directly to query
        offset = (page - 1) * page_size
        settings = query.offset(offset).limit(page_size).all()

        return UserSettingsListResponse(
            page=page,
            page_size=page_size,
            settings=settings
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{setting_id}", response_model=UserSettingResponse)
async def get_setting(
    setting_id: int,
    db: Session = Depends(get_db_dependency)
):
    """
    Get a single user setting by ID

    Args:
        setting_id: Setting ID
        db: Database session

    Returns:
        Setting data

    Raises:
        HTTPException 404: If setting not found
    """
    setting = db.query(UserSettings).filter(UserSettings.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting with id {setting_id} not found")
    return setting


@router.get("/name/{setting_name}", response_model=UserSettingResponse)
async def get_setting_by_name(
    setting_name: str,
    db: Session = Depends(get_db_dependency)
):
    """
    Get a single user setting by name

    Args:
        setting_name: Setting name
        db: Database session

    Returns:
        Setting data

    Raises:
        HTTPException 404: If setting not found
    """
    setting = db.query(UserSettings).filter(UserSettings.name == setting_name).first()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting with name '{setting_name}' not found")
    return setting


@router.put("/{setting_id}", response_model=UserSettingResponse)
async def update_setting(
    setting_id: int,
    setting_update: UserSettingUpdate,
    db: Session = Depends(get_db_dependency)
):
    """
    Update an existing user setting

    Args:
        setting_id: Setting ID to update
        setting_update: Fields to update (only provided fields will be updated)
        db: Database session

    Returns:
        Updated setting

    Raises:
        HTTPException 404: If setting not found
    """
    try:
        # Find setting
        db_setting = db.query(UserSettings).filter(UserSettings.id == setting_id).first()
        if not db_setting:
            raise HTTPException(status_code=404, detail=f"Setting with id {setting_id} not found")

        # Update fields if provided
        if setting_update.value is not None:
            db_setting.value = setting_update.value

        db.commit()
        db.refresh(db_setting)
        return db_setting
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{setting_id}", status_code=204)
async def delete_setting(
    setting_id: int,
    db: Session = Depends(get_db_dependency)
):
    """
    Delete a user setting

    Args:
        setting_id: Setting ID to delete
        db: Database session

    Returns:
        No content (204)

    Raises:
        HTTPException 404: If setting not found
    """
    try:
        db_setting = db.query(UserSettings).filter(UserSettings.id == setting_id).first()
        if not db_setting:
            raise HTTPException(status_code=404, detail=f"Setting with id {setting_id} not found")

        db.delete(db_setting)
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
