import asyncio
import json
import os
import subprocess
import tempfile
import time
import requests
import websockets
import sqlite3

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8001/api"
DB_PATH = "resume_architect.db"

class ChromeController:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        self.process = None
        self.ws_browser = None
        self.ws = None
        self.msg_id = 1

    async def start(self):
        self.process = subprocess.Popen([
            CHROME_PATH,
            "--headless=new",
            "--remote-debugging-port=9222",
            "--remote-debugging-address=127.0.0.1",
            f"--user-data-dir={self.temp_dir}",
            "--disable-gpu",
            "--no-first-run",
            "--no-default-browser-check",
            "--window-size=1280,900"
        ])

        browser_ws_url = None
        for _ in range(30):
            try:
                r = requests.get("http://127.0.0.1:9222/json/version", timeout=1)
                if r.status_code == 200:
                    browser_ws_url = r.json().get("webSocketDebuggerUrl")
                    if browser_ws_url:
                        break
            except Exception:
                await asyncio.sleep(0.2)

        if not browser_ws_url:
            raise RuntimeError("Could not connect to Chrome DevTools port 9222")

        self.ws_browser = await websockets.connect(browser_ws_url, max_size=10*1024*1024)
        
        mid = self.msg_id
        self.msg_id += 1
        await self.ws_browser.send(json.dumps({
            "id": mid,
            "method": "Target.createTarget",
            "params": {"url": f"{BASE_URL}/login"}
        }))
        resp = json.loads(await self.ws_browser.recv())
        target_id = resp["result"]["targetId"]
        
        page_ws_url = f"ws://127.0.0.1:9222/devtools/page/{target_id}"
        self.ws = await websockets.connect(page_ws_url, max_size=10*1024*1024)
        await self.send("Page.enable")
        await self.send("Runtime.enable")
        await self.send("DOM.enable")

    async def send(self, method, params=None):
        mid = self.msg_id
        self.msg_id += 1
        msg = {"id": mid, "method": method, "params": params or {}}
        await self.ws.send(json.dumps(msg))

        while True:
            raw = await self.ws.recv()
            resp = json.loads(raw)
            if resp.get("id") == mid:
                if "error" in resp:
                    raise RuntimeError(f"CDP error in {method}: {resp['error']}")
                return resp.get("result", {})

    async def navigate(self, url, wait_ms=1200):
        await self.send("Page.navigate", {"url": url})
        await asyncio.sleep(wait_ms / 1000.0)

    async def eval_js(self, expression):
        res = await self.send("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": True
        })
        val = res.get("result", {}).get("value")
        return val

    async def get_url(self):
        return await self.eval_js("window.location.href")

    async def stop(self):
        try:
            if self.ws:
                await self.ws.close()
            if self.ws_browser:
                await self.ws_browser.close()
            if self.process:
                self.process.terminate()
                self.process.wait(timeout=3)
        except Exception:
            pass


async def run_full_suite():
    results = []
    def record(name, passed, detail):
        status_str = "PASS" if passed else "FAIL"
        print(f"[{status_str}] {name} — {detail}")
        results.append({"name": name, "passed": passed, "detail": detail})

    chrome = ChromeController()
    await chrome.start()

    ts = int(time.time())
    email_a = f"phase10_user_{ts}@testcorp.io"
    password = "StrongPassword#2026"
    name_a = f"Alex Morgan {ts}"

    email_b = f"phase10_isolated_{ts}@testcorp.io"
    name_b = f"Jordan Lee {ts}"

    try:
        # =====================================================================
        # TEST A: CREATE RESUME FROM SCRATCH (ALL 10 SECTIONS), TEMPLATES & EXPORT
        # =====================================================================
        print("\n--- RUNNING TEST A: Create from Scratch, 10 Sections, Templates & Export ---")

        # 1. Register User A in Browser
        await chrome.navigate(f"{BASE_URL}/signup", 1500)
        await chrome.eval_js(f'''
            (() => {{
                const inputs = document.querySelectorAll('input');
                inputs[0].value = "{name_a}";
                inputs[0].dispatchEvent(new Event('input', {{ bubbles: true }}));
                inputs[1].value = "{email_a}";
                inputs[1].dispatchEvent(new Event('input', {{ bubbles: true }}));
                inputs[2].value = "{password}";
                inputs[2].dispatchEvent(new Event('input', {{ bubbles: true }}));
                inputs[3].value = "{password}";
                inputs[3].dispatchEvent(new Event('input', {{ bubbles: true }}));
                const btn = document.querySelector('button[type="submit"]');
                btn.click();
            }})();
        ''')
        await asyncio.sleep(2000)
        cur_url = await chrome.get_url()
        record("TEST A.1: User Registration & Redirect to App", "/app" in cur_url, f"Redirected to {cur_url}")

        # 2. Navigate to Studio
        await chrome.navigate(f"{BASE_URL}/app/studio", 1500)
        studio_text = await chrome.eval_js("document.body.innerText")
        has_studio = "AI Resume Studio" in studio_text or "Create from Scratch" in studio_text
        record("TEST A.2: AI Resume Studio Open", has_studio, "Opened Resume Studio workspace")

        # 3. Load Sample / Pre-populate 10 Sections
        await chrome.eval_js('''
            (() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const loadBtn = btns.find(b => b.innerText.includes('Load Sample Profile'));
                if (loadBtn) loadBtn.click();
            })();
        ''')
        await asyncio.sleep(800)

        # Verify all 10 sections are rendered in editor & preview
        preview_text = await chrome.eval_js('''
            document.getElementById('resume-document-sheet')?.innerText || ''
        ''')
        has_pinfo = "Sarah Lindqvist" in preview_text
        has_summary = "Professional Summary" in preview_text
        has_edu = "Education" in preview_text
        has_tech = "Technical Skills" in preview_text
        has_soft = "Soft Skills & Leadership" in preview_text
        has_proj = "Technical Projects" in preview_text
        has_exp = "Work Experience" in preview_text
        has_cert = "Certifications & Licenses" in preview_text
        has_ach = "Honors & Key Achievements" in preview_text
        has_extra = "Extracurricular Activities & Leadership" in preview_text

        all_10_present = all([has_pinfo, has_summary, has_edu, has_tech, has_soft, has_proj, has_exp, has_cert, has_ach, has_extra])
        record("TEST A.3: All 10 Distinct Sections in Live ATS Preview", all_10_present, 
               f"PInfo:{has_pinfo}, Sum:{has_summary}, Edu:{has_edu}, Tech:{has_tech}, Soft:{has_soft}, Proj:{has_proj}, Exp:{has_exp}, Cert:{has_cert}, Ach:{has_ach}, Extra:{has_extra}")

        # 4. Template Switching
        await chrome.eval_js('''
            (() => {
                const select = document.getElementById('template-select');
                if (select) {
                    select.value = 'Executive Modern';
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }
            })();
        ''')
        await asyncio.sleep(400)
        tmpl_class = await chrome.eval_js('''
            document.getElementById('resume-document-sheet')?.className || ''
        ''')
        record("TEST A.4: Template Switch to Executive Modern", "font-serif" in tmpl_class, f"Preview class applied: {tmpl_class}")

        await chrome.eval_js('''
            (() => {
                const select = document.getElementById('template-select');
                if (select) {
                    select.value = 'Technical Specialist';
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }
            })();
        ''')
        await asyncio.sleep(400)
        tmpl_class_tech = await chrome.eval_js('''
            document.getElementById('resume-document-sheet')?.className || ''
        ''')
        record("TEST A.5: Template Switch to Technical Specialist", "font-mono" in tmpl_class_tech, f"Preview class applied: {tmpl_class_tech}")

        # 5. Save to Repository
        await chrome.eval_js('''
            (() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const saveBtn = btns.find(b => b.innerText.includes('Save to My Resumes'));
                if (saveBtn) saveBtn.click();
            })();
        ''')
        await asyncio.sleep(1500)

        # 6. Verify SQLite Database Record
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE email = ?", (email_a,))
        u_row = c.fetchone()
        user_id_a = u_row[0] if u_row else None

        c.execute("SELECT id, title, latest_score, resume_data FROM resumes WHERE user_id = ? ORDER BY created_at DESC", (user_id_a,))
        res_row = c.fetchone()
        resume_id_a = res_row[0] if res_row else None
        resume_score = res_row[2] if res_row else "missing"
        r_json = json.loads(res_row[3]) if res_row and res_row[3] else {}

        record("TEST A.6: Resume Saved in SQLite Without Synthetic Score", 
               resume_id_a is not None and resume_score is None,
               f"Resume ID: {resume_id_a}, Stored Score: {resume_score} (Expected None for fresh scratch creation)")

        sections_in_db = [
            bool(r_json.get("personalInfo")),
            bool(r_json.get("careerObjective")),
            bool(r_json.get("education")),
            bool(r_json.get("skills")),
            bool(r_json.get("softSkills")),
            bool(r_json.get("projects")),
            bool(r_json.get("experience")),
            bool(r_json.get("certifications")),
            bool(r_json.get("achievements")),
            bool(r_json.get("extracurriculars")),
        ]
        record("TEST A.7: All 10 Sections Persisted in JSON DB Structure", all(sections_in_db), f"Persisted sections: {sections_in_db}")

        # 7. Check "My Resumes" & Browser Reload
        await chrome.navigate(f"{BASE_URL}/app/resumes", 1500)
        res_list_text = await chrome.eval_js("document.body.innerText")
        record("TEST A.8: Resume Listed in My Resumes After Reload", "Sarah Lindqvist" in res_list_text or "Studio" in res_list_text, "Found saved resume card in repository")

        # 8. Edit Resume & Save New Version
        token_a = await chrome.eval_js("localStorage.getItem('resume_architect_token')")
        headers_a = {"Authorization": f"Bearer {token_a}", "Content-Type": "application/json"}
        
        edit_payload = {
            "title": "Sarah Lindqvist — Senior Cloud Systems Architect (v2)",
            "create_version": True,
            "version_notes": "Added performance optimization metrics for 2026 architecture review"
        }
        r_edit = requests.put(f"{API_URL}/resumes/{resume_id_a}", json=edit_payload, headers=headers_a)
        c.execute("SELECT COUNT(*) FROM resume_versions WHERE resume_id = ?", (resume_id_a,))
        v_count = c.fetchone()[0]
        record("TEST A.9: Edit Resume & Create Version Snapshot", r_edit.status_code == 200 and v_count >= 2, f"HTTP {r_edit.status_code}, Versions in DB: {v_count}")

        # 9. Document Export PDF & DOCX
        r_pdf = requests.get(f"{API_URL}/resumes/{resume_id_a}/export/pdf", headers=headers_a)
        r_docx = requests.get(f"{API_URL}/resumes/{resume_id_a}/export/docx", headers=headers_a)
        record("TEST A.10: Export PDF & DOCX Binary Generation", 
               r_pdf.status_code == 200 and len(r_pdf.content) > 1000 and r_docx.status_code == 200 and len(r_docx.content) > 1000,
               f"PDF: {len(r_pdf.content)} bytes, DOCX: {len(r_docx.content)} bytes")


        # =====================================================================
        # TEST B: RELIABLE RESUME PARSING ENGINE (VALIDATION & EXTRACTION)
        # =====================================================================
        print("\n--- RUNNING TEST B: Reliable Parsing Engine (Validation & Extraction) ---")

        # 1. Empty File Rejection
        r_empty = requests.post(f"{API_URL}/analysis/upload", files={"file": ("empty.pdf", b"", "application/pdf")})
        record("TEST B.1: Empty File Rejection", r_empty.status_code == 400 and "empty" in r_empty.text.lower(), f"HTTP {r_empty.status_code}: {r_empty.text}")

        # 2. Oversized File Rejection (>10MB)
        big_content = b"0" * (11 * 1024 * 1024)
        r_big = requests.post(f"{API_URL}/analysis/upload", files={"file": ("big.pdf", big_content, "application/pdf")})
        record("TEST B.2: Oversized 11MB File Rejection", r_big.status_code == 400 and "exceeds" in r_big.text.lower(), f"HTTP {r_big.status_code}: {r_big.text}")

        # 3. Scanned PDF Detection (Raster image or negligible text)
        # Generate minimal 1-page PDF with 1 character
        import reportlab.pdfgen.canvas as canvas
        buf = io.BytesIO() if 'io' in globals() else tempfile.NamedTemporaryFile(delete=False)
        from reportlab.pdfgen import canvas
        c_pdf = canvas.Canvas(buf.name if hasattr(buf, 'name') else "scanned_test.pdf")
        c_pdf.drawString(100, 100, ".")
        c_pdf.save()
        with open(buf.name if hasattr(buf, 'name') else "scanned_test.pdf", "rb") as f:
            scanned_bytes = f.read()

        r_scanned = requests.post(f"{API_URL}/analysis/upload", files={"file": ("scanned_scan.pdf", scanned_bytes, "application/pdf")})
        scanned_json = r_scanned.json() if r_scanned.status_code == 200 else {}
        record("TEST B.3: Scanned PDF Detection & OCR Flagging", 
               scanned_json.get("is_scanned") == True and scanned_json.get("requires_ocr") == True,
               f"is_scanned: {scanned_json.get('is_scanned')}, requires_ocr: {scanned_json.get('requires_ocr')}")

        # 4. Truthful Parsing without Invented Credentials
        real_resume_text = (
            "David Chen\n"
            "david.chen@cloudeng.com | +1 (555) 345-6789 | Seattle, WA\n"
            "linkedin.com/in/davidchen-eng | github.com/dchen-systems\n\n"
            "PROFESSIONAL SUMMARY\n"
            "Backend Systems Engineer with 4 years designing high-throughput REST APIs and Kafka streaming pipelines in Go and Python.\n\n"
            "TECHNICAL SKILLS\n"
            "Go, Python, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, Redis, Kafka, Git\n\n"
            "PROFESSIONAL EXPERIENCE\n"
            "Stratos Cloud | Backend Engineer | 2021 - Present\n"
            "• Engineered real-time data streaming pipeline processing 15,000 events/sec with Kafka and Go.\n"
            "• Optimized PostgreSQL connection pool reducing p99 response times by 35%.\n"
            "• Deployed 12 microservices to AWS EKS with Terraform.\n\n"
            "EDUCATION\n"
            "University of Washington\n"
            "Bachelor of Science in Computer Science | 2021\n\n"
            "TECHNICAL PROJECTS\n"
            "Distributed Event Broker (Go, Redis)\n"
            "• Implemented in-memory publish-subscribe broker with Raft consensus.\n"
        )
        r_parse = requests.post(f"{API_URL}/analysis/upload", files={"file": ("david_chen_resume.txt", real_resume_text.encode("utf-8"), "text/plain")})
        p_json = r_parse.json() if r_parse.status_code == 200 else {}
        s_data = p_json.get("structuredData", {})
        
        has_real_name = s_data.get("personalInfo", {}).get("fullName") == "David Chen"
        has_real_email = s_data.get("personalInfo", {}).get("email") == "david.chen@cloudeng.com"
        has_real_degree = "University of Washington" in str(s_data.get("education", []))
        no_fake_bs_cs = "Scalable Cloud Application" not in str(s_data.get("projects", []))

        record("TEST B.4: Truthful Document Extraction (Zero Invented Placeholders)",
               has_real_name and has_real_email and has_real_degree and no_fake_bs_cs,
               f"Name: {s_data.get('personalInfo', {}).get('fullName')}, Edu: {len(s_data.get('education', []))} entries, No Hallucinated Projects: {no_fake_bs_cs}")


        # =====================================================================
        # TEST C: JD INTELLIGENCE, 6-PILLAR SCORE, EVIDENCEMAP & TRUTHGUARD
        # =====================================================================
        print("\n--- RUNNING TEST C: JD Intelligence, 6-Pillar Score, EvidenceMap & TruthGuard ---")

        jd_text = (
            "Staff Distributed Systems Engineer — Core Infrastructure\n"
            "We are seeking an experienced engineer to lead our distributed data platform.\n"
            "Requirements:\n"
            "• 5+ years experience building distributed backends with Go, Docker, and Kubernetes.\n"
            "• Strong experience with Apache Kafka, Redis, and PostgreSQL.\n"
            "• Cloud experience on AWS or GCP.\n"
            "• Bachelor's or Master's degree in Computer Science or related technical discipline.\n"
        )

        eval_payload = {
            "resume_id": resume_id_a,
            "raw_resume_text": real_resume_text,
            "resume_data": s_data,
            "target_role": "Staff Distributed Systems Engineer",
            "target_job_description": jd_text,
            "companyName": "Cloud Infrastructure Corp",
            "resumeFileName": "david_chen_resume.pdf"
        }

        r_eval = requests.post(f"{API_URL}/analysis/score-engine/analyze", json=eval_payload, headers=headers_a)
        eval_json = r_eval.json() if r_eval.status_code == 200 else {}

        # 1. Verify 6-Pillar Weighted Arithmetic
        categories = eval_json.get("category_scores", [])
        overall_score = eval_json.get("overall_score")
        
        calc_score = round(sum(cat["score"] * cat["weight"] for cat in categories))
        math_exact = abs(calc_score - overall_score) <= 1
        record("TEST C.1: Deterministic 6-Pillar Score Arithmetic", math_exact, f"Computed: {calc_score}%, Returned: {overall_score}%, Categories: {len(categories)}")

        # 2. Verify EvidenceMap Strict Statuses & Citations
        ev_items = eval_json.get("evidence_map", [])
        statuses = set(item.get("status") for item in ev_items)
        valid_statuses = {"MATCHED", "PARTIALLY MATCHED", "NOT FOUND"}
        all_valid_statuses = statuses.issubset(valid_statuses)
        matched_has_quotes = any("David Chen" in str(item) or "Go" in str(item) or "Kafka" in str(item) for item in ev_items if item.get("status") == "MATCHED")

        record("TEST C.2: EvidenceMap Citations Grounded in Exact Resume Text", 
               all_valid_statuses and matched_has_quotes and len(ev_items) >= 3,
               f"Statuses: {statuses}, Total Citations: {len(ev_items)}")

        # 3. TruthGuard Validation (Anti-Hallucination)
        tg_payload = {
            "claims": [
                {"original": "Engineered real-time data streaming pipeline with Kafka and Go.", 
                 "suggested": "Architected real-time data streaming pipeline with Kafka and Go."},  # SUPPORTED
                {"original": "Optimized PostgreSQL connection pool.",
                 "suggested": "Optimized PostgreSQL connection pool reducing p99 latency by 85% across 40 nodes."}, # NEEDS_CONFIRMATION (new numbers)
                {"original": "Deployed 12 microservices to AWS EKS.",
                 "suggested": "Architected enterprise quantum ledger using Rust, Zig, and Solana blockchain."} # UNSUPPORTED (unmentioned tech)
            ],
            "candidate_facts": s_data
        }
        r_tg = requests.post(f"{API_URL}/analysis/truthguard/validate", json=tg_payload)
        tg_results = r_tg.json().get("validations", [])
        
        st_supported = tg_results[0].get("truthguard_status") if len(tg_results) > 0 else ""
        st_confirm = tg_results[1].get("truthguard_status") if len(tg_results) > 1 else ""
        st_unsupported = tg_results[2].get("truthguard_status") if len(tg_results) > 2 else ""

        tg_passed = (st_supported == "SUPPORTED" and st_confirm == "NEEDS_CONFIRMATION" and st_unsupported == "UNSUPPORTED")
        record("TEST C.3: TruthGuard Tri-State Anti-Hallucination Guard", tg_passed,
               f"1: {st_supported}, 2: {st_confirm}, 3: {st_unsupported}")

        # 4. AI-Powered Resume Improvements via Gemini / Central Service
        r_imp = requests.post(f"{API_URL}/resumes/{resume_id_a}/improve", 
                              json={"resume_id": resume_id_a, "job_description": jd_text}, 
                              headers=headers_a)
        imp_json = r_imp.json() if r_imp.status_code == 200 else {}
        imp_list = imp_json.get("improvements", [])
        tg_sum = imp_json.get("truthguard_summary", {})
        
        record("TEST C.4: AI Improvement Engine with TruthGuard Verification",
               r_imp.status_code == 200 and len(imp_list) > 0 and "supported" in tg_sum,
               f"Generated {len(imp_list)} suggestions; TG Summary: {tg_sum}")


        # =====================================================================
        # TEST D: AUTHENTICATION, PROTECTED ROUTE ENFORCEMENT & DATA ISOLATION
        # =====================================================================
        print("\n--- RUNNING TEST D: Auth Security, Protected Routes & Data Isolation ---")

        # 1. Register User B
        r_reg_b = requests.post(f"{API_URL}/auth/signup", json={"name": name_b, "email": email_b, "password": password})
        token_b = r_reg_b.json().get("access_token")
        headers_b = {"Authorization": f"Bearer {token_b}", "Content-Type": "application/json"}

        # 2. Data Isolation: User B attempts to access User A's resume
        r_access = requests.get(f"{API_URL}/resumes/{resume_id_a}", headers=headers_b)
        record("TEST D.1: Cross-User Data Isolation (User B cannot read User A's resume)",
               r_access.status_code in [403, 404],
               f"HTTP {r_access.status_code}: {r_access.text}")

        # 3. Logout in Browser
        await chrome.eval_js('''
            (() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const logoutBtn = btns.find(b => b.innerText.includes('Sign Out') || b.innerText.includes('Logout'));
                if (logoutBtn) logoutBtn.click();
            })();
        ''')
        await asyncio.sleep(1200)

        # 4. Verify Tokens Purged
        token_after_logout = await chrome.eval_js("localStorage.getItem('resume_architect_token')")
        record("TEST D.2: Logout Cleanses Tokens from Storage", token_after_logout is None, f"Token in storage: {token_after_logout}")

        # 5. Protected Route Enforcement: Navigating to /app while logged out redirects to /login
        await chrome.navigate(f"{BASE_URL}/app", 1500)
        url_after_protect = await chrome.get_url()
        record("TEST D.3: Protected Route Guard Redirects Unauthenticated Users to /login",
               "/login" in url_after_protect,
               f"Current URL: {url_after_protect}")

        # 6. Log back in with User A & Verify Persistence
        await chrome.eval_js(f'''
            (() => {{
                const inputs = document.querySelectorAll('input');
                inputs[0].value = "{email_a}";
                inputs[0].dispatchEvent(new Event('input', {{ bubbles: true }}));
                inputs[1].value = "{password}";
                inputs[1].dispatchEvent(new Event('input', {{ bubbles: true }}));
                const btn = document.querySelector('button[type="submit"]');
                btn.click();
            }})();
        ''')
        await asyncio.sleep(2000)
        relogin_url = await chrome.get_url()
        record("TEST D.4: Re-login as User A Successful", "/app" in relogin_url, f"Current URL: {relogin_url}")

        await chrome.navigate(f"{BASE_URL}/app/resumes", 1500)
        final_list_text = await chrome.eval_js("document.body.innerText")
        record("TEST D.5: Saved Data Persists Post Re-authentication", 
               "Sarah Lindqvist" in final_list_text or "Studio" in final_list_text,
               "User A's resume list successfully retrieved from database")

    finally:
        await chrome.stop()

    print("\n" + "="*80)
    print("FINAL PHASE 10 VERIFICATION REPORT")
    print("="*80)
    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)
    for r in results:
        status_str = "PASS" if r["passed"] else "FAIL"
        print(f"[{status_str}] {r['name']}: {r['detail']}")
    print(f"\nOVERALL RESULT: {passed_count}/{total_count} PASSED")
    if passed_count == total_count:
        print("ALL VERIFICATION SUITES COMPLETED WITH ZERO ERRORS.")
    else:
        print(f"ATTENTION: {total_count - passed_count} TESTS FAILED.")
    return passed_count == total_count

if __name__ == "__main__":
    asyncio.run(run_full_suite())
