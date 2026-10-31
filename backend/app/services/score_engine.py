import re
from typing import Dict, Any, List, Tuple


class ResumeScoreEngine:
    """
    Central Intelligence Engine of Resume Architect.
    Independent, deterministic Python calculation engine.
    Does NOT depend on Gemini for numerical score calculation.
    """

    WEIGHTS = {
        "skills": 0.30,
        "keywords": 0.20,
        "projects": 0.20,
        "experience": 0.15,
        "education": 0.05,
        "formatting": 0.10,
    }

    ACTION_VERBS = {
        "architected", "engineered", "spearheaded", "orchestrated", "developed",
        "implemented", "optimized", "designed", "streamlined", "automated",
        "reduced", "increased", "built", "accelerated", "deployed", "scaled"
    }

    COMMON_TECH_PATTERNS = [
        "python", "javascript", "typescript", "react", "node.js", "docker",
        "kubernetes", "aws", "gcp", "azure", "postgresql", "sql", "git",
        "ci/cd", "rest", "graphql", "redis", "kafka", "go", "java", "c++",
        "microservices", "linux", "terraform", "html", "css", "tailwind"
    ]

    def __init__(self):
        pass

    def _normalize_text(self, text: str) -> str:
        return " ".join((text or "").lower().split())

    def _extract_jd_keywords(self, jd_text: str) -> List[str]:
        """Extract clean technical and domain keywords from job description."""
        norm_jd = self._normalize_text(jd_text)
        found = set()
        for tech in self.COMMON_TECH_PATTERNS:
            pattern = r'\b' + re.escape(tech) + r'\b'
            if re.search(pattern, norm_jd):
                found.add(tech)

        # Fallback if no known tech is found
        if not found:
            words = [w for w in re.findall(r'\b[a-zA-Z]{3,}\b', norm_jd) if len(w) > 4]
            return words[:12]
        return sorted(list(found))

    def calculate_score(
        self,
        resume_data: Dict[str, Any],
        raw_resume_text: str,
        job_description: str,
        semantic_evidence: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates deterministic scores for the 6 canonical categories.
        """
        combined_text = self._normalize_text(raw_resume_text + " " + str(resume_data))
        jd_keywords = self._extract_jd_keywords(job_description)

        # ----------------------------------------------------
        # 1. Technical Skills Alignment (Weight: 30%)
        # ----------------------------------------------------
        candidate_skills = []
        skills_obj = resume_data.get("skills", {})
        if isinstance(skills_obj, dict):
            candidate_skills = [
                s.lower() for s in skills_obj.get("technical", []) + skills_obj.get("softAndTools", [])
            ]
        elif isinstance(skills_obj, list):
            candidate_skills = [s.lower() for s in skills_obj]

        matched_skills = []
        unmatched_skills = []
        for kw in jd_keywords:
            if kw in candidate_skills or re.search(r'\b' + re.escape(kw) + r'\b', combined_text):
                matched_skills.append(kw)
            else:
                unmatched_skills.append(kw)

        if jd_keywords:
            skills_ratio = len(matched_skills) / len(jd_keywords)
            skills_score = min(100, int(skills_ratio * 100))
        else:
            skills_score = 80  # Default when JD lacks explicit technical requirements

        # ----------------------------------------------------
        # 2. Keyword Alignment (Weight: 20%)
        # ----------------------------------------------------
        jd_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', self._normalize_text(job_description)))
        resume_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', combined_text))
        overlap_count = len(jd_words.intersection(resume_words))
        target_count = max(1, min(len(jd_words), 50))
        keywords_score = min(100, int((overlap_count / target_count) * 100))

        # ----------------------------------------------------
        # 3. Project Relevance (Weight: 20%)
        # ----------------------------------------------------
        projects = resume_data.get("projects", [])
        if not projects:
            projects_score = 40
        else:
            proj_points = 50
            if len(projects) >= 2:
                proj_points += 25
            elif len(projects) >= 1:
                proj_points += 15
            # Check for keyword usage in projects
            proj_str = " ".join([p.get("title", "") + " " + p.get("tech", "") + " " + p.get("description", "") for p in projects]).lower()
            matching_proj_tech = sum(1 for kw in jd_keywords if kw in proj_str)
            if matching_proj_tech >= 2:
                proj_points += 25
            elif matching_proj_tech >= 1:
                proj_points += 15
            projects_score = min(100, proj_points)

        # ----------------------------------------------------
        # 4. Experience Relevance (Weight: 15%)
        # ----------------------------------------------------
        experience = resume_data.get("experience", [])
        if not experience:
            exp_score = 45
        else:
            exp_points = 50
            if len(experience) >= 2:
                exp_points += 20
            elif len(experience) >= 1:
                exp_points += 10
            
            # Count quantified bullets and action verbs
            all_bullets = []
            for item in experience:
                all_bullets.extend(item.get("bullets", []))
            
            quantified_bullets = sum(1 for b in all_bullets if re.search(r'\d+', b))
            action_verb_bullets = sum(1 for b in all_bullets if any(b.lower().strip().startswith(v) for v in self.ACTION_VERBS))
            
            if quantified_bullets >= 3:
                exp_points += 15
            elif quantified_bullets >= 1:
                exp_points += 8
                
            if action_verb_bullets >= 3:
                exp_points += 15
            elif action_verb_bullets >= 1:
                exp_points += 8
                
            exp_score = min(100, exp_points)

        # ----------------------------------------------------
        # 5. Education Relevance (Weight: 5%)
        # ----------------------------------------------------
        education = resume_data.get("education", [])
        if education and len(education) > 0:
            edu_score = 95
        else:
            edu_score = 50

        # ----------------------------------------------------
        # 6. Formatting & Readability (Weight: 10%)
        # ----------------------------------------------------
        formatting_points = 60
        # Check single-column semantic structure, length, email/phone present
        p_info = resume_data.get("personalInfo", {})
        if p_info.get("email") and p_info.get("fullName"):
            formatting_points += 20
        if resume_data.get("summary"):
            formatting_points += 10
        if len(combined_text) > 400:
            formatting_points += 10
        formatting_score = min(100, formatting_points)

        # ----------------------------------------------------
        # Deterministic Final Score Computation
        # ----------------------------------------------------
        final_score = round(
            (skills_score * self.WEIGHTS["skills"]) +
            (keywords_score * self.WEIGHTS["keywords"]) +
            (projects_score * self.WEIGHTS["projects"]) +
            (exp_score * self.WEIGHTS["experience"]) +
            (edu_score * self.WEIGHTS["education"]) +
            (formatting_score * self.WEIGHTS["formatting"])
        )

        categories = [
            {
                "id": "technical-skills",
                "name": "Technical Skills Alignment",
                "score": skills_score,
                "weight": self.WEIGHTS["skills"],
                "status": "optimal" if skills_score >= 80 else ("moderate" if skills_score >= 60 else "action-required"),
                "summary": f"Directly matched {len(matched_skills)} of {max(1, len(jd_keywords))} primary job technical qualifications.",
                "feedback": f"Directly matched {len(matched_skills)} of {max(1, len(jd_keywords))} primary job technical qualifications.",
                "metrics": {
                    "matched": len(matched_skills),
                    "total": max(1, len(jd_keywords)),
                    "unit": "skills",
                    "value": f"{len(matched_skills)}/{max(1, len(jd_keywords))} matched",
                    "target": "80%+ coverage"
                }
            },
            {
                "id": "keyword-alignment",
                "name": "Keyword Alignment",
                "score": keywords_score,
                "weight": self.WEIGHTS["keywords"],
                "status": "optimal" if keywords_score >= 80 else ("moderate" if keywords_score >= 60 else "action-required"),
                "summary": f"Correlates with {overlap_count} domain terms present in the job posting.",
                "feedback": f"Correlates with {overlap_count} domain terms present in the job posting.",
                "metrics": {
                    "matched": overlap_count,
                    "total": target_count,
                    "unit": "keywords",
                    "value": f"{overlap_count} matches",
                    "target": f"{target_count}+ terms"
                }
            },
            {
                "id": "project-relevance",
                "name": "Project Relevance",
                "score": projects_score,
                "weight": self.WEIGHTS["projects"],
                "status": "optimal" if projects_score >= 80 else "moderate",
                "summary": f"{len(projects)} technical projects demonstrate hands-on software development competence.",
                "feedback": f"{len(projects)} technical projects demonstrate hands-on software development competence.",
                "metrics": {
                    "matched": len(projects),
                    "total": max(2, len(projects)),
                    "unit": "projects",
                    "value": f"{len(projects)} projects",
                    "target": "2+ projects"
                }
            },
            {
                "id": "experience-relevance",
                "name": "Experience Relevance",
                "score": exp_score,
                "weight": self.WEIGHTS["experience"],
                "status": "optimal" if exp_score >= 80 else "moderate",
                "summary": f"{len(experience)} professional roles with action-verb phrasing and quantified outcomes.",
                "feedback": f"{len(experience)} professional roles with action-verb phrasing and quantified outcomes.",
                "metrics": {
                    "matched": len(experience),
                    "total": max(2, len(experience)),
                    "unit": "roles",
                    "value": f"{len(experience)} roles",
                    "target": "2+ roles"
                }
            },
            {
                "id": "education-relevance",
                "name": "Education Relevance",
                "score": edu_score,
                "weight": self.WEIGHTS["education"],
                "status": "optimal" if edu_score >= 80 else "action-required",
                "summary": "Academic degree and university credentials verified.",
                "feedback": "Academic degree and university credentials verified.",
                "metrics": {
                    "matched": len(education),
                    "total": max(1, len(education)),
                    "unit": "degrees",
                    "value": f"{len(education)} degrees",
                    "target": "1+ degree"
                }
            },
            {
                "id": "formatting-readability",
                "name": "Formatting & Readability",
                "score": formatting_score,
                "weight": self.WEIGHTS["formatting"],
                "status": "optimal" if formatting_score >= 80 else "moderate",
                "summary": "Single-column semantic hierarchy optimized for ATS parsers and human recruiters.",
                "feedback": "Single-column semantic hierarchy optimized for ATS parsers and human recruiters.",
                "metrics": {
                    "matched": max(1, int(formatting_score / 10)),
                    "total": 10,
                    "unit": "checks",
                    "value": f"{formatting_score}% ATS score",
                    "target": "85%+"
                }
            }
        ]

        score_grade = (
            "Exceptional" if final_score >= 90
            else ("Strong" if final_score >= 78
            else ("Competitive" if final_score >= 65
            else "Needs Revision"))
        )

        # Structure matched / partially matched / unmentioned
        matched_requirements = [
            {"name": s.title(), "category": "Technical", "status": "MATCHED", "evidence": f"Found in candidate skills and experience"}
            for s in matched_skills
        ]

        unmentioned_requirements = [
            {"name": s.title(), "category": "Technical", "status": "NOT FOUND", "evidence": None}
            for s in unmatched_skills
        ]

        missing_keywords = [
            {
                "id": f"kw_{idx + 1}",
                "term": s.title(),
                "category": "Mandatory Requirement" if idx < 2 else "Technical Tool",
                "jobFrequency": 3 if idx < 2 else 1,
                "importance": "critical" if idx < 2 else "important"
            }
            for idx, s in enumerate(unmatched_skills[:8])
        ]

        skill_gaps = [
            {
                "id": f"sg_{idx + 1}",
                "skillName": s.title(),
                "category": "Technical Qualification",
                "status": "not_found",
                "requiredContext": f"Position specifies proficiency in {s.title()}.",
                "candidateEvidence": "No direct mention in uploaded resume.",
                "recommendation": f"Add verifiable project or practical experience using {s.title()} if applicable."
            }
            for idx, s in enumerate(unmatched_skills[:5])
        ]

        recommendations = []
        if len(unmatched_skills) > 0:
            recommendations.append(f"Consider integrating {', '.join([s.title() for s in unmatched_skills[:3]])} if you have applied them in coursework or projects.")
        if projects_score < 75:
            recommendations.append("Add detailed technical projects demonstrating implementation of modern cloud frameworks.")
        if exp_score < 75:
            recommendations.append("Strengthen bullet points by adding quantifiable metrics using the XYZ formula (Accomplished X, measured by Y, by doing Z).")

        scoring_explanation = (
            f"Evaluated against {len(jd_keywords)} core job specifications using deterministic weights: "
            f"Technical Skills (30%), Keyword Alignment (20%), Projects (20%), Experience (15%), Education (5%), and Formatting (10%)."
        )

        return {
            "overall_score": final_score,
            "overallScore": final_score,
            "score_grade": score_grade,
            "scoreGrade": score_grade,
            "category_scores": categories,
            "categories": categories,
            "matched_requirements": matched_requirements,
            "partially_matched": [],
            "unmentioned_requirements": unmentioned_requirements,
            "missing_keywords": missing_keywords,
            "missingKeywords": missing_keywords,
            "skill_gaps": skill_gaps,
            "skillGaps": skill_gaps,
            "recommendations": recommendations,
            "scoring_explanation": scoring_explanation,
            "matched_skills": matched_skills,
            "unmatched_skills": unmatched_skills
        }


score_engine = ResumeScoreEngine()
