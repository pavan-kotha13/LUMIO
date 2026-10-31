import re
from typing import Dict, Any, List


class JobDescriptionParserService:
    """
    Parses Job Descriptions, extracting role title, required competencies,
    experience levels, and key responsibilities.
    """

    ROLE_PATTERNS = [
        r'(?:title|role|position):\s*([a-zA-Z\s]{4,40})',
        r'we are looking for a(?:n)?\s+([a-zA-Z\s]{4,40})',
        r'hiring a(?:n)?\s+([a-zA-Z\s]{4,40})',
        r'^([a-zA-Z\s]{4,30}\s+(?:engineer|developer|architect|designer|manager|lead))'
    ]

    def parse_job_description(self, jd_text: str) -> Dict[str, Any]:
        """Parse clean requirements and role metadata from JD text."""
        cleaned = jd_text.strip()
        lines = [l.strip() for l in cleaned.splitlines() if l.strip()]

        detected_role = "Software Engineer"
        for pattern in self.ROLE_PATTERNS:
            match = re.search(pattern, cleaned, re.IGNORECASE | re.MULTILINE)
            if match:
                detected_role = match.group(1).strip().title()
                break

        if detected_role == "Software Engineer" and lines:
            first_line = lines[0]
            if len(first_line) < 50 and any(w in first_line.lower() for w in ["engineer", "developer", "architect", "lead"]):
                detected_role = first_line.title()

        # Extract requirements bullets
        requirement_bullets = []
        for line in lines:
            if line.startswith(("•", "-", "*")) and len(line) > 15:
                requirement_bullets.append(re.sub(r'^[\•\-\*\s]+', '', line).strip())

        return {
            "targetRole": detected_role,
            "rawText": cleaned,
            "charCount": len(cleaned),
            "wordCount": len(cleaned.split()),
            "extractedRequirements": requirement_bullets[:10]
        }


jd_parser_service = JobDescriptionParserService()
