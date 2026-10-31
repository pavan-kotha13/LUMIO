import sys
import time
sys.path.insert(0, r"C:\Users\pavan\antigravity\Resume-Architect")
from backend.app.core.config import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)

models_to_test = [
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest"
]

for m in models_to_test:
    t0 = time.time()
    try:
        res = client.models.generate_content(
            model=m,
            contents='Respond with {"status": "ok"} in JSON',
            config={"response_mime_type": "application/json"}
        )
        print(f"SUCCESS with {m} in {round(time.time() - t0, 2)}s: {res.text.strip()}")
        break
    except Exception as e:
        print(f"Failed {m} in {round(time.time() - t0, 2)}s: {e}")
