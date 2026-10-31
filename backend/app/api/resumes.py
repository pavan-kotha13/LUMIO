from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import User, Resume, ResumeVersion
from ..schemas.resume_schema import (
    ResumeCreate,
    ResumeUpdate,
    ResumeContentUpdate,
    ResumeResponse,
    ResumeVersionCreate,
    ResumeVersionResponse,
)
from ..schemas.analysis_schema import ImprovementRequest, ImprovementResponse
from ..services.resume_service import resume_db_service
from ..services.gemini_service import gemini_central_service
from ..services.truthguard import truthguard_service
from ..services.export_service import export_service
from .deps import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("", response_model=ResumeResponse)
def create_resume(
    payload: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = resume_db_service.create_resume(db, current_user.id, payload)
    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        target_company=resume.target_company,
        resume_data=resume.resume_data,
        latest_score=resume.latest_score,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
        version_count=1
    )


@router.get("", response_model=List[ResumeResponse])
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resumes = resume_db_service.get_user_resumes(db, current_user.id)
    out = []
    for r in resumes:
        out.append(
            ResumeResponse(
                id=r.id,
                user_id=r.user_id,
                title=r.title,
                target_role=r.target_role,
                target_company=r.target_company,
                resume_data=r.resume_data,
                latest_score=r.latest_score,
                created_at=r.created_at,
                updated_at=r.updated_at,
                version_count=len(r.versions) if r.versions else 1
            )
        )
    return out


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = resume_db_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")
    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        target_company=resume.target_company,
        resume_data=resume.resume_data,
        latest_score=resume.latest_score,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
        version_count=len(resume.versions) if resume.versions else 1
    )


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: str,
    payload: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = resume_db_service.update_resume(db, resume_id, current_user.id, payload)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")
    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        target_company=resume.target_company,
        resume_data=resume.resume_data,
        latest_score=resume.latest_score,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
        version_count=len(resume.versions) if resume.versions else 1
    )


@router.put("/{resume_id}/content", response_model=ResumeResponse)
def update_resume_content(
    resume_id: str,
    payload: ResumeContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = ResumeUpdate(
        resume_data=payload.resume_data,
        create_version=payload.create_version,
        changelog=payload.changelog or "Editor update"
    )
    resume = resume_db_service.update_resume(db, resume_id, current_user.id, update_data)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")
    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        target_company=resume.target_company,
        resume_data=resume.resume_data,
        latest_score=resume.latest_score,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
        version_count=len(resume.versions) if resume.versions else 1
    )


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = resume_db_service.delete_resume(db, resume_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")
    return {"message": "Resume deleted successfully", "id": resume_id}


# =============================================================================
# VERSIONS
# =============================================================================
@router.post("/{resume_id}/versions", response_model=ResumeVersionResponse)
def create_version(
    resume_id: str,
    payload: ResumeVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    version = resume_db_service.create_version(
        db,
        resume_id,
        current_user.id,
        payload.changelog,
        payload.resume_snapshot
    )
    if not version:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")
    return ResumeVersionResponse.from_orm(version)


@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
def get_versions(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    versions = resume_db_service.get_versions(db, resume_id, current_user.id)
    return [ResumeVersionResponse.from_orm(v) for v in versions]


# =============================================================================
# AI IMPROVEMENT WITH TRUTHGUARD
# =============================================================================
@router.post("/{resume_id}/improve", response_model=ImprovementResponse)
def improve_resume_with_ai(
    resume_id: str,
    payload: ImprovementRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = resume_db_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    jd_text = payload.job_description or "General Software Engineering Position"
    weaknesses = payload.weakness_categories or ["Quantifiable Metrics", "Technical Impact"]

    ai_result = gemini_central_service.improve_resume(resume.resume_data, jd_text, weaknesses)
    raw_improvements = ai_result.get("improvements", [])

    # If Gemini returned empty or was unavailable, use deterministic XYZ improvements
    if not raw_improvements:
        exp_list = resume.resume_data.get("experience", [])
        for exp in exp_list:
            for b in exp.get("bullets", [])[:2]:
                opt_bullet = f"Architected and delivered {b[:1].lower() + b[1:]}, resulting in measurable efficiency gains"
                raw_improvements.append({
                    "id": f"imp_{len(raw_improvements) + 1}",
                    "section": "experience",
                    "original": b,
                    "suggested": opt_bullet
                })

    # Validate against TruthGuard
    validated_bullets = truthguard_service.sanitize_improvements(raw_improvements, resume.resume_data)

    resume_db_service.log_activity(
        db,
        user_id=current_user.id,
        activity_type="RESUME_IMPROVED",
        description=f"Generated {len(validated_bullets)} TruthGuard-verified improvements for '{resume.title}'"
    )
    db.commit()

    return ImprovementResponse(
        resume_id=resume.id,
        improvements=validated_bullets,
        summary_suggestion=ai_result.get("summary_suggestion"),
        truthguard_summary={
            "total_suggestions": len(validated_bullets),
            "supported": sum(1 for b in validated_bullets if b["truthguard_status"] == "SUPPORTED"),
            "needs_confirmation": sum(1 for b in validated_bullets if b["truthguard_status"] == "NEEDS_CONFIRMATION"),
            "unsupported": sum(1 for b in validated_bullets if b["truthguard_status"] == "UNSUPPORTED")
        }
    )


# =============================================================================
# EXPORT PDF AND DOCX
# =============================================================================
@router.get("/{resume_id}/export/docx")
def export_resume_docx(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = resume_db_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    docx_bytes = export_service.generate_docx(resume.resume_data)
    import re
    safe_title = re.sub(r'[^\w\-_.]', '_', resume.title).strip('_') or "Resume"
    filename = f"{safe_title}.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{resume_id}/export/pdf")
def export_resume_pdf(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = resume_db_service.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    pdf_bytes = export_service.generate_pdf(resume.resume_data)
    import re
    safe_title = re.sub(r'[^\w\-_.]', '_', resume.title).strip('_') or "Resume"
    filename = f"{safe_title}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.post("/export/pdf")
def export_raw_pdf(payload: dict):
    resume_data = payload.get("resume_data") or payload
    title = resume_data.get("title") or resume_data.get("personalInfo", {}).get("fullName") or "Resume"
    pdf_bytes = export_service.generate_pdf(resume_data)
    filename = f"{title.replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.post("/export/docx")
def export_raw_docx(payload: dict):
    resume_data = payload.get("resume_data") or payload
    title = resume_data.get("title") or resume_data.get("personalInfo", {}).get("fullName") or "Resume"
    docx_bytes = export_service.generate_docx(resume_data)
    filename = f"{title.replace(' ', '_')}.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
