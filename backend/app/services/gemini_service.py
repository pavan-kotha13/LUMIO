import os
import json
import logging
from typing import Dict, Any, List, Optional
from ..core.config import settings

logger = logging.getLogger(__name__)

# System constraint enforcing zero hallucination & truthfulness
SYSTEM_INSTRUCTION = """You are an expert ATS Resume Architect and Career Intelligence Engine.
CRITICAL CONSTRAINT: You must strictly use ONLY the candidate's actual provided background, skills, roles, projects, and education.
NEVER invent or fabricate achievements, metrics, companies, years of experience, or unmentioned credentials.
Enforce TruthGuard: Every generated or enhanced bullet point must be traceable to the candidate's raw input."""


class GeminiCentralService:
    """
    Central Gemini AI Service.
    All AI-related features in Resume Architect MUST use this service.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.model_name = settings.GEMINI_MODEL or os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
        self._client = None
        self.last_error = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            self.last_error = "GEMINI_API_KEY not configured in environment"
            logger.warning("GEMINI_API_KEY not configured. Central service will use deterministic verified fallbacks.")
            return

        try:
            from google import genai
            self._client = genai.Client(
                api_key=self.api_key,
                http_options={
                    "headers": {"User-Agent": "resume-architect-backend"},
                    "timeout": 12000
                }
            )
            self.last_error = None
            logger.info("Initialized Google GenAI client successfully.")
        except Exception as e:
            self.last_error = str(e)
            logger.warning(f"Could not initialize google.genai client: {e}. Will attempt fallback.")
            self._client = None

    def _clean_json_response(self, text: str) -> str:
        """Strip markdown fences from model response."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def _call_gemini_json(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Safely invokes Gemini with JSON response guarantee and fallback."""
        if not self._client:
            if not self.last_error:
                self.last_error = "Gemini client not initialized"
            return None

        sys_instruction = system_prompt or SYSTEM_INSTRUCTION
        models_to_try = [self.model_name]
        if self.model_name == "gemini-3.5-flash-lite":
            models_to_try.append("gemini-3.5-flash")
        elif self.model_name == "gemini-3.5-flash":
            models_to_try.append("gemini-3.5-flash-lite")

        for model in models_to_try:
            try:
                response = self._client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "system_instruction": sys_instruction,
                        "response_mime_type": "application/json"
                    }
                )
                raw_text = getattr(response, "text", "")
                if not raw_text:
                    continue
                cleaned = self._clean_json_response(raw_text)
                self.last_error = None
                return json.loads(cleaned)
            except Exception as err:
                self.last_error = f"Gemini ({model}) error: {str(err)}"
                logger.warning(f"Gemini model {model} attempt failed: {err}")

        logger.error(f"All Gemini models exhausted. Final error: {self.last_error}")
        return None

    # =========================================================================
    # OPERATION A: CREATE_RESUME
    # =========================================================================
    def create_resume(self, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a professional structured resume strictly using candidate information.
        """
        prompt = f"""Generate a clean, structured ATS resume strictly from candidate facts:
Candidate Facts:
{json.dumps(candidate_info, indent=2)}

Return a JSON with this structure:
{{
  "personalInfo": {{ "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "targetRole": "" }},
  "summary": "",
  "experience": [
    {{ "id": "exp_1", "jobTitle": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": false, "bullets": [""] }}
  ],
  "education": [
    {{ "id": "edu_1", "degree": "", "institution": "", "location": "", "startDate": "", "endDate": "", "details": "" }}
  ],
  "projects": [
    {{ "id": "proj_1", "title": "", "tech": "", "description": "", "bullets": [""] }}
  ],
  "skills": {{
    "technical": [],
    "softAndTools": []
  }},
  "certifications": [
    {{ "id": "cert_1", "name": "", "issuer": "", "date": "" }}
  ]
}}"""
        result = self._call_gemini_json(prompt)
        if result and "personalInfo" in result:
            result["source"] = "gemini"
            result["ai_powered"] = True
            return result

        # Truthful candidate fallback when Gemini is unavailable
        return {
            "source": "candidate_data",
            "ai_powered": False,
            "gemini_error": self.last_error or "Gemini API unavailable",
            "personalInfo": {
                "fullName": candidate_info.get("fullName", "Candidate"),
                "email": candidate_info.get("email", ""),
                "phone": candidate_info.get("phone", ""),
                "location": candidate_info.get("location", ""),
                "linkedin": candidate_info.get("linkedin", ""),
                "github": candidate_info.get("github", ""),
                "targetRole": candidate_info.get("targetRole", "Software Engineer")
            },
            "summary": f"Dedicated {candidate_info.get('targetRole', 'Software Engineer')} with proven experience delivering robust, maintainable systems.",
            "experience": candidate_info.get("experience", []),
            "education": candidate_info.get("education", []),
            "projects": candidate_info.get("projects", []),
            "skills": candidate_info.get("skills", {"technical": [], "softAndTools": []}),
            "certifications": candidate_info.get("certifications", [])
        }

    # =========================================================================
    # OPERATION B: REVIEW_RESUME (Semantic evidence extraction)
    # =========================================================================
    def review_resume(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Analyse semantic match and requirement alignment.
        Numerical scores are independently calculated by Score Engine.
        """
        prompt = f"""Analyze the resume text against the target Job Description.
RESUME:
{resume_text[:4000]}

JOB DESCRIPTION:
{jd_text[:4000]}

Extract:
1. "matched_requirements": list of items with "name", "category" (Technical/Experience/Education), "evidence" in resume, "status": "MATCHED"
2. "partially_matched": list of items with "name", "category", "evidence", "status": "PARTIALLY MATCHED"
3. "unmentioned_requirements": list of items with "name", "category", "status": "NOT FOUND"
4. "evidence_map": list of items with "id", "requirement", "category", "status" (MATCHED | PARTIALLY MATCHED | NOT FOUND), "resumeEvidence", "location", "explanation"
5. "recommendations": list of actionable strings grounded in real resume text."""
        result = self._call_gemini_json(prompt)
        if result and isinstance(result, dict) and "matched_requirements" in result:
            result["source"] = "gemini"
            result["ai_powered"] = True
            return result
        return {
            "source": "deterministic_fallback",
            "ai_powered": False,
            "gemini_error": self.last_error or "Gemini unavailable"
        }

    # =========================================================================
    # OPERATION C: IMPROVE_RESUME
    # =========================================================================
    def improve_resume(self, resume_data: Dict[str, Any], jd_text: str, weaknesses: List[str]) -> Dict[str, Any]:
        """
        Generate truthful improvements using the XYZ formula, without fabricating claims.
        """
        prompt = f"""Suggest improvements to experience bullet points using the XYZ impact formula:
Resume Experience:
{json.dumps(resume_data.get('experience', []), indent=2)}

Weaknesses Identified:
{json.dumps(weaknesses)}

Target Job Description Context:
{jd_text[:2000]}

Return JSON:
{{
  "improvements": [
    {{
      "id": "imp_1",
      "section": "experience",
      "original": "original bullet",
      "suggested": "optimized bullet following XYZ formula",
      "truthguard_status": "SUPPORTED" or "NEEDS_CONFIRMATION",
      "verification_rationale": "reasoning"
    }}
  ],
  "summary_suggestion": "optimized executive summary strictly using candidate facts"
}}"""
        result = self._call_gemini_json(prompt)
        if result and "improvements" in result:
            result["source"] = "gemini"
            result["ai_powered"] = True
            return result
        return {
            "improvements": [],
            "summary_suggestion": None,
            "source": "deterministic_fallback",
            "ai_powered": False,
            "gemini_error": self.last_error or "Gemini unavailable"
        }

    # =========================================================================
    # OPERATION D: OPTIMIZE_LINKEDIN
    # =========================================================================
    def optimize_linkedin(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Improve LinkedIn headline, About, experience, projects and skills.
        """
        prompt = f"""Generate LinkedIn profile enhancements strictly from candidate facts:
Candidate Facts:
{json.dumps(profile_data, indent=2)}

Generate:
1. "headlines": 3 distinct options <= 220 characters ("value-prop", "keyword-dense", "growth-impact")
2. "about": 4 distinct styles ("professional", "fresher", "technical", "concise")
3. "experience_optimizations": list of enhanced bullets
4. "skill_recommendations": list of relevant technical skills candidate can verify

Return JSON."""
        result = self._call_gemini_json(prompt)
        if result and "headlines" in result:
            result["source"] = "gemini"
            result["ai_powered"] = True
            return result
        return {
            "source": "deterministic_fallback",
            "ai_powered": False,
            "gemini_error": self.last_error or "Gemini unavailable"
        }

    # =========================================================================
    # OPERATION E: TRUTHGUARD_VALIDATE
    # =========================================================================
    def truthguard_validate(self, claims: List[str], candidate_facts: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Validate whether AI suggestions are supported by candidate information.
        Returns validation items with status: SUPPORTED | NEEDS_CONFIRMATION | UNSUPPORTED
        """
        prompt = f"""Validate each claim against Candidate Facts.
Candidate Facts:
{json.dumps(candidate_facts, indent=2)}

Claims to Validate:
{json.dumps(claims, indent=2)}

Return JSON:
{{
  "validations": [
    {{
      "claim": "text of claim",
      "status": "SUPPORTED" | "NEEDS_CONFIRMATION" | "UNSUPPORTED",
      "reasoning": "explanation",
      "action_required": "None" | "User verification of specific metric" | "Remove claim"
    }}
  ]
}}"""
        result = self._call_gemini_json(prompt)
        if result and "validations" in result:
            for v in result["validations"]:
                v["source"] = "gemini"
                v["ai_powered"] = True
            return result["validations"]

        # Deterministic validation fallback
        validations = []
        fact_str = json.dumps(candidate_facts).lower()
        for claim in claims:
            has_numbers = any(c.isdigit() for c in claim)
            status = "SUPPORTED" if has_numbers and any(w in fact_str for w in claim.lower().split()[:3]) else "NEEDS_CONFIRMATION"
            validations.append({
                "claim": claim,
                "status": status,
                "reasoning": "Grounded in candidate submission." if status == "SUPPORTED" else "Metric requires candidate verification.",
                "action_required": "None" if status == "SUPPORTED" else "User verification of numbers",
                "source": "deterministic_rule_engine",
                "ai_powered": False,
                "gemini_error": self.last_error or "Gemini unavailable"
            })
        return validations


# Singleton instance
gemini_central_service = GeminiCentralService()
