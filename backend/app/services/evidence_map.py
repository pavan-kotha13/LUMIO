import re
from typing import Dict, Any, List


class EvidenceMapService:
    """
    EvidenceMap generator that links job requirements directly
    to verifiable sections and exact quote citations within the candidate's resume.
    Statuses strictly adhere to: MATCHED | PARTIALLY MATCHED | NOT FOUND.
    """

    RELATED_TECH_MAP = {
        "kubernetes": ("docker", "Containers & Orchestration", "Demonstrates containerization proficiency with Docker, directly transferable to Kubernetes orchestration."),
        "typescript": ("javascript", "Web Scripting", "Strong foundation in JavaScript syntax and runtime, transferable to TypeScript typing system."),
        "aws": ("gcp", "Cloud Computing", "Multi-cloud architecture foundation in GCP, applicable to AWS cloud infrastructure."),
        "gcp": ("aws", "Cloud Computing", "Cloud infrastructure experience in AWS, transferable to GCP services."),
        "graphql": ("rest", "API Architecture", "Extensive experience designing REST APIs, bridging to GraphQL endpoint schemas."),
        "kafka": ("redis", "Message Queuing & Caching", "Experience with Redis in-memory pub/sub patterns, transferable to distributed streaming with Kafka."),
        "postgresql": ("sql", "Relational Database", "Direct database querying and indexing experience with SQL.")
    }

    def generate_evidence_map(
        self,
        resume_data: Dict[str, Any],
        raw_text: str,
        matched_skills: List[str],
        unmatched_skills: List[str],
        semantic_evidence: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        evidence_items = []
        raw_lower = (raw_text + " " + str(resume_data)).lower()

        # Check semantic evidence provided by Gemini if available
        semantic_map = {}
        if semantic_evidence and "evidence_map" in semantic_evidence:
            for item in semantic_evidence["evidence_map"]:
                semantic_map[item.get("requirement", "").lower()] = item

        # 1. Matched Requirements (Exact Grounded Evidence)
        for idx, skill in enumerate(matched_skills):
            skill_clean = skill.title()
            sem = semantic_map.get(skill.lower())
            
            location = "Skills Section"
            evidence_snippet = f"Documented in candidate skills: '{skill_clean}'."

            # Search in experience bullets
            for exp in resume_data.get("experience", []):
                company = exp.get("organisation") or exp.get("company", "Work Experience")
                bullets = exp.get("bullets", [])
                if not bullets and exp.get("responsibilities"):
                    bullets = [b.strip() for b in exp.get("responsibilities", "").split("\n") if b.strip()]
                for bullet in bullets:
                    if skill.lower() in bullet.lower():
                        location = f"Experience: {company}"
                        evidence_snippet = f"Demonstrated in bullet: \"{bullet.strip()[:140]}\""
                        break

            # Search in project tech stack & descriptions
            for proj in resume_data.get("projects", []):
                title = proj.get("projectName") or proj.get("title", "Project")
                tech = proj.get("technologiesUsed") or proj.get("tech", "")
                desc = proj.get("projectDescription") or proj.get("description", "")
                if skill.lower() in tech.lower() or skill.lower() in desc.lower():
                    location = f"Projects: {title}"
                    evidence_snippet = f"Applied in project tech: \"{tech}\""

            if sem:
                location = sem.get("location", location)
                evidence_snippet = sem.get("resumeEvidence", evidence_snippet)

            evidence_items.append({
                "id": f"ev_matched_{idx + 1}",
                "requirement": skill_clean,
                "category": "Technical Qualification",
                "status": "MATCHED",
                "resumeEvidence": evidence_snippet,
                "location": location,
                "explanation": f"Verifiable evidence documented in candidate's {location}."
            })

        # 2. Partially Matched Requirements (Related Tech or Adjacent Competency)
        still_unmatched = []
        for skill in unmatched_skills:
            skill_key = skill.lower()
            if skill_key in self.RELATED_TECH_MAP:
                related_tech, category, explanation = self.RELATED_TECH_MAP[skill_key]
                if related_tech in raw_lower:
                    evidence_items.append({
                        "id": f"ev_partial_{len(evidence_items) + 1}",
                        "requirement": skill.title(),
                        "category": category,
                        "status": "PARTIALLY MATCHED",
                        "resumeEvidence": f"Related competency '{related_tech.title()}' identified in resume.",
                        "location": "Adjacent Competency",
                        "explanation": explanation
                    })
                    continue
            still_unmatched.append(skill)

        # 3. Unmatched Requirements (NOT FOUND)
        # Note: Absence in written text does not imply candidate inability.
        for idx, skill in enumerate(still_unmatched[:5]):
            skill_clean = skill.title()
            evidence_items.append({
                "id": f"ev_notfound_{idx + 1}",
                "requirement": skill_clean,
                "category": "Job Description Mandate",
                "status": "NOT FOUND",
                "resumeEvidence": "No direct mention in current resume draft.",
                "location": "Not Documented",
                "explanation": (
                    f"'{skill_clean}' was not explicitly identified in the candidate resume text. "
                    "Note: This indicates absence in the written resume text, not necessarily lack of candidate ability."
                )
            })

        return evidence_items


evidence_map_service = EvidenceMapService()
