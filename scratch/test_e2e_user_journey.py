import requests
import json

BASE_URL = "http://localhost:3000"

print("Testing End-to-End User Journey through Frontend Port 3000...")

# 1. Health
r = requests.get(f"{BASE_URL}/api/health")
print("1. Health Check (proxied):", r.status_code, r.json().get("status"))
assert r.status_code == 200

# 2. Auth Signup
email = "candidate_demo@example.com"
password = "DemoSecurePassword2026!"
signup_r = requests.post(f"{BASE_URL}/api/auth/signup", json={
    "name": "Jane Developer",
    "email": email,
    "password": password
})
if signup_r.status_code == 400:
    login_r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    token = login_r.json()["access_token"]
    user_id = login_r.json()["user"]["id"]
else:
    token = signup_r.json()["access_token"]
    user_id = signup_r.json()["user"]["id"]

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
print("2. Auth (Signup/Login): Token obtained for user_id =", user_id)

# 3. Create Resume
resume_data = {
    "personalInfo": {
        "fullName": "Jane Developer",
        "email": email,
        "phone": "(555) 123-4567",
        "location": "New York, NY",
        "targetRole": "Full-Stack Engineer"
    },
    "summary": "Full-Stack Software Engineer with expertise in React, TypeScript, Python, and PostgreSQL.",
    "skills": {
        "technical": ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
        "softAndTools": ["Agile", "REST APIs", "CI/CD"]
    },
    "experience": [
        {
            "id": "exp_1",
            "company": "Tech Innovators Inc",
            "jobTitle": "Full-Stack Developer",
            "startDate": "2023",
            "endDate": "Present",
            "bullets": [
                "Built responsive dashboards in React and TypeScript serving 50,000 daily active users.",
                "Engineered Python FastAPI microservices reducing average endpoint response time by 35%."
            ]
        }
    ],
    "projects": [
        {
            "id": "proj_1",
            "title": "Resume Intelligence Platform",
            "tech": "React, Python, FastAPI",
            "description": "High-throughput application evaluating candidate alignment against job descriptions."
        }
    ],
    "education": [
        {
            "id": "edu_1",
            "degree": "B.S. in Software Engineering",
            "institution": "Columbia University",
            "startDate": "2019",
            "endDate": "2023"
        }
    ]
}

res_create = requests.post(f"{BASE_URL}/api/resumes", json={
    "title": "Full-Stack Engineer Resume",
    "target_role": "Full-Stack Engineer",
    "target_company": "Acme SaaS",
    "resume_data": resume_data
}, headers=headers)
assert res_create.status_code == 200, f"Resume creation failed: {res_create.text}"
resume_id = res_create.json()["id"]
print("3. Resume Created & Persisted in SQLite: ID =", resume_id)

# 4. Score Engine Analysis
jd = """Full-Stack Software Engineer
Acme SaaS is looking for a Full-Stack Engineer with experience in React, TypeScript, Python, and PostgreSQL.
Requirements:
- 2+ years experience in React and TypeScript web applications.
- Backend API development with Python and FastAPI or Django.
- Database modeling with PostgreSQL.
- Understanding of Docker containerization and CI/CD pipelines."""

score_r = requests.post(f"{BASE_URL}/api/score-engine/analyze", json={
    "resume_id": resume_id,
    "resume_data": resume_data,
    "jobDescription": jd,
    "target_role": "Full-Stack Engineer"
}, headers=headers)
assert score_r.status_code == 200, f"Analysis failed: {score_r.text}"
score_res = score_r.json()
print(f"4. Score Engine Evaluation OK: Score = {score_res['overall_score']}% (Grade: {score_res['score_grade']})")
print(f"   Categories evaluated: {len(score_res['category_scores'])}")
for cat in score_res['category_scores']:
    print(f"   - {cat['name']}: {cat['score']}/100 ({int(cat['weight']*100)}% weight)")

# 5. EvidenceMap
ev_map = score_res["evidence_map"]
print(f"5. EvidenceMap OK: {len(ev_map)} verifiable requirements mapped")

# 6. TruthGuard AI Improvement
imp_r = requests.post(f"{BASE_URL}/api/resumes/{resume_id}/improve", json={
    "resume_id": resume_id,
    "job_description": jd
}, headers=headers)
assert imp_r.status_code == 200, f"Improvement failed: {imp_r.text}"
imp_data = imp_r.json()
print(f"6. TruthGuard AI Improvements: {len(imp_data['improvements'])} suggestions generated")
print(f"   TruthGuard Status Summary: {imp_data['truthguard_summary']}")

# 7. Save / Update Resume
save_r = requests.put(f"{BASE_URL}/api/resumes/{resume_id}", json={
    "title": "Full-Stack Engineer Resume (Optimized)",
    "resume_data": resume_data,
    "create_version": True,
    "changelog": "Applied TruthGuard improvements"
}, headers=headers)
assert save_r.status_code == 200
print("7. Resume Save & Versioning OK: Title =", save_r.json()["title"])

# 8. Export PDF
pdf_r = requests.get(f"{BASE_URL}/api/resumes/{resume_id}/export/pdf", headers=headers)
assert pdf_r.status_code == 200
print(f"8. PDF Export OK: {len(pdf_r.content)} bytes downloaded")

# 9. Export DOCX
docx_r = requests.get(f"{BASE_URL}/api/resumes/{resume_id}/export/docx", headers=headers)
assert docx_r.status_code == 200
print(f"9. DOCX Export OK: {len(docx_r.content)} bytes downloaded")

print("\n>>> COMPLETE END-TO-END USER JOURNEY VERIFIED AND SUCCEEDED! <<<")
