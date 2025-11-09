"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field, EmailStr, HttpUrl
from typing import Any, Dict, Optional, Literal
from datetime import datetime


class ResumeCreate(BaseModel):
    """Request model for creating a resume"""
    name: str = Field(..., min_length=1, max_length=255, description="Resume name")
    resume_json: Dict[str, Any] = Field(..., description="Resume data in JSON format")


class ResumeUpdate(BaseModel):
    """Request model for updating a resume"""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Resume name")
    resume_json: Optional[Dict[str, Any]] = Field(None, description="Resume data in JSON format")


class ResumeResponse(BaseModel):
    """Response model for a resume"""
    id: int
    name: str
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


# Resume Chatbot Models

class ExperienceItem(BaseModel):
    """
    Single work experience entry

    Note: All fields are optional to support partial resume data from AI generation.
    Missing fields default to empty strings or arrays to prevent 422 validation errors.
    """
    company: str = Field(default="", description="Company name")
    location: str = Field(default="", description="Work location")
    position: str = Field(default="", description="Job position/title")
    startDate: str = Field(default="", description="Start date (YYYY-MM format)")
    endDate: str = Field(default="", description="End date (YYYY-MM format or 'Present')")
    achievements: list[str] = Field(default_factory=list, description="List of achievements")
    companyDescription: str = Field(default="", description="Brief company description")

    class Config:
        json_schema_extra = {
            "example": {
                "company": "Praetorian",
                "location": "Remote",
                "position": "Lead Software Developer",
                "startDate": "2023-09",
                "endDate": "2025-10",
                "achievements": [
                    "Architected multi-agent AI system",
                    "Conducted daily code reviews"
                ],
                "companyDescription": "Leading offensive cybersecurity company"
            }
        }


class EducationItem(BaseModel):
    """
    Single education entry

    Note: All fields are optional to support partial resume data from AI generation.
    Missing fields default to empty strings to prevent 422 validation errors.
    """
    institution: str = Field(default="", description="Educational institution name")
    degree: str = Field(default="", description="Degree obtained")
    startDate: str = Field(default="", description="Start date (YYYY-MM format)")
    endDate: str = Field(default="", description="End date (YYYY-MM format or 'Present')")

    class Config:
        json_schema_extra = {
            "example": {
                "institution": "Texas A&M University - Kingsville",
                "degree": "Master of Science",
                "startDate": "2016-08",
                "endDate": "2018-05"
            }
        }


class ResumeData(BaseModel):
    """
    Complete resume data structure

    Note: All fields are optional with default values to support partial resume data from AI generation.
    This prevents 422 validation errors when AI-generated JSON is incomplete.

    Default values:
    - Strings: "" (empty string)
    - Arrays: [] (empty list)
    - Booleans: False
    - Optional fields: None

    All fields can be incrementally populated through iterative chat conversations.
    """
    firstName: str = Field(default="", description="First name")
    lastName: str = Field(default="", description="Last name")
    email: str = Field(default="", description="Email address (no strict EmailStr validation to allow empty)")
    phone: str = Field(default="", description="Phone number")
    github: str = Field(default="", description="GitHub profile URL (no strict HttpUrl validation to allow empty)")
    website: str = Field(default="", description="Personal website URL (no strict HttpUrl validation to allow empty)")
    linkedin: str = Field(default="", description="LinkedIn profile URL (no strict HttpUrl validation to allow empty)")
    visaStatus: str = Field(default="", description="Visa status (e.g., 'H1B', 'Citizen', 'Green Card')")
    preferredLocations: list[str] = Field(default_factory=list, description="Preferred work locations")
    openToRemote: bool = Field(default=False, description="Open to remote work")
    experience: list[ExperienceItem] = Field(default_factory=list, description="Work experience history")
    skills: Dict[str, list[str]] = Field(default_factory=dict, description="Skills organized by category")
    education: list[EducationItem] = Field(default_factory=list, description="Educational background")
    summary: str = Field(default="", description="Professional summary")

    class Config:
        json_schema_extra = {
            "example": {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@example.com",
                "phone": "123-456-7890",
                "github": "https://github.com/johndoe",
                "website": "https://johndoe.com",
                "linkedin": "https://www.linkedin.com/in/johndoe/",
                "visaStatus": "Citizen",
                "preferredLocations": ["San Francisco, CA", "New York, NY"],
                "openToRemote": True,
                "experience": [],
                "skills": {
                    "Frontend": ["React", "TypeScript"],
                    "Backend": ["Python", "FastAPI"]
                },
                "education": [],
                "summary": "Experienced software developer with 5+ years of experience"
            }
        }


class ChatMessage(BaseModel):
    """Single chat message"""
    role: Literal["user", "assistant"] = Field(..., description="Message role (user or assistant)")
    content: str = Field(..., min_length=1, description="Message content")
    resume: Optional[Dict[str, Any]] = Field(None, description="Resume context to send to AI with this message")

    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Help me create a resume for a software engineering position",
                "resume": None
            }
        }


class ChatRequest(BaseModel):
    """Request for chat endpoint"""
    messages: list[ChatMessage] = Field(..., min_items=1, description="Chat message history")
    file_content: Optional[str] = Field(None, description="Extracted text from uploaded file (resume, job description, etc.)")

    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {
                        "role": "user",
                        "content": "Help me create a resume",
                        "resume": None
                    }
                ],
                "file_content": None
            }
        }


class ChatResponse(BaseModel):
    """
    Response from chat endpoint

    Contains both the resume JSON and optional AI suggestions/questions.
    The response field is only populated when AI has questions or suggestions for the user.
    """
    resume_json: ResumeData = Field(..., description="Generated or updated resume data (always present)")
    response: Optional[str] = Field(None, description="Optional AI suggestions, questions, or feedback for the user (only populated when AI has something to say)")
    message: str = Field(default="Resume generated successfully", description="System message (deprecated, use response instead)")

    class Config:
        json_schema_extra = {
            "example": {
                "resume_json": {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john.doe@example.com",
                    "phone": "123-456-7890",
                    "github": "https://github.com/johndoe",
                    "website": "https://johndoe.com",
                    "linkedin": "https://www.linkedin.com/in/johndoe/",
                    "visaStatus": None,
                    "preferredLocations": None,
                    "openToRemote": None,
                    "experience": [],
                    "skills": {},
                    "education": [],
                    "summary": "Professional summary"
                },
                "response": "I noticed your resume is missing a professional summary. Would you like me to help create one based on your experience?",
                "message": "Resume generated successfully"
            }
        }
