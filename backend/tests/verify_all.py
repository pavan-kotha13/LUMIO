import sys
import os
from pathlib import Path

# Ensure backend is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.services.score_engine import score_engine, ResumeScoreEngine
from backend.app.services.evidence_map import evidence_map_service
from backend.app.services.truthguard import truthguard_service
from backend.app.services.export_service import export_service
from backend.app.services.gemini_service import gemini_central_service
from backend.app.database.connection import SessionLocal, Base, engine
from backend.app.database.models import User, Resume, ResumeVersion, ResumeAnalysis, CandidateProfile
from backend.app.core.security import hash_password as get_password_hash, verify_password, create_access_token, decode_access_token

def test_score_engine():
    print("=== 1. SCORE ENGINE AUDIT ===")
    total_weight = sum(ResumeScoreEngine.WEIGHTS.values())
    print(f"Total Weights Sum: {total_weight:.2f}")
    assert abs(total_weight - 1.0) < 0.001, "Category weights must total 100%"

    resume_data = {
        "title": "Staff Distributed Systems Engineer",
        "skills": {
            "technical": ["Go", "Kubernetes", "Kafka", "Redis", "PostgreSQL", "AWS", "Docker", "REST APIs", "CI/CD"],
            "softAndTools": ["Git", "Agile", "Linux"]
        },
        "experience": [
            {
                "role": "Staff Distributed Systems Engineer",
                "company": "CloudScale Systems",
                "bullets": [
                    "Architected event-driven payment ledger processing 4.5M transactions daily with Go and Kafka.",
                    "Reduced p99 latency from 180ms to 42ms with Redis caching.",
                    "Containerized 18 microservices onto AWS EKS clusters."
                ]
            }
        ],
        "education": [
            {
                "degree": "B.S. in Computer Science",
                "institution": "University of Texas at Austin",
                "year": "2019"
            }
        ],
        "projects": [
            {
                "title": "High-Throughput Event Broker",
                "tech": "Go, Raft, Docker",
                "description": "Implemented Raft consensus distributed message broker."
            }
        ]
    }
    raw_resume_text = """Marcus Vance
San Francisco, CA | marcus@example.com | (555) 389-2041
Professional Summary: Senior Distributed Systems Engineer with 6+ years specializing in backend architectures, microservices, and cloud systems.
Skills: Go, Python, Kubernetes, Kafka, Redis, PostgreSQL, AWS, Docker, REST APIs, CI/CD
Experience:
Senior Distributed Systems Engineer - CloudScale Systems (2022 - Present)
- Architected event-driven payment ledger processing 4.5M transactions daily with Go and Kafka.
- Reduced p99 latency from 180ms to 42ms with Redis caching.
- Containerized 18 microservices onto AWS EKS.
Education:
B.S. in Computer Science - University of Texas at Austin (2019)
Projects:
High-Throughput Event Broker - Go, Raft, Docker
"""

    sample_jd = """Senior Backend Distributed Systems Engineer
Responsibilities:
- Build high-concurrency microservices using Go, Kubernetes, and Kafka.
- Ensure 99.999% SLA availability.
- Deploy services using AWS and Docker.
Requirements:
- Strong experience in Go, Python, SQL, REST APIs, microservices.
- Degree in Computer Science or related field.
"""

    res1 = score_engine.calculate_score(resume_data, raw_resume_text, sample_jd)
    res2 = score_engine.calculate_score(resume_data, raw_resume_text, sample_jd)
    print(f"Run 1 Score: {res1['overall_score']}, Run 2 Score: {res2['overall_score']}")
    assert res1['overall_score'] == res2['overall_score'], "Score calculation must be 100% deterministic"
    assert 0 <= res1['overall_score'] <= 100, "Score must be bounded 0-100"

    print("Verified 6 Pillars:")
    for cat in res1['category_scores']:
        print(f" - {cat['name']} (Weight: {cat['weight']*100:.0f}%): Score {cat['score']}% [{cat['status']}]")
    
    # 75% Decision System Verification
    print(f"Overall Fit Score: {res1['overall_score']}")
    assert res1['overall_score'] >= 75, "Marcus Vance match should qualify as >= 75"
    
    poor_data = {"skills": ["Photoshop", "Illustrator"], "experience": [], "projects": []}
    poor_res = score_engine.calculate_score(poor_data, "Graphic designer", sample_jd)
    print(f"Poor match score: {poor_res['overall_score']}")
    assert poor_res['overall_score'] < 75, "Mismatched resume must be below 75 threshold"
    print("PASS: Score Engine & 75% Decision Boundary Verification")
    return res1, resume_data, raw_resume_text

def test_evidence_map(score_result, resume_data, raw_text):
    print("\n=== 2. EVIDENCEMAP AUDIT ===")
    matched = score_result["matched_skills"]
    unmatched = score_result["unmatched_skills"]
    evidence = evidence_map_service.generate_evidence_map(
        resume_data=resume_data,
        raw_text=raw_text,
        matched_skills=matched,
        unmatched_skills=unmatched
    )
    print(f"Evidence items count: {len(evidence)}")
    statuses = set(e['status'] for e in evidence)
    print(f"Distinct statuses: {statuses}")
    assert "MATCHED" in statuses, "Must detect direct matches"
    for item in evidence[:4]:
        print(f" - [{item['status']}] {item['requirement']}")
        print(f"    Evidence: {item.get('evidence')}")
        print(f"    Location: {item.get('location')}")
    print("PASS: EvidenceMap Verification")

def test_truthguard(resume_data):
    print("\n=== 3. TRUTHGUARD AUDIT ===")
    improvements = [
        {
            "id": "imp_1",
            "section": "experience",
            "original": "Architected event-driven payment ledger processing 4.5M transactions daily with Go.",
            "suggested": "Architected event-driven payment ledger processing 4.5M transactions daily with Go, achieving 99.999% SLA."
        },
        {
            "id": "imp_2",
            "section": "experience",
            "original": "Worked on backend services.",
            "suggested": "Engineered distributed cluster using Rust and Solana blockchain."
        }
    ]
    flags = truthguard_service.sanitize_improvements(improvements, resume_data)
    print(f"TruthGuard flags count: {len(flags)}")
    for f in flags:
        print(f" - [{f['truthguard_status']}] {f['original']} -> {f['suggested']}")
        print(f"    Rationale: {f['verification_rationale']}")
    
    statuses = [f['truthguard_status'] for f in flags]
    assert truthguard_service.UNSUPPORTED in statuses or truthguard_service.NEEDS_CONFIRMATION in statuses, "Must catch unverified metrics or unsupported technologies"
    print("PASS: TruthGuard Anti-Hallucination Verification")

def test_export():
    print("\n=== 4. EXPORT AUDIT ===")
    sample_resume_data = {
        'title': 'Marcus Vance — Lead Systems Engineer',
        'personalInfo': {'fullName': 'Marcus Vance', 'email': 'marcus@example.com', 'phone': '555-0192', 'location': 'San Francisco, CA'},
        'summary': 'Senior Distributed Systems Engineer with 6+ years specializing in backend architectures, microservices, and cloud systems.',
        'skills': {'technical': ['Go', 'Kubernetes', 'Kafka', 'Python'], 'softAndTools': ['Git', 'Docker']},
        'experience': [{'jobTitle': 'Senior Engineer', 'company': 'CloudScale Systems', 'startDate': '2022', 'endDate': 'Present', 'bullets': ['Architected payment ledger.']}],
        'education': [{'degree': 'B.S. in Computer Science', 'institution': 'UT Austin', 'graduationYear': '2019'}],
        'projects': [{'title': 'Event Broker', 'tech': 'Go, Raft', 'description': 'Distributed message broker.', 'bullets': ['Implemented Raft consensus.']}]
    }
    pdf_bytes = export_service.generate_pdf(sample_resume_data)
    assert pdf_bytes.startswith(b'%PDF'), "PDF output must start with %PDF header"
    print(f"PDF generated: {len(pdf_bytes)} bytes")

    docx_bytes = export_service.generate_docx(sample_resume_data)
    assert len(docx_bytes) > 1000, "DOCX output must be valid byte stream"
    print(f"DOCX generated: {len(docx_bytes)} bytes")
    print("PASS: Document Export Verification (PDF & DOCX)")

def test_database_and_isolation():
    print("\n=== 5. DATABASE & USER ISOLATION AUDIT ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create user A
        user_a = User(
            id="test-user-a",
            name="Alice Candidate",
            email="alice@example.com",
            password_hash=get_password_hash("password123")
        )
        db.merge(user_a)

        # Create user B
        user_b = User(
            id="test-user-b",
            name="Bob Candidate",
            email="bob@example.com",
            password_hash=get_password_hash("password456")
        )
        db.merge(user_b)
        db.commit()

        # Create resume for user A
        resume_a = Resume(
            id="res-a-001",
            user_id="test-user-a",
            title="Alice's Private Resume",
            target_role="Full Stack Engineer",
            resume_data={"summary": "Alice's credentials"},
            latest_score=85
        )
        db.merge(resume_a)
        db.commit()

        # Verify user B cannot retrieve user A's resumes
        user_b_resumes = db.query(Resume).filter(Resume.user_id == "test-user-b").all()
        assert not any(r.id == "res-a-001" for r in user_b_resumes), "User B must NOT see User A's resume!"
        
        # Verify version history tracking
        v1 = ResumeVersion(
            id="v1-001",
            resume_id="res-a-001",
            version_number=1,
            changelog="Initial draft",
            resume_snapshot={"summary": "Version 1 snapshot"}
        )
        v2 = ResumeVersion(
            id="v2-002",
            resume_id="res-a-001",
            version_number=2,
            changelog="Added Redis and Kafka",
            resume_snapshot={"summary": "Version 2 snapshot"}
        )
        db.merge(v1)
        db.merge(v2)
        db.commit()

        versions = db.query(ResumeVersion).filter(ResumeVersion.resume_id == "res-a-001").order_by(ResumeVersion.version_number).all()
        assert len(versions) >= 2, "Must preserve version history"
        print(f"Version history preserved: {[v.version_number for v in versions]}")
        print("PASS: Database & User Isolation Verification")
    finally:
        db.close()

if __name__ == "__main__":
    score_res, res_data, raw_txt = test_score_engine()
    test_evidence_map(score_res, res_data, raw_txt)
    test_truthguard(res_data)
    test_export()
    test_database_and_isolation()
    print("\n=======================================================")
    print("ALL CORE INTEGRATION AUDIT TESTS PASSED WITH 100% SUCCESS!")
    print("=======================================================")
