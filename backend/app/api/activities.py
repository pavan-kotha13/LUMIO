from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.models import User
from ..services.resume_service import resume_db_service
from .deps import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("")
def get_user_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activities = resume_db_service.get_recent_activities(db, current_user.id, limit=20)
    return [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "description": a.description,
            "metadata": a.metadata_json,
            "timestamp": a.timestamp.isoformat()
        }
        for a in activities
    ]
