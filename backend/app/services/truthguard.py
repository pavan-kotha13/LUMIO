import re
import json
from typing import Dict, Any, List


class TruthGuardService:
    """
    TruthGuard Engine:
    Validates AI suggestions to ensure zero fabrication or hallucination.
    Statuses: SUPPORTED | NEEDS_CONFIRMATION | UNSUPPORTED
    """

    SUPPORTED = "SUPPORTED"
    NEEDS_CONFIRMATION = "NEEDS_CONFIRMATION"
    UNSUPPORTED = "UNSUPPORTED"

    def validate_bullet_improvement(
        self,
        original_bullet: str,
        suggested_bullet: str,
        candidate_facts: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validates whether a suggested bullet point is fully grounded,
        requires user verification of metrics, or claims unsupported credentials.
        """
        candidate_str = json.dumps(candidate_facts).lower()
        orig_numbers = set(re.findall(r'\b\d+(?:\.\d+)?%?\b', original_bullet))
        sugg_numbers = set(re.findall(r'\b\d+(?:\.\d+)?%?\b', suggested_bullet))

        # Check for ungrounded numbers/metrics introduced by AI
        new_numbers = sugg_numbers - orig_numbers

        # Check for technologies introduced that are not in candidate skills/history
        tech_words = re.findall(r'\b[A-Z][a-zA-Z0-9\+\#\.]+\b', suggested_bullet)
        unsupported_tech = [t for t in tech_words if t.lower() not in candidate_str and len(t) > 2]

        if unsupported_tech:
            return {
                "status": self.UNSUPPORTED,
                "rationale": f"Mentions unverified technology '{unsupported_tech[0]}' not found in candidate facts.",
                "requires_approval": True,
                "can_auto_apply": False
            }

        if new_numbers:
            return {
                "status": self.NEEDS_CONFIRMATION,
                "rationale": (
                    f"Enhanced using XYZ formula with estimated metric ({list(new_numbers)[0]}). "
                    "Requires candidate confirmation before inserting into final document."
                ),
                "requires_approval": True,
                "can_auto_apply": False
            }

        return {
            "status": self.SUPPORTED,
            "rationale": "Verifiably grounded in candidate's original responsibilities and stated tech stack.",
            "requires_approval": True,
            "can_auto_apply": True
        }

    def sanitize_improvements(
        self,
        improvements: List[Dict[str, Any]],
        candidate_facts: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Run validation on all proposed improvements and tag TruthGuard metadata.
        """
        validated = []
        for imp in improvements:
            orig = imp.get("original", "")
            sugg = imp.get("suggested", "")
            val = self.validate_bullet_improvement(orig, sugg, candidate_facts)
            
            validated.append({
                "id": imp.get("id", f"imp_{len(validated) + 1}"),
                "section": imp.get("section", "experience"),
                "original": orig,
                "suggested": sugg,
                "truthguard_status": val["status"],
                "verification_rationale": val["rationale"],
                "approved": False,
                "can_auto_apply": val["can_auto_apply"]
            })
        return validated


truthguard_service = TruthGuardService()
