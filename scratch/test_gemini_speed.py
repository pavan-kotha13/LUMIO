import sys
import time
sys.path.insert(0, r"C:\Users\pavan\antigravity\Resume-Architect")
from backend.app.core.config import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)
t0 = time.time()
res = client.models.generate_content(
    model="gemini-3.8-flash",
    contents='Respond with {"status": "fast"} in JSON',
    config={"response_mime_type": "application/json"}
)
print("Time taken:", round(time.time() - t0, 2), "s")
print("Response:", res.text)
