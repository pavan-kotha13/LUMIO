import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import User, Resume, ResumeAnalysis
from ..schemas.analysis_schema import ReviewRequest, AnalysisResponse
from ..services.resume_parser import resume_parser_service
from ..services.jd_parser import jd_parser_service
from ..services.score_engine import score_engine
from ..services.evidence_map import evidence_map_service
from ..services.gemini_service import gemini_central_service
from ..services.resume_service import resume_db_service
from ..services.truthguard import truthguard_service
from ..services.quality_analyzer import quality_analyzer_service
from .deps import get_current_user_optional

router = APIRouter(prefix="/analysis", tags=["Analysis & Scoring Engine"])


@router.post("/quality-check")
def quality_check_resume(payload: Dict[str, Any]):
    """Analyzes resume across 4 quality quadrants: Content, Structure, ATS, and Professional."""
    resume_data = payload.get("resume_data") or payload
    raw_text = payload.get("raw_text") or payload.get("resumeText") or ""
    return quality_analyzer_service.analyze_quality(resume_data, raw_text)


@router.post("/truthguard/validate")
def validate_claims_with_truthguard(payload: Dict[str, Any]):
    """Validates claims against candidate facts, flagging unverified numbers and unsupported tech."""
    raw_claims = payload.get("claims") or payload.get("bullets", [])
    candidate_facts = payload.get("candidate_facts") or payload.get("resume_data", {})
    results = []
    for c in raw_claims:
        if isinstance(c, str):
            orig = c
            sugg = c
        else:
            orig = c.get("original", "")
            sugg = c.get("suggested", c.get("claim", ""))
        val = truthguard_service.validate_bullet_improvement(orig, sugg, candidate_facts)
        results.append({
            "original": orig,
            "original_bullet": orig,
            "suggested": sugg,
            "suggested_improvement": sugg,
            "truthguard_status": val["status"],
            "verification_rationale": val["rationale"],
            "rationale": val["rationale"],
            "can_auto_apply": val["can_auto_apply"]
        })
    return {"validations": results, "results": results}


@router.post("/upload")
async def upload_resume_file(file: UploadFile = File(...)):
    """Uploads PDF, DOCX, or TXT file, extracts text and parsed structure with validation."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    ext = file.filename.lower().split(".")[-1]
    if ext not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF, DOCX, or TXT file.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(contents) > 10 * 1024 * 1024:  # 10 MB strict limit
        raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")

    raw_text = ""
    is_scanned = False
    page_count = 1
    try:
        if ext == "pdf":
            raw_text, page_count, is_scanned = resume_parser_service.extract_text_from_pdf(contents)
        elif ext == "docx":
            raw_text, page_count = resume_parser_service.extract_text_from_docx(contents)
        else:
            raw_text = contents.decode("utf-8", errors="ignore")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract document contents: {str(e)}")

    if not raw_text.strip() and not is_scanned:
        raise HTTPException(status_code=400, detail="Uploaded file contains no readable text.")

    structured_data = resume_parser_service.parse_raw_text_to_structure(raw_text, is_scanned=is_scanned)

    return {
        "filename": file.filename,
        "pageCount": page_count,
        "charCount": len(raw_text),
        "rawText": raw_text,
        "is_scanned": is_scanned,
        "requires_ocr": is_scanned,
        "structuredData": structured_data
    }


@router.post("/review", response_model=AnalysisResponse)
@router.post("/score-engine/analyze", response_model=AnalysisResponse)
def review_resume(
    payload: ReviewRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Core Evaluation Endpoint:
    Executes independent Resume Score Engine (deterministic weights),
    generates EvidenceMap, and validates against job description.
    """
    job_desc = payload.target_job_description or payload.jobDescription or ""
    if not job_desc or len(job_desc.strip()) < 10:
        raise HTTPException(status_code=400, detail="Job description is required and must contain at least 10 characters.")

    resume_data = payload.resume_data or {}
    raw_text = payload.raw_resume_text or payload.resumeText or ""
    target_role = payload.target_role or "Software Engineer"

    # If resume_id is provided and user is authenticated, load resume
    target_resume = None
    if payload.resume_id and current_user:
        target_resume = resume_db_service.get_resume_by_id(db, payload.resume_id, current_user.id)
        if target_resume:
            resume_data = target_resume.resume_data

    # Optional semantic enrichment from Gemini (does not dictate numerical score)
    semantic_review = gemini_central_service.review_resume(raw_text, job_desc)

    # Deterministic Score Engine Execution
    score_result = score_engine.calculate_score(
        resume_data=resume_data,
        raw_resume_text=raw_text,
        job_description=job_desc,
        semantic_evidence=semantic_review
    )

    # EvidenceMap Generation
    evidence_items = evidence_map_service.generate_evidence_map(
        resume_data=resume_data,
        raw_text=raw_text,
        matched_skills=score_result.get("matched_skills", []),
        unmatched_skills=score_result.get("unmatched_skills", []),
        semantic_evidence=semantic_review
    )

    # Quality Audit Generation
    quality_report = quality_analyzer_service.analyze_quality(resume_data, raw_text)

    analysis_id = f"eval_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow()

    # Save to SQLite DB if user is authenticated and resume is linked
    if current_user and target_resume:
        analysis_record = ResumeAnalysis(
            id=analysis_id,
            resume_id=target_resume.id,
            target_role=target_role or target_resume.target_role,
            target_job_description=job_desc,
            overall_score=score_result["overall_score"],
            category_scores=score_result["category_scores"],
            matched_requirements=score_result["matched_requirements"],
            partially_matched=score_result["partially_matched"],
            unmentioned_requirements=score_result["unmentioned_requirements"],
            evidence_map=evidence_items,
            recommendations=score_result["recommendations"],
            scoring_explanation=score_result["scoring_explanation"],
            analysis_date=now
        )
        db.add(analysis_record)
        target_resume.latest_score = score_result["overall_score"]
        resume_db_service.log_activity(
            db,
            user_id=current_user.id,
            activity_type="RESUME_ANALYZED",
            description=f"Evaluated '{target_resume.title}' (Score: {score_result['overall_score']}%)"
        )
        db.commit()

    return AnalysisResponse(
        id=analysis_id,
        resume_id=payload.resume_id,
        target_role=target_role,
        jobTitle=target_role,
        companyName=payload.companyName,
        resumeFileName=payload.resumeFileName,
        overall_score=score_result["overall_score"],
        overallScore=score_result["overallScore"],
        score_grade=score_result["score_grade"],
        scoreGrade=score_result["scoreGrade"],
        category_scores=score_result["category_scores"],
        categories=score_result["category_scores"],
        matched_requirements=score_result["matched_requirements"],
        partially_matched=score_result["partially_matched"],
        unmentioned_requirements=score_result["unmentioned_requirements"],
        missing_keywords=score_result.get("missing_keywords", []),
        missingKeywords=score_result.get("missingKeywords", []),
        skill_gaps=score_result.get("skill_gaps", []),
        skillGaps=score_result.get("skillGaps", []),
        evidence_map=evidence_items,
        evidenceMap=evidence_items,
        recommendations=score_result["recommendations"],
        scoring_explanation=score_result["scoring_explanation"],
        methodologyNotes="Score computed using the Resume Architect 6-Pillar Weighted Alignment Formula. Overall score is the exact weighted arithmetic mean of all 6 pillars.",
        quality_report=quality_report,
        qualityReport=quality_report,
        analyzed_at=now,
        evaluatedAt=now.isoformat()
    )


@router.get("/{analysis_id}")
def get_analysis_by_id(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "target_role": analysis.target_role,
        "overall_score": analysis.overall_score,
        "category_scores": analysis.category_scores,
        "matched_requirements": analysis.matched_requirements,
        "partially_matched": analysis.partially_matched,
        "unmentioned_requirements": analysis.unmentioned_requirements,
        "evidence_map": analysis.evidence_map,
        "recommendations": analysis.recommendations,
        "scoring_explanation": analysis.scoring_explanation,
        "analyzed_at": analysis.analysis_date
    }
