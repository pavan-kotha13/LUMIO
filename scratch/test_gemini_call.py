import sys
sys.path.insert(0, r"C:\Users\pavan\antigravity\Resume-Architect")

from backend.app.services.gemini_service import gemini_central_service

try:
    print(f"Testing Gemini model: {gemini_central_service.model_name}")
    res = gemini_central_service._call_gemini_json('Return a JSON object: {"status": "ok", "provider": "gemini"}')
    print("Gemini response:", res)
except Exception as e:
    print("Gemini call exception:", e)
