from utils.gemini import get_gemini_client
from models import EmailResponse, NormalizeResponse, ExtractResponse, SummaryResponse, ActionsResponse
from google.genai import types

def draft_email(normalized: NormalizeResponse, extracted: ExtractResponse, summary: SummaryResponse, actions: ActionsResponse) -> EmailResponse:
    client = get_gemini_client()
    prompt = f"""
    You are an AI assistant specialized in drafting professional follow-up emails based on meeting notes.
    Draft an email to the attendees with a subject line and the email body.
    Incorporate the executive summary, key topics, and action items.

    Extracted Attendees: {extracted.attendees}
    Executive Summary: {summary.executive_summary}
    Action Items: {[a.model_dump() for a in actions.action_items]}

    Draft the email content appropriately.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=EmailResponse,
            temperature=0.4,
        ),
    )
    
    return EmailResponse.model_validate_json(response.text)
