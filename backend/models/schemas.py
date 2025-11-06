"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from datetime import datetime


class ResumeCreate(BaseModel):
    """Request model for creating a resume"""
    company_name: str = Field(..., min_length=1, description="Company name")
    position_name: str = Field(..., min_length=1, description="Job position/title")
    resume_json: Dict[str, Any] = Field(..., description="Resume data in JSON format")


class ResumeUpdate(BaseModel):
    """Request model for updating a resume"""
    company_name: Optional[str] = Field(None, min_length=1, description="Company name")
    position_name: Optional[str] = Field(None, min_length=1, description="Job position/title")
    resume_json: Optional[Dict[str, Any]] = Field(None, description="Resume data in JSON format")


class ResumeResponse(BaseModel):
    """Response model for a resume"""
    id: int
    company_name: str
    position_name: str
    resume_json: Dict[str, Any]
    ttl: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # For SQLAlchemy ORM compatibility


class ResumesListResponse(BaseModel):
    """Response model for list of resumes with pagination"""
    page: int
    page_size: int
    resumes: list[ResumeResponse]


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    message: str


class UserSettingCreate(BaseModel):
    """Request model for creating a user setting"""
    name: str = Field(..., min_length=1, max_length=255, description="Setting name (unique)")
    value: str = Field(..., description="Setting value (text)")


class UserSettingUpdate(BaseModel):
    """Request model for updating a user setting"""
    value: Optional[str] = Field(None, description="Setting value (text)")


class UserSettingResponse(BaseModel):
    """Response model for a user setting"""
    id: int
    name: str
    value: str
    ttl: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # For SQLAlchemy ORM compatibility


class UserSettingsListResponse(BaseModel):
    """Response model for list of user settings with pagination"""
    page: int
    page_size: int
    settings: list[UserSettingResponse]
