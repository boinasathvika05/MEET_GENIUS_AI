from utils.gemini import get_gemini_client
from models import ValidateResponse, NormalizeResponse, ExtractResponse, SummaryResponse, ActionsResponse, EmailResponse
from google.genai import types

def validate_pipeline(raw_notes: str, normalized: NormalizeResponse, extracted: ExtractResponse, summary: SummaryResponse, actions: ActionsResponse) -> ValidateResponse:
    client = get_gemini_client()
    prompt = f"""
    You are an AI assistant specialized in validating the quality of meeting notes and the extraction process.
    Review the original raw notes and the extracted metadata to evaluate the quality.
    Provide a score out of 100 representing how comprehensive and clear the notes are.
    Identify any critical information that seems to be missing.
    Provide suggestions on how to improve the note-taking for future meetings.

    Raw Notes: {raw_notes}
    Extracted Entities: {extracted.model_dump()}
    Action Items: {[a.model_dump() for a in actions.action_items]}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ValidateResponse,
            temperature=0.2,
        ),
    )
    
    return ValidateResponse.model_validate_json(response.text)
