from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models import Resume, ResumeVersion, User
from backend.app.api.auth import get_current_user
from backend.app.schemas.resume_schema import ResumeContentUpdateRequest, ResumeResponse
from backend.app.services.resume_service import update_resume_content, get_resume_by_id

router = APIRouter(prefix="/api/resumes", tags=["editor"])

@router.get("/{resume_id}/content")
def get_resume_content(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = get_resume_by_id(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return {
        "id": resume.id,
        "title": resume.title,
        "targetRole": resume.target_role,
        "targetCompany": resume.target_company,
        "summary": resume.summary,
        "contactInfo": resume.contact_info,
        "skills": resume.skills,
        "experience": resume.experience,
        "education": resume.education,
        "projects": resume.projects,
        "certifications": resume.certifications,
        "score": resume.score,
        "updatedAt": resume.updated_at
    }

@router.put("/{resume_id}/content")
def save_resume_content(
    resume_id: str,
    request: ResumeContentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = update_resume_content(db, resume_id, request)
    if not updated:
        raise HTTPException(status_code=404, detail="Resume not found")

    return {
        "message": "Content updated successfully",
        "resume": updated
    }
