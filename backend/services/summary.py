from utils.gemini import get_gemini_client
from models import SummaryResponse
from google.genai import types

def summarize_notes(normalized_text: str) -> SummaryResponse:
    client = get_gemini_client()
    prompt = f"""
    You are an AI assistant specialized in summarizing meeting notes.
    Provide a short executive summary (2-3 sentences) and a detailed summary of the meeting grouped by topics.
    
    Meeting Notes:
    {normalized_text}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SummaryResponse,
            temperature=0.3,
        ),
    )
    
    return SummaryResponse.model_validate_json(response.text)
