from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class LinkedInAnalysisRequest(BaseModel):
    profile_data: Optional[Dict[str, Any]] = None
    profileData: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"


class HeadlineSuggestionItem(BaseModel):
    id: str
    type: str
    label: str
    text: str
    charCount: int
    keywordsIncluded: List[str]
    rationale: str


class AboutStyleItem(BaseModel):
    style: str
    styleLabel: str
    text: str
    keyImprovements: List[str]
    callToAction: str
    wordCount: int


class LinkedInAnalysisResponse(BaseModel):
    id: str
    overall_score: int
    score_grade: str
    categories: List[Dict[str, Any]]
    strengths: List[str]
    weak_areas: List[str]
    recommendations: List[str]
    headline_suggestions: List[HeadlineSuggestionItem]
    about_optimizations: Dict[str, AboutStyleItem]
    experience_optimizations: List[Dict[str, Any]]
    project_optimizations: List[Dict[str, Any]]
    skill_evidence: List[Dict[str, Any]]
    analyzed_at: datetime
