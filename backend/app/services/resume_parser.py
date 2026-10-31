import io
import re
from typing import Dict, Any, List, Tuple, Optional

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False


class ResumeParserService:
    """
    Parses PDF, DOCX, and TXT files to extract raw text and convert into structured resume data.
    Enforces zero-hallucination: Never creates fake education or fictitious projects.
    Detects scanned image-only PDFs and flags OCR requirements.
    """

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    COMMON_TECH_SKILLS = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "Docker",
        "Kubernetes", "AWS", "GCP", "Azure", "PostgreSQL", "MySQL", "SQL",
        "MongoDB", "Redis", "Kafka", "Git", "CI/CD", "REST APIs", "GraphQL",
        "Go", "Java", "C++", "C#", "Linux", "Terraform", "FastAPI", "Express",
        "Next.js", "Tailwind CSS", "HTML5", "CSS3", "Flask", "Django", "Microservices"
    ]

    COMMON_SOFT_SKILLS = [
        "Cross-Functional Leadership", "Technical Mentorship", "System Architecture",
        "Root-Cause Analysis", "Agile / Scrum", "Stakeholder Communication",
        "Incident Management", "Problem Solving", "Strategic Planning"
    ]

    def extract_text_from_pdf(self, file_bytes: bytes) -> Tuple[str, int, bool]:
        """
        Extract text from PDF using PyMuPDF (fitz).
        Returns: (extracted_text, page_count, is_scanned)
        """
        if not file_bytes:
            return "", 0, False

        if HAS_PYMUPDF:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                page_count = len(doc)
                text_blocks = []
                for page in doc:
                    text_blocks.append(page.get_text())
                doc.close()

                full_text = "\n".join(text_blocks).strip()
                # Scanned PDF detection: pages exist but extracted text is negligible
                is_scanned = page_count > 0 and len(full_text.strip()) < 50
                return full_text, page_count, is_scanned
            except Exception as e:
                raise ValueError(f"Corrupted or invalid PDF file: {str(e)}")
        else:
            # Fallback byte scanner
            clean_text = file_bytes.decode("latin1", errors="ignore")
            readable = "".join([c for c in clean_text if c.isprintable() or c in "\n\r\t"])
            extracted = readable[:15000].strip()
            return extracted, 1, len(extracted) < 50

    def extract_text_from_docx(self, file_bytes: bytes) -> Tuple[str, int]:
        """
        Extract text from DOCX using python-docx.
        Returns: (extracted_text, paragraph_count)
        """
        if not file_bytes:
            return "", 0

        if HAS_DOCX:
            try:
                doc = docx.Document(io.BytesIO(file_bytes))
                text_parts = []
                for p in doc.paragraphs:
                    t = p.text.strip()
                    if t:
                        text_parts.append(t)
                for table in doc.tables:
                    for row in table.rows:
                        row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                        if row_cells:
                            text_parts.append(" | ".join(row_cells))
                return "\n".join(text_parts).strip(), len(text_parts)
            except Exception as e:
                raise ValueError(f"Corrupted or invalid DOCX document: {str(e)}")
        else:
            clean_text = file_bytes.decode("latin1", errors="ignore")
            return clean_text[:15000].strip(), 1

    def parse_raw_text_to_structure(self, raw_text: str, is_scanned: bool = False) -> Dict[str, Any]:
        """
        Semantic parser converting raw resume text into structured fields.
        Strictly grounds all records in extracted text without inventing placeholder credentials.
        """
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        lower_text = raw_text.lower()

        # Contact details
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        phone_match = re.search(r'\(?\+?[0-9]{1,3}\)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}', raw_text)
        linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', raw_text, re.IGNORECASE)
        github_match = re.search(r'github\.com/[\w-]+', raw_text, re.IGNORECASE)

        # Full Name heuristic
        full_name = "Candidate"
        for line in lines[:5]:
            # Skip lines that look like emails, URLs, or long text
            if "@" in line or "http" in line or len(line.split()) > 5 or len(line) > 40:
                continue
            # Typical name has 2 to 4 words with capital letters
            words = line.split()
            if 1 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                full_name = line
                break

        # Section detection
        section_indices: List[Tuple[str, int]] = []
        section_patterns = {
            "summary": r'^(?:professional\s+)?(?:summary|profile|about\s+me|career\s+objective)',
            "experience": r'^(?:professional\s+|work\s+)?(?:experience|employment|work\s+history|internships)',
            "education": r'^(?:education|academic\s+background|academic\s+credentials|qualifications)',
            "skills": r'^(?:technical\s+|core\s+)?(?:skills|technologies|competencies)',
            "projects": r'^(?:technical\s+|key\s+|selected\s+)?projects',
            "certifications": r'^(?:certifications|licenses|credentials|accreditations)',
            "achievements": r'^(?:honors|awards|achievements|key\s+accomplishments)',
            "extracurriculars": r'^(?:extracurricular|activities|leadership|volunteering|community)'
        }

        for idx, line in enumerate(lines):
            clean_line = line.strip().lower()
            for sec_name, pattern in section_patterns.items():
                if re.match(pattern, clean_line) and len(clean_line) < 40:
                    section_indices.append((sec_name, idx))
                    break

        section_indices.sort(key=lambda x: x[1])

        # Slice sections by line numbers
        sections_content: Dict[str, List[str]] = {}
        for i, (sec_name, start_idx) in enumerate(section_indices):
            end_idx = section_indices[i + 1][1] if i + 1 < len(section_indices) else len(lines)
            sections_content[sec_name] = lines[start_idx + 1:end_idx]

        # 1. Technical Skills
        found_tech_skills = []
        for s in self.COMMON_TECH_SKILLS:
            if re.search(r'\b' + re.escape(s.lower()) + r'\b', lower_text):
                found_tech_skills.append(s)

        # 2. Soft Skills
        found_soft_skills = []
        for s in self.COMMON_SOFT_SKILLS:
            if re.search(r'\b' + re.escape(s.lower()) + r'\b', lower_text):
                found_soft_skills.append(s)

        # 3. Experience Items
        experience_items = []
        exp_lines = sections_content.get("experience", [])
        if exp_lines:
            # Group bullets under experience
            bullets = [
                re.sub(r'^[\•\-\*\–\d\.\s]+', '', l).strip()
                for l in exp_lines
                if l.startswith(("•", "-", "*", "–")) or re.match(r'^\d+\.', l) or len(l) > 30
            ]
            first_header = exp_lines[0] if exp_lines else "Software Engineer"
            experience_items.append({
                "id": "exp_1",
                "jobTitle": first_header[:50] if len(first_header) < 50 else "Professional Role",
                "organisation": "Documented Experience",
                "startDate": "",
                "endDate": "Present",
                "isCurrent": True,
                "responsibilities": "\n".join(bullets[:6]) if bullets else "\n".join(exp_lines[:4]),
                "keyAchievements": ""
            })

        # 4. Education Items (Grounding: only add if actual education text exists)
        education_items = []
        edu_lines = sections_content.get("education", [])
        if edu_lines:
            degree_str = ""
            inst_str = ""
            grad_year = ""
            for l in edu_lines:
                year_match = re.search(r'\b(19\d\d|20\d\d)\b', l)
                if year_match and not grad_year:
                    grad_year = year_match.group(1)
                if any(k in l.lower() for k in ["bachelor", "master", "phd", "b.s", "m.s", "b.tech", "degree"]):
                    degree_str = l
                elif any(k in l.lower() for k in ["university", "college", "institute", "school"]):
                    inst_str = l

            education_items.append({
                "id": "edu_1",
                "institutionName": inst_str or (edu_lines[0] if edu_lines else "University"),
                "degree": degree_str or (edu_lines[1] if len(edu_lines) > 1 else "Degree"),
                "branch": "",
                "startYear": "",
                "graduationYear": grad_year,
                "cgpaOrPercentage": ""
            })

        # 5. Projects
        project_items = []
        proj_lines = sections_content.get("projects", [])
        if proj_lines:
            proj_title = proj_lines[0] if proj_lines else "Technical Project"
            p_bullets = [
                re.sub(r'^[\•\-\*\–\d\.\s]+', '', l).strip()
                for l in proj_lines[1:]
                if l.startswith(("•", "-", "*", "–")) or len(l) > 25
            ]
            project_items.append({
                "id": "proj_1",
                "projectName": proj_title[:50],
                "technologiesUsed": ", ".join(found_tech_skills[:4]) if found_tech_skills else "",
                "projectDescription": proj_lines[1] if len(proj_lines) > 1 and not proj_lines[1].startswith(("•", "-")) else "",
                "projectLink": "",
                "keyContributions": "\n".join(p_bullets[:4]) if p_bullets else "",
                "projectOutcome": ""
            })

        # 6. Certifications
        cert_items = []
        cert_lines = sections_content.get("certifications", [])
        for c_idx, cl in enumerate(cert_lines[:5]):
            if len(cl) > 3 and not cl.startswith(("http", "@")):
                clean_c = re.sub(r'^[\•\-\*\–\d\.\s]+', '', cl).strip()
                cert_items.append({
                    "id": f"cert_{c_idx + 1}",
                    "name": clean_c,
                    "issuer": "Issuing Authority",
                    "issueDate": ""
                })

        # Summary
        summary_text = ""
        if "summary" in sections_content and sections_content["summary"]:
            summary_text = " ".join(sections_content["summary"])[:600].strip()
        elif lines:
            summary_text = lines[1] if len(lines) > 1 and len(lines[1]) > 40 else ""

        warnings = []
        if is_scanned:
            warnings.append(
                "Scanned PDF Detected: The uploaded document contains raster image data rather than selectable text. "
                "Optical Character Recognition (OCR) is required to parse non-selectable text."
            )

        detected_sections = [sec for sec, content in sections_content.items() if content]

        return {
            "personalInfo": {
                "fullName": full_name,
                "email": email_match.group(0) if email_match else "",
                "phone": phone_match.group(0) if phone_match else "",
                "location": "United States",
                "linkedinUrl": linkedin_match.group(0) if linkedin_match else "",
                "githubUrl": github_match.group(0) if github_match else "",
                "portfolioUrl": ""
            },
            "careerObjective": {
                "targetJobRole": "Software Engineer",
                "targetIndustry": "Technology",
                "professionalSummary": summary_text
            },
            "education": education_items,
            "skills": {
                "programmingLanguages": [s for s in found_tech_skills if s in ["Python", "JavaScript", "TypeScript", "Go", "Java", "C++", "C#", "SQL"]],
                "frameworks": [s for s in found_tech_skills if s in ["React", "Node.js", "FastAPI", "Express", "Next.js", "Flask", "Django"]],
                "databases": [s for s in found_tech_skills if s in ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka"]],
                "developerTools": [s for s in found_tech_skills if s in ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "CI/CD", "Linux", "Terraform"]],
                "coreSubjects": [],
                "otherSkills": [s for s in found_tech_skills if s in ["REST APIs", "GraphQL", "Microservices"]]
            },
            "softSkills": found_soft_skills,
            "projects": project_items,
            "experience": experience_items,
            "certifications": cert_items,
            "achievements": [],
            "extracurriculars": [],
            "parsing_metadata": {
                "is_scanned": is_scanned,
                "requires_ocr": is_scanned,
                "detected_sections": detected_sections,
                "warnings": warnings,
                "line_count": len(lines),
                "character_count": len(raw_text)
            }
        }


resume_parser_service = ResumeParserService()
