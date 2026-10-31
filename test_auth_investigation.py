import requests
import time
import json
import sqlite3

BASE_URL = "http://localhost:3000/api"

print("=" * 75)
print("RESUME ARCHITECT — AUTHENTICATION INVESTIGATION & VERIFICATION SUITE")
print("=" * 75)

# Step 1: Check Express Proxy Health
health_res = requests.get(f"{BASE_URL}/health", timeout=5)
print(f"[1] Express -> FastAPI Health Check: HTTP {health_res.status_code}")
assert health_res.status_code == 200, "Health check failed"
print(f"    Payload: {health_res.json()}")

# Step 2: Test Demo User Login (Quick Demo Login)
demo_payload = {
    "email": "marcus.architect@fintech.io",
    "password": "architect2026!"
}
demo_res = requests.post(f"{BASE_URL}/auth/login", json=demo_payload, timeout=5)
print(f"[2] Demo User Login ('Quick Demo Login'): HTTP {demo_res.status_code}")
assert demo_res.status_code == 200, f"Demo login failed with {demo_res.status_code}: {demo_res.text}"
demo_data = demo_res.json()
demo_token = demo_data["access_token"]
print(f"    Access Token: {demo_token[:30]}...")
print(f"    User Object: {demo_data['user']}")

# Step 3: Register a Brand-New Candidate User
ts = int(time.time())
new_candidate_email = f"verified_user_{ts}@example.com"
new_candidate_pass = "MySecurePass2026!"
new_candidate_name = "Elena Rostova"

signup_payload = {
    "name": new_candidate_name,
    "email": new_candidate_email,
    "password": new_candidate_pass
}
signup_res = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload, timeout=5)
print(f"[3] New Candidate Registration: HTTP {signup_res.status_code}")
assert signup_res.status_code == 200, f"Signup failed: {signup_res.text}"
signup_data = signup_res.json()
new_token = signup_data["access_token"]
new_user_id = signup_data["user"]["id"]
print(f"    Registered User ID: {new_user_id}")
print(f"    Registered Email: {signup_data['user']['email']}")

# Step 4: Verify User Exists in SQLite with Hashed Password
conn = sqlite3.connect("resume_architect.db")
c = conn.cursor()
row = c.execute("SELECT id, name, email, password_hash FROM users WHERE id = ?", (new_user_id,)).fetchone()
print(f"[4] SQLite Database Direct Inspection:")
assert row is not None, "User not found in SQLite users table!"
print(f"    SQLite Row: id={row[0]}, email={row[2]}")
print(f"    Password Hash: {row[3][:30]}... (Bcrypt $2b$)")
assert row[3].startswith(("$2b$", "$2a$", "$2y$")), "Password was not hashed with bcrypt!"

# Step 5: Verify Login with New Candidate
login_payload = {
    "email": new_candidate_email,
    "password": new_candidate_pass
}
login_res = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=5)
print(f"[5] Login with New Candidate Credentials: HTTP {login_res.status_code}")
assert login_res.status_code == 200, f"Login failed: {login_res.text}"
login_data = login_res.json()
active_token = login_data["access_token"]
print(f"    Returned Fresh JWT: {active_token[:30]}...")

# Step 6: Verify Session Rehydration / Refresh (/auth/me)
headers = {"Authorization": f"Bearer {active_token}"}
me_res = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=5)
print(f"[6] Session Rehydration on Browser Refresh (/auth/me): HTTP {me_res.status_code}")
assert me_res.status_code == 200, f"/auth/me failed: {me_res.text}"
me_data = me_res.json()
assert me_data["email"] == new_candidate_email
assert me_data["name"] == new_candidate_name
print(f"    Rehydrated User: {me_data['name']} ({me_data['email']})")

# Step 7: Verify Dashboard Data Access for New User
resumes_res = requests.get(f"{BASE_URL}/resumes", headers=headers, timeout=5)
print(f"[7] Dashboard Resume Query for New User: HTTP {resumes_res.status_code}")
assert resumes_res.status_code == 200, f"/resumes failed: {resumes_res.text}"
print(f"    User's Resumes Count: {len(resumes_res.json())} (Isolated)")

# Step 8: Verify Meaningful Backend Error on Invalid Password
bad_pass_payload = {
    "email": new_candidate_email,
    "password": "WrongPassword999!"
}
bad_pass_res = requests.post(f"{BASE_URL}/auth/login", json=bad_pass_payload, timeout=5)
print(f"[8] Invalid Password Check: HTTP {bad_pass_res.status_code}")
assert bad_pass_res.status_code == 401
bad_pass_data = bad_pass_res.json()
print(f"    Backend Error Detail: '{bad_pass_data.get('detail')}'")
assert "Invalid email or password" in bad_pass_data.get("detail", "")

# Step 9: Verify Meaningful Backend Error on Duplicate Email
dup_res = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload, timeout=5)
print(f"[9] Duplicate Registration Check: HTTP {dup_res.status_code}")
assert dup_res.status_code == 400
dup_data = dup_res.json()
print(f"    Backend Error Detail: '{dup_data.get('detail')}'")
assert "already exists" in dup_data.get("detail", "")

print("=" * 75)
print("ALL 9 AUTHENTICATION INVESTIGATION CHECKS PASSED PERFECTLY!")
print("=" * 75)
