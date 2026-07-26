from utils.gemini import get_gemini_client
from models import EmailResponse, NormalizeResponse, ExtractResponse, SummaryResponse, ActionsResponse
from google.genai import types
import logging

def draft_email(normalized: NormalizeResponse, extracted: ExtractResponse, summary: SummaryResponse, actions: ActionsResponse) -> EmailResponse:
    try:
        client = get_gemini_client()
        prompt = f"""
        You are an Executive Communications Specialist. Draft a highly professional, enterprise-grade follow-up email based on the meeting insights below.
        
        The email body must be beautifully structured with clear headings:
        - Professional Warm Greeting
        - Meeting Overview & Strategic Objective
        - Executive Summary & Key Discussions
        - Core Decisions Made
        - Action Items Table / List (including Assignee, Priority, Due Date)
        - Key Risks & Open Issues
        - Professional Closing & Next Steps

        Extracted Attendees: {extracted.attendees}
        Meeting Objective: {summary.meeting_objective}
        Executive Summary: {summary.executive_summary}
        Key Discussions: {summary.key_discussion_points}
        Decisions: {summary.decisions_made}
        Action Items: {[a.model_dump() for a in actions.action_items]}
        Risks: {summary.risks}

        Provide a professional subject line and complete email body.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EmailResponse,
                temperature=0.4,
                http_options=types.HttpOptions(timeout=10000),
            ),
        )
        return EmailResponse.model_validate_json(response.text)
    except Exception as e:
        logging.warning(f"Gemini API call failed in draft_email: {e}. Utilizing fallback email drafting.")
        
        attendees_str = ", ".join(extracted.attendees) if extracted.attendees and extracted.attendees[0] != "Not Specified" else "Team"
        
        action_bullets = []
        for a in actions.action_items:
            assignee = a.assignee if a.assignee != "Not Specified" else "Unassigned"
            due = f" (Due: {a.due_date})" if a.due_date != "Not Specified" else ""
            priority = f" [{a.priority} Priority]" if a.priority != "Not Specified" else ""
            action_bullets.append(f"  • {a.task} — Assigned to @{assignee}{due}{priority}")
            
        action_str = "\n".join(action_bullets) if action_bullets else "  • No immediate action items identified."

        decisions_str = "\n".join([f"  • {d}" for d in summary.decisions_made]) if summary.decisions_made else "  • Target release schedule aligned."
        risks_str = "\n".join([f"  • {r}" for r in summary.risks]) if summary.risks and summary.risks[0] != "Not Specified" else "  • No critical blockers identified."

        body = f"""Hi {attendees_str},

Thank you for participating in our recent project sync. Below is the comprehensive post-meeting summary, key decisions, and assigned action items for your review.

📌 OBJECTIVE
{summary.meeting_objective}

💡 EXECUTIVE SUMMARY
{summary.executive_summary}

✅ KEY DECISIONS MADE
{decisions_str}

🎯 ACTION ITEMS & DELIVERABLES
{action_str}

⚠️ RISKS & OPEN ISSUES
{risks_str}

Next Steps:
Please confirm receipt and verify your assigned deliverables. Feel free to reply directly to this thread if any adjustments or additions are required.

Best regards,

Sathvika Boina
AI Solutions Lead | MeetGenius Platform"""
        
        return EmailResponse(
            subject=f"Post-Meeting Summary & Action Deliverables | {extracted.date if extracted.date else 'Sync'}",
            body=body
        )
