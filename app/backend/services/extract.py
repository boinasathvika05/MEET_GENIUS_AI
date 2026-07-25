from utils.gemini import get_gemini_client
from models import ExtractResponse
from google.genai import types

def extract_entities(normalized_text: str) -> ExtractResponse:
    client = get_gemini_client()
    prompt = f"""
    You are an AI assistant specialized in extracting metadata from meeting notes.
    Extract the date, time, attendees, and key topics from the following meeting notes.
    If an entity is not explicitly mentioned, leave it null or empty.

    Meeting Notes:
    {normalized_text}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractResponse,
            temperature=0.1,
        ),
    )
    
    return ExtractResponse.model_validate_json(response.text)
