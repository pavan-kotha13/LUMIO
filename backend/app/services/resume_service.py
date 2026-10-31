from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from ..database.models import Resume, ResumeVersion, Activity, CandidateProfile
from ..schemas.resume_schema import ResumeCreate, ResumeUpdate


class ResumeDatabaseService:
    """
    Handles all SQLite database persistence operations for resumes, versions, and audit activities.
    Enforces user isolation so users can never access another user's resumes.
    """

    def create_resume(self, db: Session, user_id: str, payload: ResumeCreate) -> Resume:
        resume = Resume(
            user_id=user_id,
            title=payload.title,
            target_role=payload.target_role,
            target_company=payload.target_company,
            resume_data=payload.resume_data,
            latest_score=None
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        # Create initial Version 1 snapshot
        version = ResumeVersion(
            resume_id=resume.id,
            version_number=1,
            changelog="Initial resume generation",
            resume_snapshot=payload.resume_data
        )
        db.add(version)

        # Log Activity
        self.log_activity(
            db,
            user_id=user_id,
            activity_type="RESUME_CREATED",
            description=f"Created resume '{resume.title}' ({resume.target_role})"
        )
        db.commit()
        return resume

    def get_user_resumes(self, db: Session, user_id: str) -> List[Resume]:
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.updated_at.desc()).all()

    def get_resume_by_id(self, db: Session, resume_id: str, user_id: str) -> Optional[Resume]:
        return db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()

    def update_resume(
        self,
        db: Session,
        resume_id: str,
        user_id: str,
        payload: ResumeUpdate
    ) -> Optional[Resume]:
        resume = self.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            return None

        if payload.title is not None:
            resume.title = payload.title
        if payload.target_role is not None:
            resume.target_role = payload.target_role
        if payload.target_company is not None:
            resume.target_company = payload.target_company
        if payload.resume_data is not None:
            resume.resume_data = payload.resume_data
        if payload.latest_score is not None:
            resume.latest_score = payload.latest_score

        resume.updated_at = datetime.utcnow()

        # Version creation requested
        if payload.create_version and payload.resume_data:
            latest_v = db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume.id).order_by(ResumeVersion.version_number.desc()).first()
            next_v_num = (latest_v.version_number + 1) if latest_v else 1
            version = ResumeVersion(
                resume_id=resume.id,
                version_number=next_v_num,
                changelog=payload.changelog or f"Version {next_v_num} update",
                resume_snapshot=payload.resume_data
            )
            db.add(version)

        self.log_activity(
            db,
            user_id=user_id,
            activity_type="RESUME_EDITED",
            description=f"Updated resume content for '{resume.title}'"
        )
        db.commit()
        db.refresh(resume)
        return resume

    def delete_resume(self, db: Session, resume_id: str, user_id: str) -> bool:
        resume = self.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            return False
        db.delete(resume)
        self.log_activity(
            db,
            user_id=user_id,
            activity_type="RESUME_DELETED",
            description=f"Deleted resume '{resume.title}'"
        )
        db.commit()
        return True

    def create_version(
        self,
        db: Session,
        resume_id: str,
        user_id: str,
        changelog: str,
        snapshot: Dict[str, Any]
    ) -> Optional[ResumeVersion]:
        resume = self.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            return None

        latest_v = db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume.id).order_by(ResumeVersion.version_number.desc()).first()
        next_v_num = (latest_v.version_number + 1) if latest_v else 1

        version = ResumeVersion(
            resume_id=resume.id,
            version_number=next_v_num,
            changelog=changelog or f"Snapshot {next_v_num}",
            resume_snapshot=snapshot or resume.resume_data
        )
        db.add(version)
        self.log_activity(
            db,
            user_id=user_id,
            activity_type="VERSION_SAVED",
            description=f"Saved Version {next_v_num} for '{resume.title}'"
        )
        db.commit()
        db.refresh(version)
        return version

    def get_versions(self, db: Session, resume_id: str, user_id: str) -> List[ResumeVersion]:
        resume = self.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            return []
        return db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume_id).order_by(ResumeVersion.version_number.desc()).all()

    def log_activity(
        self,
        db: Session,
        user_id: str,
        activity_type: str,
        description: str,
        metadata_json: Dict[str, Any] = None
    ) -> Activity:
        activity = Activity(
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            metadata_json=metadata_json or {}
        )
        db.add(activity)
        return activity

    def get_recent_activities(self, db: Session, user_id: str, limit: int = 10) -> List[Activity]:
        return db.query(Activity).filter(Activity.user_id == user_id).order_by(Activity.timestamp.desc()).limit(limit).all()


resume_db_service = ResumeDatabaseService()
