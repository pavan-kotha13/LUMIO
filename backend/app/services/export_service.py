import io
from typing import Dict, Any

try:
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


class ExportService:
    """
    Generates ATS-conscious single-column resume documents in DOCX and PDF/HTML formats.
    """

    def generate_docx(self, resume_data: Dict[str, Any]) -> bytes:
        """Create single-column Word document matching ATS best practices."""
        doc = docx.Document() if HAS_DOCX else None
        if not doc:
            # Fallback plain-text formatted output
            text_rep = self.generate_plain_text(resume_data)
            return text_rep.encode("utf-8")

        # Set standard 0.75-inch margins
        for section in doc.sections:
            section.top_margin = Inches(0.75)
            section.bottom_margin = Inches(0.75)
            section.left_margin = Inches(0.75)
            section.right_margin = Inches(0.75)

        p_info = resume_data.get("personalInfo", {})
        
        # Header / Candidate Name
        h1 = doc.add_paragraph()
        h1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_name = h1.add_run(p_info.get("fullName", "Candidate Name"))
        run_name.font.size = Pt(20)
        run_name.font.bold = True
        run_name.font.name = "Calibri"

        # Subtitle Contact Bar
        contact_line = []
        if p_info.get("location"): contact_line.append(p_info.get("location"))
        if p_info.get("phone"): contact_line.append(p_info.get("phone"))
        if p_info.get("email"): contact_line.append(p_info.get("email"))
        if p_info.get("linkedin"): contact_line.append(p_info.get("linkedin"))
        if p_info.get("github"): contact_line.append(p_info.get("github"))

        p_contact = doc.add_paragraph(" | ".join(contact_line))
        p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_contact.paragraph_format.space_after = Pt(12)

        # Summary Section
        summary = resume_data.get("summary")
        if summary:
            self._add_heading(doc, "PROFESSIONAL SUMMARY")
            p_sum = doc.add_paragraph(summary)
            p_sum.paragraph_format.space_after = Pt(10)

        # Technical Skills
        skills = resume_data.get("skills", {})
        tech_skills = skills.get("technical", []) if isinstance(skills, dict) else skills
        tools = skills.get("softAndTools", []) if isinstance(skills, dict) else []
        if tech_skills or tools:
            self._add_heading(doc, "TECHNICAL SKILLS")
            if tech_skills:
                p_sk = doc.add_paragraph()
                r1 = p_sk.add_run("Languages & Frameworks: ")
                r1.bold = True
                p_sk.add_run(", ".join(tech_skills))
            if tools:
                p_to = doc.add_paragraph()
                r2 = p_to.add_run("Tools & Architectures: ")
                r2.bold = True
                p_to.add_run(", ".join(tools))
            doc.add_paragraph().paragraph_format.space_after = Pt(6)

        # Experience Section
        experience = resume_data.get("experience", [])
        if experience:
            self._add_heading(doc, "PROFESSIONAL EXPERIENCE")
            for exp in experience:
                p_role = doc.add_paragraph()
                r_title = p_role.add_run(exp.get("jobTitle", "Role"))
                r_title.bold = True
                p_role.add_run(f" | {exp.get('company', 'Company')} ({exp.get('startDate', '')} - {exp.get('endDate', 'Present')})")
                
                for bullet in exp.get("bullets", []):
                    if bullet.strip():
                        bp = doc.add_paragraph(bullet.strip(), style="List Bullet")
                        bp.paragraph_format.space_after = Pt(2)

        # Projects Section
        projects = resume_data.get("projects", [])
        if projects:
            self._add_heading(doc, "TECHNICAL PROJECTS")
            for proj in projects:
                p_proj = doc.add_paragraph()
                r_p = p_proj.add_run(proj.get("title", "Project"))
                r_p.bold = True
                if proj.get("tech"):
                    p_proj.add_run(f" | Tech: {proj.get('tech')}")
                if proj.get("description"):
                    doc.add_paragraph(proj.get("description"))
                for b in proj.get("bullets", []):
                    if b.strip():
                        bp = doc.add_paragraph(b.strip(), style="List Bullet")
                        bp.paragraph_format.space_after = Pt(2)

        # Education Section
        education = resume_data.get("education", [])
        if education:
            self._add_heading(doc, "EDUCATION")
            for edu in education:
                p_edu = doc.add_paragraph()
                r_deg = p_edu.add_run(edu.get("degree", "Degree"))
                r_deg.bold = True
                p_edu.add_run(f" — {edu.get('institution', 'Institution')} ({edu.get('graduationYear', '')})")
                if edu.get("details"):
                    doc.add_paragraph(edu.get("details"))

        # Certifications Section
        certifications = resume_data.get("certifications", [])
        if certifications:
            self._add_heading(doc, "CERTIFICATIONS & LICENSES")
            for cert in certifications:
                p_cert = doc.add_paragraph()
                if isinstance(cert, dict):
                    r_c = p_cert.add_run(cert.get("name", "Certification"))
                    r_c.bold = True
                    issuer_info = cert.get("issuer", "")
                    date_info = cert.get("issueDate", "")
                    meta = " — ".join([x for x in [issuer_info, date_info] if x])
                    if meta:
                        p_cert.add_run(f" ({meta})")
                else:
                    p_cert.add_run(str(cert))

        # Achievements Section
        achievements = resume_data.get("achievements", [])
        if achievements:
            self._add_heading(doc, "HONORS & KEY ACHIEVEMENTS")
            for ach in achievements:
                p_ach = doc.add_paragraph()
                if isinstance(ach, dict):
                    r_a = p_ach.add_run(ach.get("title", "Achievement"))
                    r_a.bold = True
                    if ach.get("date"):
                        p_ach.add_run(f" ({ach.get('date')})")
                    if ach.get("description"):
                        doc.add_paragraph(ach.get("description"))
                else:
                    p_ach.add_run(str(ach))

        # Extracurriculars Section
        extracurriculars = resume_data.get("extracurriculars", [])
        if extracurriculars:
            self._add_heading(doc, "EXTRACURRICULAR ACTIVITIES & LEADERSHIP")
            for extra in extracurriculars:
                p_ex = doc.add_paragraph()
                if isinstance(extra, dict):
                    r_ex = p_ex.add_run(f"{extra.get('role', 'Participant')} — {extra.get('organization', 'Organization')}")
                    r_ex.bold = True
                    if extra.get("startDate") or extra.get("endDate"):
                        p_ex.add_run(f" ({extra.get('startDate', '')} - {extra.get('endDate', '')})")
                    if extra.get("description"):
                        doc.add_paragraph(extra.get("description"))
                else:
                    p_ex.add_run(str(extra))

        out_buffer = io.BytesIO()
        doc.save(out_buffer)
        return out_buffer.getvalue()

    def _add_heading(self, doc, title: str):
        h = doc.add_paragraph()
        run = h.add_run(title)
        run.bold = True
        run.font.size = Pt(11)
        run.font.name = "Calibri"
        run.font.color.rgb = RGBColor(27, 67, 50)  # Forest Green #1B4332
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(4)

    def generate_html(self, resume_data: Dict[str, Any]) -> str:
        """Generate high-fidelity HTML for browser printing / PDF generation."""
        p_info = resume_data.get("personalInfo", {})
        summary = resume_data.get("summary", "")
        skills = resume_data.get("skills", {})
        experience = resume_data.get("experience", [])
        projects = resume_data.get("projects", [])
        education = resume_data.get("education", [])

        contact_parts = [
            p_info.get("location"),
            p_info.get("phone"),
            p_info.get("email"),
            p_info.get("linkedin"),
            p_info.get("github")
        ]
        contact_str = " &bull; ".join([p for p in contact_parts if p])

        tech_skills = skills.get("technical", []) if isinstance(skills, dict) else skills
        tools = skills.get("softAndTools", []) if isinstance(skills, dict) else []

        exp_html = ""
        for exp in experience:
            bullets_html = "".join([f"<li>{b}</li>" for b in exp.get("bullets", [])])
            exp_html += f"""
            <div class="item">
                <div class="item-header">
                    <strong>{exp.get('jobTitle')}</strong> &mdash; <span>{exp.get('company')}</span>
                    <span class="dates">{exp.get('startDate')} - {exp.get('endDate')}</span>
                </div>
                <ul>{bullets_html}</ul>
            </div>
            """

        proj_html = ""
        for p in projects:
            p_bullets = "".join([f"<li>{b}</li>" for b in p.get("bullets", [])])
            proj_html += f"""
            <div class="item">
                <div class="item-header">
                    <strong>{p.get('title')}</strong> <span class="tech-tag">[{p.get('tech')}]</span>
                </div>
                <p>{p.get('description', '')}</p>
                <ul>{p_bullets}</ul>
            </div>
            """

        edu_html = ""
        for edu in education:
            edu_html += f"""
            <div class="item">
                <div class="item-header">
                    <strong>{edu.get('degree')}</strong> &mdash; <span>{edu.get('institution')}</span>
                    <span class="dates">{edu.get('graduationYear')}</span>
                </div>
                {f'<p class="details">{edu.get("details")}</p>' if edu.get("details") else ''}
            </div>
            """

        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{p_info.get('fullName', 'Resume')}</title>
<style>
  @page {{ margin: 0.75in; size: letter; }}
  body {{ font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.4; font-size: 10.5pt; margin: 0; padding: 20px; }}
  h1 {{ text-align: center; font-size: 18pt; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }}
  .contact {{ text-align: center; font-size: 9.5pt; color: #444; margin-bottom: 16px; border-bottom: 1.5px solid #1B4332; padding-bottom: 8px; }}
  h2 {{ font-size: 11pt; text-transform: uppercase; color: #1B4332; border-bottom: 1px solid #ccc; margin: 12px 0 6px 0; letter-spacing: 0.5px; }}
  .item {{ margin-bottom: 8px; }}
  .item-header {{ display: flex; justify-content: space-between; font-size: 10.5pt; margin-bottom: 2px; }}
  .dates {{ font-style: italic; color: #555; }}
  .tech-tag {{ font-size: 9pt; color: #555; }}
  ul {{ margin: 2px 0 6px 18px; padding: 0; }}
  li {{ margin-bottom: 2px; }}
  p {{ margin: 2px 0; }}
</style>
</head>
<body>
  <h1>{p_info.get('fullName', 'Candidate Name')}</h1>
  <div class="contact">{contact_str}</div>

  {f'<h2>Professional Summary</h2><p>{summary}</p>' if summary else ''}

  <h2>Technical Skills</h2>
  <p><strong>Languages & Frameworks:</strong> {", ".join(tech_skills)}</p>
  {f'<p><strong>Tools & Practices:</strong> {", ".join(tools)}</p>' if tools else ''}

  <h2>Professional Experience</h2>
  {exp_html}

  <h2>Technical Projects</h2>
  {proj_html}

  <h2>Education</h2>
  {edu_html}
</body>
</html>"""

    def generate_pdf(self, resume_data: Dict[str, Any]) -> bytes:
        """Create ATS-compliant single-column PDF with Forest Green styling."""
        if not HAS_REPORTLAB:
            return self.generate_plain_text(resume_data).encode("utf-8")

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        story = []
        styles = getSampleStyleSheet()

        forest_green = colors.HexColor("#1B4332")
        charcoal = colors.HexColor("#1A1A1A")
        muted_grey = colors.HexColor("#555555")
        rule_grey = colors.HexColor("#D1D5DB")

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=forest_green,
            alignment=1
        )

        contact_style = ParagraphStyle(
            'ContactStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=muted_grey,
            alignment=1
        )

        section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=forest_green,
            spaceAfter=3,
            keepWithNext=True
        )

        item_title_style = ParagraphStyle(
            'ItemTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=charcoal
        )

        item_sub_style = ParagraphStyle(
            'ItemSub',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=12,
            textColor=muted_grey
        )

        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=charcoal
        )

        bullet_style = ParagraphStyle(
            'Bullet',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=charcoal,
            leftIndent=14,
            firstLineIndent=-10,
            spaceAfter=2
        )

        p_info = resume_data.get("personalInfo", {}) or resume_data.get("contact", {}) or {}
        name = p_info.get("fullName") or p_info.get("name") or resume_data.get("title") or "Candidate Name"
        story.append(Paragraph(name, title_style))
        story.append(Spacer(1, 3))

        contact_parts = []
        if p_info.get("email"): contact_parts.append(p_info["email"])
        if p_info.get("phone"): contact_parts.append(p_info["phone"])
        if p_info.get("location"): contact_parts.append(p_info["location"])
        if p_info.get("linkedin"): contact_parts.append(p_info["linkedin"])
        if p_info.get("github"): contact_parts.append(p_info["github"])

        if contact_parts:
            story.append(Paragraph(" • ".join(contact_parts), contact_style))
        story.append(Spacer(1, 8))

        def add_section(header_text: str):
            story.append(Spacer(1, 4))
            story.append(Paragraph(header_text.upper(), section_header_style))
            story.append(HRFlowable(width="100%", thickness=1, color=rule_grey, spaceBefore=2, spaceAfter=5))

        # Professional Summary
        summary = resume_data.get("summary", "").strip()
        if summary:
            add_section("Professional Summary")
            story.append(Paragraph(summary, body_style))

        # Technical Skills
        skills = resume_data.get("skills", {})
        tech_skills = skills.get("technical", []) if isinstance(skills, dict) else skills
        tools = skills.get("softAndTools", []) if isinstance(skills, dict) else []
        all_skills = list(tech_skills) + list(tools)
        if all_skills:
            add_section("Technical Skills")
            story.append(Paragraph(" • ".join(all_skills), body_style))

        # Professional Experience
        experience = resume_data.get("experience", [])
        if experience:
            add_section("Work Experience")
            for exp in experience:
                role = exp.get("jobTitle") or exp.get("role") or "Professional Role"
                company = exp.get("company", "Company")
                start = exp.get("startDate", "")
                end = exp.get("endDate", "Present")
                date_str = exp.get("duration") or f"{start} - {end}".strip(" -")

                header_text = f"<b>{role}</b> — {company}"
                if date_str:
                    t = Table([[Paragraph(header_text, item_title_style), Paragraph(date_str, item_sub_style)]], colWidths=[400, 140])
                    t.setStyle(TableStyle([('ALIGN', (1, 0), (1, 0), 'RIGHT'), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
                    story.append(t)
                else:
                    story.append(Paragraph(header_text, item_title_style))

                bullets = exp.get("bullets", [])
                for b in bullets:
                    if b.strip():
                        story.append(Paragraph(f"• {b.strip()}", bullet_style))
                story.append(Spacer(1, 4))

        # Key Projects
        projects = resume_data.get("projects", [])
        if projects:
            add_section("Key Projects")
            for proj in projects:
                p_title = proj.get("title", "Project")
                techs = proj.get("tech") or ", ".join(proj.get("technologies", []))
                header_str = f"<b>{p_title}</b>" + (f" ({techs})" if techs else "")
                story.append(Paragraph(header_str, item_title_style))
                if proj.get("description"):
                    story.append(Paragraph(proj.get("description"), body_style))

                bullets = proj.get("bullets", [])
                for b in bullets:
                    if b.strip():
                        story.append(Paragraph(f"• {b.strip()}", bullet_style))
                story.append(Spacer(1, 4))

        # Education
        education = resume_data.get("education", [])
        if education:
            add_section("Education")
            for edu in education:
                degree = edu.get("degree", "Degree")
                inst = edu.get("institution") or edu.get("school") or "Institution"
                grad_year = edu.get("graduationYear") or edu.get("year") or ""
                edu_str = f"<b>{degree}</b> — {inst}"
                if grad_year:
                    t = Table([[Paragraph(edu_str, item_title_style), Paragraph(str(grad_year), item_sub_style)]], colWidths=[420, 120])
                    t.setStyle(TableStyle([('ALIGN', (1, 0), (1, 0), 'RIGHT'), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
                    story.append(t)
                else:
                    story.append(Paragraph(edu_str, item_title_style))
                story.append(Spacer(1, 2))

        # Certifications
        certifications = resume_data.get("certifications", [])
        if certifications:
            add_section("Certifications & Licenses")
            for cert in certifications:
                if isinstance(cert, dict):
                    c_name = cert.get("name", "Certification")
                    c_issuer = cert.get("issuer", "")
                    c_date = cert.get("issueDate", "")
                    meta = " — ".join([x for x in [c_issuer, c_date] if x])
                    line = f"<b>{c_name}</b>" + (f" ({meta})" if meta else "")
                    story.append(Paragraph(line, item_title_style))
                else:
                    story.append(Paragraph(f"• {str(cert)}", bullet_style))
                story.append(Spacer(1, 2))

        # Honors & Key Achievements
        achievements = resume_data.get("achievements", [])
        if achievements:
            add_section("Honors & Key Achievements")
            for ach in achievements:
                if isinstance(ach, dict):
                    a_title = ach.get("title", "Achievement")
                    a_date = ach.get("date", "")
                    head = f"<b>{a_title}</b>" + (f" ({a_date})" if a_date else "")
                    story.append(Paragraph(head, item_title_style))
                    if ach.get("description"):
                        story.append(Paragraph(ach.get("description"), body_style))
                else:
                    story.append(Paragraph(f"• {str(ach)}", bullet_style))
                story.append(Spacer(1, 2))

        # Extracurricular Activities
        extracurriculars = resume_data.get("extracurriculars", [])
        if extracurriculars:
            add_section("Extracurricular Activities & Leadership")
            for ex in extracurriculars:
                if isinstance(ex, dict):
                    ex_role = ex.get("role", "Participant")
                    ex_org = ex.get("organization", "Organization")
                    ex_dates = f"{ex.get('startDate', '')} - {ex.get('endDate', '')}".strip(" -")
                    head = f"<b>{ex_role}</b> — {ex_org}" + (f" ({ex_dates})" if ex_dates else "")
                    story.append(Paragraph(head, item_title_style))
                    if ex.get("description"):
                        story.append(Paragraph(ex.get("description"), body_style))
                else:
                    story.append(Paragraph(f"• {str(ex)}", bullet_style))
                story.append(Spacer(1, 2))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_plain_text(self, resume_data: Dict[str, Any]) -> str:
        p_info = resume_data.get("personalInfo", {})
        return f"{p_info.get('fullName')}\n{p_info.get('email')} | {p_info.get('phone')}\n\nSUMMARY:\n{resume_data.get('summary')}"


export_service = ExportService()
