import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Boolean,
)
from sqlalchemy.orm import relationship
from .connection import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    linkedin_profile = relationship("LinkedInProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    personal_details = Column(JSON, default=dict)
    education = Column(JSON, default=list)
    skills = Column(JSON, default=dict)
    projects = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_role = Column(String(255), nullable=False, default="Software Engineer")
    target_company = Column(String(255), nullable=True)
    
    # Complete structured JSON representation of the candidate resume
    resume_data = Column(JSON, nullable=False, default=dict)
    
    latest_score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan", order_by="desc(ResumeVersion.version_number)")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan", order_by="desc(ResumeAnalysis.analysis_date)")


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    changelog = Column(String(255), nullable=True, default="Snapshot created")
    
    # Frozen snapshot of resume data
    resume_snapshot = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="versions")
    analyses = relationship("ResumeAnalysis", back_populates="resume_version", cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True, index=True)
    resume_version_id = Column(String(36), ForeignKey("resume_versions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    target_role = Column(String(255), nullable=True)
    target_job_description = Column(Text, nullable=False)
    
    # Score Engine Results
    overall_score = Column(Integer, nullable=False)
    category_scores = Column(JSON, nullable=False, default=list)
    matched_requirements = Column(JSON, nullable=False, default=list)
    partially_matched = Column(JSON, nullable=False, default=list)
    unmentioned_requirements = Column(JSON, nullable=False, default=list)
    
    # EvidenceMap
    evidence_map = Column(JSON, nullable=False, default=list)
    
    # Improvement recommendations
    recommendations = Column(JSON, nullable=False, default=list)
    scoring_explanation = Column(Text, nullable=True)
    
    analysis_date = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
    resume_version = relationship("ResumeVersion", back_populates="analyses")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    source_url = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    extracted_keywords = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class LinkedInProfile(Base):
    __tablename__ = "linkedin_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    profile_data = Column(JSON, nullable=False, default=dict)
    optimised_content = Column(JSON, nullable=True, default=dict)
    latest_score = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="linkedin_profile")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = Column(String(64), nullable=False)  # RESUME_CREATED, RESUME_ANALYZED, RESUME_EDITED, LINKEDIN_OPTIMIZED, VERSION_SAVED
    description = Column(String(255), nullable=False)
    metadata_json = Column(JSON, nullable=True, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")
