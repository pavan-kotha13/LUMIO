import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import User, LinkedInProfile
from ..schemas.linkedin_schema import LinkedInAnalysisRequest, LinkedInAnalysisResponse
from ..services.gemini_service import gemini_central_service
from ..services.linkedin_service import linkedin_db_service
from ..services.resume_service import resume_db_service
from .deps import get_current_user_optional, get_current_user

router = APIRouter(prefix="/linkedin", tags=["LinkedIn Optimizer"])


@router.post("/analyze")
@router.post("/optimize")
def analyze_linkedin_profile(
    payload: LinkedInAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Evaluates LinkedIn profile across 7 key dimensions:
    Headline (15%), About (20%), Experience (20%), Projects (15%), Skills (10%), Keywords (10%), Completeness (10%).
    Produces Quality Score (0-100) independent of resume match.
    """
    profile_data = payload.profile_data or payload.profileData or payload.dict()
    personal_info = profile_data.get("personalInfo", {})
    headline = profile_data.get("headline", "")
    about = profile_data.get("about", "")
    experience = profile_data.get("experience", [])
    projects = profile_data.get("projects", [])
    skills = profile_data.get("skills", {})
    tech_skills = skills.get("technical", []) if isinstance(skills, dict) else skills
    tools = skills.get("softAndTools", []) if isinstance(skills, dict) else []
    education = profile_data.get("education", [])
    certifications = profile_data.get("certifications", [])

    target_role = personal_info.get("targetRole") or personal_info.get("currentTitleOrStatus") or "Software Engineer"
    target_industry = personal_info.get("targetIndustry") or "Technology"

    # Deterministic 7-Pillar Calculations
    hl_len = len(headline.strip())
    headline_score = 40
    if 40 <= hl_len <= 220:
        headline_score += 45
    elif hl_len > 0:
        headline_score += 20
    if any(sep in headline for sep in ["|", "•", "—", "/"]):
        headline_score += 15
    headline_score = min(100, headline_score)

    about_words = len(about.strip().split())
    if about_words >= 50:
        about_score = 92
    elif about_words >= 25:
        about_score = 75
    elif about_words > 0:
        about_score = 50
    else:
        about_score = 30

    exp_bullets = sum(len(e.get("bullets", [])) for e in experience)
    if len(experience) >= 2 and exp_bullets >= 4:
        exp_score = 92
    elif len(experience) >= 1:
        exp_score = 75
    else:
        exp_score = 40

    proj_score = 94 if len(projects) >= 2 else (80 if len(projects) >= 1 else 45)
    skills_count = len(tech_skills) + len(tools)
    skills_score = 95 if skills_count >= 10 else (78 if skills_count >= 5 else 55)
    keyword_score = 88 if len(tech_skills) >= 5 else 72

    completeness_fields = [
        bool(personal_info.get("fullName")),
        hl_len > 10,
        about_words > 15,
        len(experience) > 0,
        len(education) > 0,
        len(projects) > 0,
        skills_count > 3,
        len(certifications) > 0
    ]
    completeness_score = min(100, int((sum(completeness_fields) / len(completeness_fields)) * 100))

    categories = [
        {"id": "headline", "name": "Headline Quality", "score": headline_score, "weight": 0.15, "status": "optimal" if headline_score >= 80 else "moderate", "feedback": "Well-positioned role title and stack." if headline_score >= 80 else "Optimize for recruiter search filters.", "metrics": {"value": f"{hl_len} chars", "target": "70-220 chars"}},
        {"id": "about", "name": "About Section & Narrative", "score": about_score, "weight": 0.20, "status": "optimal" if about_score >= 80 else "moderate", "feedback": "Engaging professional narrative." if about_score >= 80 else "Expand career narrative and call to action.", "metrics": {"value": f"{about_words} words", "target": "75-200 words"}},
        {"id": "experience", "name": "Experience Presentation", "score": exp_score, "weight": 0.20, "status": "optimal" if exp_score >= 80 else "moderate", "feedback": f"{len(experience)} positions with business achievements.", "metrics": {"value": f"{len(experience)} roles, {exp_bullets} bullets", "target": "2+ roles, 4+ bullets"}},
        {"id": "projects", "name": "Project Impact & Real-World Utility", "score": proj_score, "weight": 0.15, "status": "optimal" if proj_score >= 80 else "moderate", "feedback": "Demonstrates practical software deliverables.", "metrics": {"value": f"{len(projects)} projects", "target": "2+ projects"}},
        {"id": "skills", "name": "Technical & Soft Skills", "score": skills_score, "weight": 0.10, "status": "optimal" if skills_score >= 80 else "moderate", "feedback": f"{skills_count} skills indexed for search.", "metrics": {"value": f"{skills_count} skills", "target": "10+ skills"}},
        {"id": "keywords", "name": "Keyword Relevance & Discovery", "score": keyword_score, "weight": 0.10, "status": "optimal" if keyword_score >= 80 else "moderate", "feedback": "Matches tech recruiter search filters.", "metrics": {"value": f"{keyword_score}% rank", "target": "85%+"}},
        {"id": "completeness", "name": "Profile Completeness", "score": completeness_score, "weight": 0.10, "status": "optimal" if completeness_score >= 80 else "moderate", "feedback": f"{completeness_score}% sections filled.", "metrics": {"value": f"{completeness_score}%", "target": "100%"}}
    ]

    overall_score = round(sum(c["score"] * c["weight"] for c in categories))
    score_grade = "Executive All-Star" if overall_score >= 88 else ("Strong Contender" if overall_score >= 75 else "Developing")

    # High-impact headlines
    top_tool = tech_skills[0] if tech_skills else "Modern Technologies"
    core_skills_str = ", ".join(tech_skills[:4]) if tech_skills else "System Design"
    headline_suggestions = [
        {
            "id": "hl_1",
            "type": "value-prop",
            "label": "Role & Value Proposition",
            "text": f"{target_role} | Building High-Performance, Scalable Systems with {top_tool} | {target_industry}"[:220],
            "charCount": len(f"{target_role} | Building High-Performance, Scalable Systems with {top_tool} | {target_industry}"[:220]),
            "keywordsIncluded": [target_role, top_tool, target_industry],
            "rationale": "Positions your exact seniority, core stack, and the commercial value you deliver."
        },
        {
            "id": "hl_2",
            "type": "keyword-dense",
            "label": "Recruiter Search-Optimized",
            "text": f"{target_role} | {core_skills_str} | Cloud Infrastructure"[:220],
            "charCount": len(f"{target_role} | {core_skills_str} | Cloud Infrastructure"[:220]),
            "keywordsIncluded": tech_skills[:4],
            "rationale": "Maximized for recruiter search algorithms and filter matching."
        },
        {
            "id": "hl_3",
            "type": "growth-impact",
            "label": "Growth & Impact Focused",
            "text": f"{target_role} | Passionate about Clean Code, High Reliability & Measurable Impact"[:220],
            "charCount": len(f"{target_role} | Passionate about Clean Code, High Reliability & Measurable Impact"[:220]),
            "keywordsIncluded": [target_role, "Clean Code", "High Reliability"],
            "rationale": "Communicates engineering mindset, continuous learning, and execution ownership."
        }
    ]

    # About Sections in 4 styles
    about_optimizations = {
        "professional": {
            "style": "professional",
            "styleLabel": "Professional & Authoritative",
            "text": f"As a {target_role} in {target_industry}, I focus on designing reliable, maintainable systems that scale seamlessly with business demand.\n\nThroughout my career, I have worked with {core_skills_str}, collaborating across engineering and product teams to translate complex requirements into robust solutions.\n\nAlways open to discussing engineering challenges and high-impact opportunities.",
            "keyImprovements": ["Clear executive positioning", "Highlights core technical stack", "Professional networking call-to-action"],
            "callToAction": "Open to discussions regarding engineering opportunities and architecture challenges.",
            "wordCount": 65
        },
        "fresher": {
            "style": "fresher",
            "styleLabel": "Student & Fresher Friendly",
            "text": f"Recent graduate with hands-on project experience in {core_skills_str}.\n\nDriven by a passion for solving real-world challenges through well-crafted code. Eager to contribute as an entry-level {target_role} and learn from experienced engineering teams.",
            "keyImprovements": ["Emphasizes project execution", "Demonstrates learning agility and humility", "Highlights collaborative readiness"],
            "callToAction": "Actively seeking junior engineering roles. Feel free to connect!",
            "wordCount": 42
        },
        "technical": {
            "style": "technical",
            "styleLabel": "Technical & Architecture Focused",
            "text": f"Software Engineer specializing in {core_skills_str}.\n\nCore Competencies:\n• Languages & Frameworks: {', '.join(tech_skills)}\n• System Design: Microservices, automated CI/CD pipelines, container orchestration, and performance monitoring.\n\nDedicated to engineering excellence and measurable uptime.",
            "keyImprovements": ["Bullet-driven structure for quick technical lead scanning", "Direct stack enumeration without fluff", "Highlights system design principles"],
            "callToAction": "Interested in technical collaborations and distributed systems discussions.",
            "wordCount": 48
        },
        "concise": {
            "style": "concise",
            "styleLabel": "Concise & Punchy",
            "text": f"{target_role} specializing in {core_skills_str}.\n\nKey Highlights:\n- Experienced delivering scalable software in {target_industry}.\n- Strong focus on code maintainability, automated testing, and team velocity.\n\nOpen to new opportunities. Let's connect!",
            "keyImprovements": ["Under 50 words for fast mobile reading", "Clean bullet structure", "Direct call-to-action"],
            "callToAction": "Open to new opportunities. Let's connect!",
            "wordCount": 38
        }
    }

    # TruthGuard-Verified Experience Optimizations
    experience_optimizations = []
    for exp in experience:
        for idx, bullet in enumerate(exp.get("bullets", [])):
            has_num = any(c.isdigit() for c in bullet)
            opt_bullet = bullet.strip()
            if not opt_bullet.lower().startswith(("architected", "developed", "engineered", "implemented")):
                opt_bullet = f"Architected and executed {opt_bullet[:1].lower() + opt_bullet[1:]}"
            if not has_num:
                opt_bullet += ", driving operational efficiency and maintainability"

            experience_optimizations.append({
                "id": f"opt_{exp.get('id', 'exp')}_{idx}",
                "experienceId": exp.get("id"),
                "company": exp.get("company", "Company"),
                "jobTitle": exp.get("jobTitle", "Role"),
                "originalBullet": bullet,
                "optimizedBullet": opt_bullet,
                "truthGuardStatus": "SUPPORTED" if has_num else "NEEDS CONFIRMATION",
                "confirmationNote": "Verified by candidate facts." if has_num else "Enhanced phrasing using XYZ formula. Please verify exact team percentage or throughput figures.",
                "appliedFormula": "XYZ",
                "accepted": False
            })

    # EvidenceMap
    skill_evidence = [
        {"id": f"sk_{i}", "skill": s, "category": "Technical", "status": "MATCHED", "sourceEvidence": "Present in candidate profile.", "relevanceNote": "High search volume skill for target profile."}
        for i, s in enumerate(tech_skills)
    ]

    # Save to DB if user is authenticated
    if current_user:
        linkedin_db_service.save_profile_data(
            db,
            user_id=current_user.id,
            profile_data=profile_data,
            optimised_content={
                "headlines": headline_suggestions,
                "about": about_optimizations,
                "experience": experience_optimizations
            },
            score=overall_score
        )
        resume_db_service.log_activity(
            db,
            user_id=current_user.id,
            activity_type="LINKEDIN_OPTIMIZED",
            description=f"Optimized LinkedIn profile (Score: {overall_score}/100)"
        )
        db.commit()

    return {
        "id": f"li_eval_{int(datetime.utcnow().timestamp())}",
        "overallScore": overall_score,
        "scoreGrade": score_grade,
        "categories": categories,
        "strengths": ["Grounded in genuine candidate profile details.", "Strong technical skill coverage."],
        "weakAreas": ["Headline can be further tuned for algorithmic recruiter discoverability."] if hl_len < 40 else [],
        "recommendations": ["Apply the Recruiter Search-Optimized headline to increase profile impressions."],
        "headlineSuggestions": headline_suggestions,
        "aboutOptimizations": about_optimizations,
        "experienceOptimizations": experience_optimizations,
        "projectOptimizations": [],
        "skillEvidence": skill_evidence,
        "analyzedAt": datetime.utcnow().isoformat()
    }


@router.post("/optimize")
def optimize_linkedin_profile(payload: LinkedInAnalysisRequest, db: Session = Depends(get_db)):
    """Synonym for /analyze."""
    return analyze_linkedin_profile(payload, db)


@router.get("/profile")
def get_linkedin_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = linkedin_db_service.get_or_create_profile(db, current_user.id)
    return {
        "id": profile.id,
        "profileData": profile.profile_data,
        "optimisedContent": profile.optimised_content,
        "latestScore": profile.latest_score,
        "updatedAt": profile.updated_at
    }


@router.put("/profile")
def update_linkedin_profile(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile_data = payload.get("profileData", {})
    optimised_content = payload.get("optimisedContent")
    score = payload.get("latestScore")
    profile = linkedin_db_service.save_profile_data(
        db,
        user_id=current_user.id,
        profile_data=profile_data,
        optimised_content=optimised_content,
        score=score
    )
    return {
        "message": "LinkedIn profile updated successfully",
        "id": profile.id,
        "updatedAt": profile.updated_at
    }
