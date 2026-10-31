from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ResumeCreate(BaseModel):
    title: str = Field(..., description="Resume Title")
    target_role: str = Field("Software Engineer", description="Target Job Role")
    target_company: Optional[str] = None
    resume_data: Dict[str, Any] = Field(..., description="Structured Resume JSON")


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None
    latest_score: Optional[int] = None
    create_version: bool = False
    changelog: Optional[str] = None


class ResumeContentUpdate(BaseModel):
    resume_data: Dict[str, Any]
    create_version: bool = False
    changelog: Optional[str] = None


class ResumeVersionCreate(BaseModel):
    changelog: Optional[str] = "Manual snapshot"
    resume_snapshot: Optional[Dict[str, Any]] = None


class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    version_number: int
    changelog: Optional[str]
    resume_snapshot: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    target_role: str
    target_company: Optional[str]
    resume_data: Dict[str, Any]
    latest_score: Optional[int]
    created_at: datetime
    updated_at: datetime
    version_count: Optional[int] = 1

    class Config:
        from_attributes = True
