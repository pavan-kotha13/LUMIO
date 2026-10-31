from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class CategoryScoreItem(BaseModel):
    id: str
    name: str
    score: int
    weight: float
    status: str
    feedback: Optional[str] = None
    summary: Optional[str] = None
    metrics: Dict[str, Any]


class EvidenceMapItem(BaseModel):
    id: str
    requirement: str
    category: str
    status: str  # MATCHED | PARTIALLY MATCHED | NOT FOUND
    resumeEvidence: str
    location: str
    explanation: str


class RequirementItem(BaseModel):
    name: str
    category: str
    status: str
    evidence: Optional[str] = None


class ReviewRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None
    raw_resume_text: Optional[str] = None
    resumeText: Optional[str] = None
    target_role: Optional[str] = "Software Engineer"
    target_job_description: Optional[str] = None
    jobDescription: Optional[str] = None
    companyName: Optional[str] = None
    resumeFileName: Optional[str] = None


class AnalysisResponse(BaseModel):
    id: str
    resume_id: Optional[str] = None
    target_role: Optional[str] = None
    jobTitle: Optional[str] = None
    companyName: Optional[str] = None
    resumeFileName: Optional[str] = None
    overall_score: int
    overallScore: Optional[int] = None
    score_grade: Optional[str] = "Strong"
    scoreGrade: Optional[str] = "Strong"
    category_scores: List[CategoryScoreItem]
    categories: Optional[List[CategoryScoreItem]] = None
    matched_requirements: List[Dict[str, Any]] = []
    partially_matched: List[Dict[str, Any]] = []
    unmentioned_requirements: List[Dict[str, Any]] = []
    missing_keywords: Optional[List[Dict[str, Any]]] = []
    missingKeywords: Optional[List[Dict[str, Any]]] = []
    skill_gaps: Optional[List[Dict[str, Any]]] = []
    skillGaps: Optional[List[Dict[str, Any]]] = []
    evidence_map: List[EvidenceMapItem] = []
    evidenceMap: Optional[List[EvidenceMapItem]] = None
    recommendations: List[str] = []
    scoring_explanation: Optional[str] = None
    methodologyNotes: Optional[str] = None
    quality_report: Optional[Dict[str, Any]] = None
    qualityReport: Optional[Dict[str, Any]] = None
    analyzed_at: datetime
    evaluatedAt: Optional[str] = None


class ImprovementRequest(BaseModel):
    resume_id: str
    job_description: Optional[str] = None
    weakness_categories: Optional[List[str]] = None


class ImprovementBullet(BaseModel):
    id: str
    section: str
    original: str
    suggested: str
    truthguard_status: str  # SUPPORTED | NEEDS_CONFIRMATION | UNSUPPORTED
    verification_rationale: str
    approved: bool = False


class ImprovementResponse(BaseModel):
    resume_id: str
    improvements: List[ImprovementBullet]
    summary_suggestion: Optional[str] = None
    truthguard_summary: Dict[str, Any]
