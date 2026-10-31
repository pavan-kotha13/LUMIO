import sys
import os
sys.path.insert(0, r"C:\Users\pavan\antigravity\Resume-Architect")
from backend.app.core.config import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)
try:
    print("Listing models available with API key:")
    for model in client.models.list():
        if "gemini" in model.name.lower():
            print(f"- {model.name}")
except Exception as e:
    print("Error listing models:", e)
