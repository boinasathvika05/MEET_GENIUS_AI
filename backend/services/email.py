from utils.gemini import get_gemini_client
from models import EmailResponse, NormalizeResponse, ExtractResponse, SummaryResponse, ActionsResponse
from google.genai import types
import logging

def draft_email(normalized: NormalizeResponse, extracted: ExtractResponse, summary: SummaryResponse, actions: ActionsResponse) -> EmailResponse:
    try:
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
    except Exception as e:
        logging.warning(f"Gemini API call failed in draft_email: {e}. Utilizing fallback email drafting.")
        
        attendees_str = ", ".join(extracted.attendees) if extracted.attendees and extracted.attendees[0] != "Not Specified" else "Team"
        action_str = "\n".join([f"- {a.task} (Assignee: {a.assignee})" for a in actions.action_items]) if actions.action_items else "- No immediate action items."
        
        body = f"""Hi {attendees_str},

Thank you for your time during our recent sync. Below is a summary of key points and next steps:

Executive Summary:
{summary.executive_summary}

Action Items & Next Steps:
{action_str}

Please let me know if there are any edits or additions needed.

Best regards,
Meeting Automation System"""
        
        return EmailResponse(
            subject=f"Follow-up: Meeting Summary & Action Items",
            body=body
        )
