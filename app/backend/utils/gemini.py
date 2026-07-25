from google import genai
from config import settings
from fastapi import HTTPException

def get_gemini_client():
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing or invalid.")
    return genai.Client(api_key=settings.GEMINI_API_KEY)
