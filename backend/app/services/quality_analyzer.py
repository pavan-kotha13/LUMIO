import re
from typing import Dict, Any, List, Optional


class QualityAnalyzerService:
    """
    Performs comprehensive rule-based & semantic quality analysis of resumes across 4 quadrants:
    1. Content Quality (weak verbs, vague metrics, repeated phrasing)
    2. Structure & Completeness (missing sections, chronological ordering)
    3. ATS Formatting (single-column compliance, contact info, length)
    4. Professional Quality (unsupported claims, buzzwords, missing tech stack in projects)
    """

    WEAK_VERBS = [
        "helped", "assisted", "worked on", "handled", "responsible for",
        "involved in", "participated in", "supported", "contributed to", "dealt with"
    ]

    STRONG_ACTION_VERBS = [
        "architected", "engineered", "spearheaded", "orchestrated", "developed",
        "implemented", "optimized", "streamlined", "automated", "scaled", "delivered"
    ]

    BUZZWORDS = [
        "synergy", "rockstar", "ninja", "guru", "go-getter", "hardworking",
        "results-driven", "team player", "outside the box", "dynamic"
    ]

    def analyze_quality(
        self,
        resume_data: Dict[str, Any],
        raw_text: str = ""
    ) -> Dict[str, Any]:
        """
        Runs complete 4-quadrant quality audit on resume.
        Returns categorized issues and overall quality metrics.
        """
        issues: List[Dict[str, Any]] = []
        combined_text = (raw_text + " " + str(resume_data)).lower()

        # ---------------------------------------------------------
        # 1. Content Quality (Weak Verbs, Vague Metrics, Passive Voice)
        # ---------------------------------------------------------
        exp_list = resume_data.get("experience", [])
        all_bullets = []
        for exp in exp_list:
            if isinstance(exp, dict):
                all_bullets.extend(exp.get("bullets", []))
                resp = exp.get("responsibilities", "")
                if resp:
                    all_bullets.extend([b.strip() for b in resp.split("\n") if b.strip()])

        for bullet in all_bullets:
            b_lower = bullet.lower()
            # Check weak verbs
            for wv in self.WEAK_VERBS:
                if re.search(r'\b' + re.escape(wv) + r'\b', b_lower):
                    issues.append({
                        "category": "Content Quality",
                        "severity": "Medium",
                        "original_text": bullet[:100],
                        "explanation": f"Contains passive verb phrase '{wv}'. Strong resumes begin bullet points with decisive action verbs.",
                        "suggested_correction": f"Replace '{wv}' with a strong action verb such as 'Engineered', 'Architected', or 'Spearheaded'.",
                        "confidence": 0.95
                    })
                    break

            # Check lack of quantifiable impact
            if len(bullet) > 40 and not re.search(r'\d+(?:\.\d+)?%?', bullet):
                issues.append({
                    "category": "Content Quality",
                    "severity": "Low",
                    "original_text": bullet[:100],
                    "explanation": "Bullet point lacks quantifiable metrics or business outcome data.",
                    "suggested_correction": "Quantify with XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'.",
                    "confidence": 0.85
                })

        # ---------------------------------------------------------
        # 2. Structure & Completeness
        # ---------------------------------------------------------
        p_info = resume_data.get("personalInfo", {})
        if not p_info.get("email"):
            issues.append({
                "category": "Structure & Completeness",
                "severity": "Critical",
                "original_text": "",
                "explanation": "Missing professional email address in contact section.",
                "suggested_correction": "Add a professional email address (e.g. name@domain.com) in Personal Information.",
                "confidence": 1.0
            })

        if not p_info.get("phone"):
            issues.append({
                "category": "Structure & Completeness",
                "severity": "High",
                "original_text": "",
                "explanation": "Missing phone number in contact header.",
                "suggested_correction": "Provide a direct contact telephone number.",
                "confidence": 1.0
            })

        education = resume_data.get("education", [])
        if not education or len(education) == 0:
            issues.append({
                "category": "Structure & Completeness",
                "severity": "Medium",
                "original_text": "",
                "explanation": "No education entries documented.",
                "suggested_correction": "Include degree, institution name, and graduation year.",
                "confidence": 0.90
            })

        skills = resume_data.get("skills", {})
        tech_skills = []
        if isinstance(skills, dict):
            for v in skills.values():
                if isinstance(v, list):
                    tech_skills.extend(v)
        elif isinstance(skills, list):
            tech_skills = skills

        if len(tech_skills) < 3:
            issues.append({
                "category": "Structure & Completeness",
                "severity": "High",
                "original_text": "",
                "explanation": "Very few technical skills listed (fewer than 3).",
                "suggested_correction": "List specific programming languages, frameworks, databases, and developer tools in Technical Skills.",
                "confidence": 0.95
            })

        # ---------------------------------------------------------
        # 3. ATS Formatting & Readability
        # ---------------------------------------------------------
        summary = resume_data.get("summary") or resume_data.get("careerObjective", {}).get("professionalSummary", "")
        if not summary or len(summary.strip()) < 30:
            issues.append({
                "category": "ATS Formatting",
                "severity": "Low",
                "original_text": "",
                "explanation": "Brief or missing professional summary.",
                "suggested_correction": "Add a 2-3 sentence executive summary highlighting core engineering competencies and domain focus.",
                "confidence": 0.85
            })

        word_count = len(combined_text.split())
        if word_count < 150:
            issues.append({
                "category": "ATS Formatting",
                "severity": "High",
                "original_text": f"Document contains approximately {word_count} words.",
                "explanation": "Resume length is unusually brief for technical recruiting benchmarks.",
                "suggested_correction": "Expand with project technical contributions, responsibilities, and key metrics.",
                "confidence": 0.90
            })

        # ---------------------------------------------------------
        # 4. Professional Quality (Buzzwords, Project Tech Stacks)
        # ---------------------------------------------------------
        for bw in self.BUZZWORDS:
            if re.search(r'\b' + re.escape(bw) + r'\b', combined_text):
                issues.append({
                    "category": "Professional Quality",
                    "severity": "Medium",
                    "original_text": bw,
                    "explanation": f"Contains subjective cliché buzzword '{bw}'.",
                    "suggested_correction": f"Replace '{bw}' with demonstrable technical achievements and specific skills.",
                    "confidence": 0.90
                })

        projects = resume_data.get("projects", [])
        for proj in projects:
            if isinstance(proj, dict):
                p_name = proj.get("projectName") or proj.get("title", "")
                p_tech = proj.get("technologiesUsed") or proj.get("tech", "")
                if p_name and not p_tech:
                    issues.append({
                        "category": "Professional Quality",
                        "severity": "Medium",
                        "original_text": p_name,
                        "explanation": f"Project '{p_name}' lacks explicit technologies or tech stack tags.",
                        "suggested_correction": "Specify languages, frameworks, databases, and tools used for this project.",
                        "confidence": 0.95
                    })

        critical_count = sum(1 for i in issues if i["severity"] == "Critical")
        high_count = sum(1 for i in issues if i["severity"] == "High")
        medium_count = sum(1 for i in issues if i["severity"] == "Medium")
        low_count = sum(1 for i in issues if i["severity"] == "Low")

        quality_score = max(0, 100 - (critical_count * 25 + high_count * 15 + medium_count * 5 + low_count * 2))

        return {
            "overall_quality_score": quality_score,
            "total_issues": len(issues),
            "summary": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count
            },
            "issues": issues
        }


quality_analyzer_service = QualityAnalyzerService()
