import logging
from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
from sqlalchemy.orm import Session
from .core.config import settings
from .database.connection import engine, Base, get_db
from .database.models import User
from .api import auth, resumes, analysis, linkedin, activities

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume_architect")

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

def seed_default_demo_account():
    """Ensure Marcus Vance demo account is seeded in SQLite."""
    from .database.connection import SessionLocal
    from .database.models import User, CandidateProfile
    from .core.security import hash_password

    db = SessionLocal()
    try:
        email = "marcus.architect@fintech.io"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                id="demo-user-marcus",
                name="Marcus Vance",
                email=email,
                password_hash=hash_password("architect2026!")
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            profile = CandidateProfile(
                user_id=user.id,
                personal_details={
                    "fullName": "Marcus Vance",
                    "email": email,
                    "phone": "+1 (555) 389-2041",
                    "location": "San Francisco, CA"
                }
            )
            db.add(profile)
            db.commit()
            logger.info("Seeded default demo account for Marcus Vance.")
    except Exception as e:
        logger.warning(f"Demo account seeding skipped: {e}")
    finally:
        db.close()

seed_default_demo_account()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Central Intelligence Backend for Resume Architect: Don't just match the job. Prove your fit."
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again."}
    )

# Include Central API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(linkedin.router, prefix="/api")
app.include_router(activities.router, prefix="/api")

# Also alias under /api/v1 for forward compatibility
app.include_router(auth.router, prefix="/api/v1")
app.include_router(resumes.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(linkedin.router, prefix="/api/v1")
app.include_router(activities.router, prefix="/api/v1")

# Direct aliases for score-engine
@app.post("/api/score-engine/analyze", response_model=analysis.AnalysisResponse)
@app.post("/api/v1/score-engine/analyze", response_model=analysis.AnalysisResponse)
def direct_score_engine_analyze(
    payload: analysis.ReviewRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(analysis.get_current_user_optional)
):
    return analysis.review_resume(payload, db, current_user)


@app.get("/api/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected (SQLite)",
        "gemini_model": settings.GEMINI_MODEL
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=False)
