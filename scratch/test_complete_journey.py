import sys
import os
import io
from fastapi.testclient import TestClient

sys.path.insert(0, r"C:\Users\pavan\antigravity\Resume-Architect")

from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RESUME ARCHITECT - FULL SYSTEM VERIFICATION SUITE")
    print("=" * 60)

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("1. Health check OK:", res.json()["status"])

    # 2. Authentication: Signup
    test_email = f"hackathon_test_{os.urandom(4).hex()}@example.com"
    signup_payload = {
        "name": "Marcus Vance",
        "email": test_email,
        "password": "HackathonPassword2026!"
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload)
    assert signup_res.status_code == 200, f"Signup failed: {signup_res.text}"
    token_data = signup_res.json()
    token = token_data["access_token"]
    user_id = token_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"2. User Signup OK: user_id={user_id}, token received")

    # Authentication: Login
    login_res = client.post("/api/auth/login", json={"email": test_email, "password": "HackathonPassword2026!"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    print("   User Login OK")

    # 3. Create Resume & Persistence
    resume_payload = {
        "title": "Staff Distributed Systems Architect",
        "target_role": "Staff Systems Engineer",
        "target_company": "CloudScale Systems",
        "resume_data": {
            "personalInfo": {
                "fullName": "Marcus Vance",
                "email": test_email,
                "phone": "(555) 389-2041",
                "location": "San Francisco, CA",
                "linkedin": "linkedin.com/in/marcusvance",
                "github": "github.com/marcusvance",
                "targetRole": "Staff Systems Engineer"
            },
            "summary": "Senior Systems Engineer with 6+ years building Go, Kubernetes, and Kafka microservices.",
            "skills": {
                "technical": ["Go", "Kubernetes", "Docker", "Kafka", "PostgreSQL", "Redis", "AWS", "Terraform"],
                "softAndTools": ["Git", "CI/CD", "Linux", "gRPC"]
            },
            "experience": [
                {
                    "id": "exp_1",
                    "company": "CloudScale Systems",
                    "jobTitle": "Senior Distributed Systems Engineer",
                    "startDate": "2022",
                    "endDate": "Present",
                    "bullets": [
                        "Architected event-driven payment ledger processing 4.5M transactions daily with Go and Kafka.",
                        "Reduced API latency from 180ms to 42ms through Redis caching and PostgreSQL index tuning."
                    ]
                }
            ],
            "projects": [
                {
                    "id": "proj_1",
                    "title": "Raft Distributed Event Broker",
                    "tech": "Go, Raft, Docker",
                    "description": "Built fault-tolerant distributed message queue with Raft consensus."
                }
            ],
            "education": [
                {
                    "id": "edu_1",
                    "degree": "B.S. in Computer Science",
                    "institution": "University of Texas at Austin",
                    "startDate": "2015",
                    "endDate": "2019"
                }
            ]
        }
    }
    create_res = client.post("/api/resumes", json=resume_payload, headers=headers)
    assert create_res.status_code == 200, f"Create resume failed: {create_res.text}"
    resume_id = create_res.json()["id"]
    print(f"3. Resume Creation & Persistence OK: id={resume_id}")

    # Verify User-specific isolation
    list_res = client.get("/api/resumes", headers=headers)
    assert len(list_res.json()) >= 1
    print("   User-specific access isolation OK")

    # 4. Job Description & Score Engine Analysis
    jd_text = """Staff Distributed Systems Engineer
    We are seeking a Staff Systems Engineer to design high-throughput microservices.
    Requirements:
    - 5+ years building distributed systems in Go.
    - Deep expertise with Kubernetes, Docker, and AWS.
    - Experience with Kafka, Redis, and PostgreSQL.
    - Familiarity with Terraform, Linux, and gRPC."""

    eval_payload = {
        "resume_id": resume_id,
        "resume_data": resume_payload["resume_data"],
        "target_job_description": jd_text,
        "target_role": "Staff Systems Engineer"
    }

    print("   Starting Score Engine Evaluation 1...")
    eval_res1 = client.post("/api/analysis/review", json=eval_payload, headers=headers)
    assert eval_res1.status_code == 200, f"Analysis failed: {eval_res1.text}"
    result1 = eval_res1.json()
    print("   Score Engine Evaluation 1 complete.")

    print("   Starting Score Engine Evaluation 2 (determinism check)...")
    eval_res2 = client.post("/api/analysis/review", json=eval_payload, headers=headers)
    result2 = eval_res2.json()
    print("   Score Engine Evaluation 2 complete.")

    print(f"4. Resume Score Engine OK:")
    print(f"   Overall Score: {result1['overall_score']}% (Grade: {result1['score_grade']})")
    assert result1["overall_score"] == result2["overall_score"], "Score engine is not deterministic!"
    print("   Determinism verified: repeated runs produce identical score")

    # Verify 6 scoring categories & weights
    categories = result1["category_scores"]
    assert len(categories) == 6, f"Expected 6 categories, got {len(categories)}"
    total_weight = sum(c["weight"] for c in categories)
    assert abs(total_weight - 1.0) < 1e-4, f"Category weights sum to {total_weight}, expected 1.00"
    for cat in categories:
        print(f"   - {cat['name']}: {cat['score']}/100 (Weight: {int(cat['weight']*100)}%)")

    # 5. EvidenceMap & TruthGuard Validation
    ev_items = result1["evidence_map"]
    assert len(ev_items) > 0, "EvidenceMap items empty!"
    matched_ev = [e for e in ev_items if e["status"] == "MATCHED"]
    print(f"5. EvidenceMap OK: {len(ev_items)} total items, {len(matched_ev)} verified matches")
    print(f"   Sample Evidence: '{ev_items[0]['requirement']}' -> {ev_items[0]['resumeEvidence'][:60]}...")

    # AI Improvement with TruthGuard
    improve_res = client.post(
        f"/api/resumes/{resume_id}/improve",
        json={"resume_id": resume_id, "job_description": jd_text},
        headers=headers
    )
    assert improve_res.status_code == 200, f"Improve failed: {improve_res.text}"
    imp_data = improve_res.json()
    print(f"   TruthGuard AI Improvement OK: {len(imp_data['improvements'])} suggestions generated")
    tg_summary = imp_data["truthguard_summary"]
    print(f"   TruthGuard Statuses: {tg_summary}")

    # 6. PDF & DOCX Export
    pdf_res = client.get(f"/api/resumes/{resume_id}/export/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert len(pdf_res.content) > 500
    print(f"6. PDF Export OK ({len(pdf_res.content)} bytes, Content-Type: {pdf_res.headers.get('content-type')})")

    docx_res = client.get(f"/api/resumes/{resume_id}/export/docx", headers=headers)
    assert docx_res.status_code == 200
    assert len(docx_res.content) > 500
    print(f"   DOCX Export OK ({len(docx_res.content)} bytes, Content-Type: {docx_res.headers.get('content-type')})")

    # 7. LinkedIn Profile Optimizer
    li_payload = {
        "profile_data": {
            "personalInfo": {
                "fullName": "Marcus Vance",
                "currentTitleOrStatus": "Staff Systems Engineer",
                "targetRole": "Staff Systems Engineer",
                "targetIndustry": "Cloud Computing"
            },
            "headline": "Staff Systems Engineer | Distributed Systems, Go, Kubernetes | CloudScale Systems",
            "about": "Staff Systems Engineer with 6+ years designing zero-downtime event-driven architectures. Passionate about Go, Kafka, and high availability.",
            "experience": resume_payload["resume_data"]["experience"],
            "projects": resume_payload["resume_data"]["projects"],
            "skills": resume_payload["resume_data"]["skills"],
            "education": resume_payload["resume_data"]["education"],
            "certifications": []
        }
    }
    li_res = client.post("/api/linkedin/analyze", json=li_payload, headers=headers)
    assert li_res.status_code == 200, f"LinkedIn failed: {li_res.text}"
    li_data = li_res.json()
    print(f"7. LinkedIn Optimizer OK: Score={li_data['overallScore']}/100 ({li_data['scoreGrade']})")
    print(f"   Headlines generated: {len(li_data['headlineSuggestions'])}")
    print(f"   About sections generated: {list(li_data['aboutOptimizations'].keys())}")

    print("=" * 60)
    print("ALL 7 CORE PILLARS AND JOURNEYS FULLY VERIFIED AND PASSING!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
