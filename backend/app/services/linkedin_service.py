from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from ..database.models import LinkedInProfile
from .gemini_service import gemini_central_service


class LinkedInDatabaseService:
    """
    Handles persistence and optimization operations for LinkedIn Profiles.
    """

    def get_or_create_profile(self, db: Session, user_id: str) -> LinkedInProfile:
        profile = db.query(LinkedInProfile).filter(LinkedInProfile.user_id == user_id).first()
        if not profile:
            profile = LinkedInProfile(
                user_id=user_id,
                profile_data={},
                optimised_content={},
                latest_score=None
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    def save_profile_data(
        self,
        db: Session,
        user_id: str,
        profile_data: Dict[str, Any],
        optimised_content: Optional[Dict[str, Any]] = None,
        score: Optional[int] = None
    ) -> LinkedInProfile:
        profile = self.get_or_create_profile(db, user_id)
        profile.profile_data = profile_data
        if optimised_content is not None:
            profile.optimised_content = optimised_content
        if score is not None:
            profile.latest_score = score
        profile.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(profile)
        return profile


linkedin_db_service = LinkedInDatabaseService()
