from utils.gemini import get_gemini_client
from models import ActionsResponse
from google.genai import types

def extract_actions(normalized_text: str) -> ActionsResponse:
    client = get_gemini_client()
    prompt = f"""
    You are an AI assistant specialized in identifying action items from meeting notes.
    Extract all action items or tasks mentioned in the notes.
    Identify the task description, assignee, priority, due date, status, dependencies, and any additional notes.
    Strict Rule: Never hallucinate or invent deadlines, people, or priorities. If information does not exist for a field, display 'Not Specified'.

    Meeting Notes:
    {normalized_text}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ActionsResponse,
            temperature=0.1,
        ),
    )
    
    return ActionsResponse.model_validate_json(response.text)
