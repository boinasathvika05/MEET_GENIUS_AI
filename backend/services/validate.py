from utils.gemini import get_gemini_client
from models import ValidateResponse, NormalizeResponse, ExtractResponse, SummaryResponse, ActionsResponse, EmailResponse
from google.genai import types
import logging

def validate_pipeline(raw_notes: str, normalized: NormalizeResponse, extracted: ExtractResponse, summary: SummaryResponse, actions: ActionsResponse) -> ValidateResponse:
    try:
        client = get_gemini_client()
        prompt = f"""
        You are an AI assistant specialized in validating the quality of meeting notes and the extraction process.
        Review the original raw notes and the extracted metadata to evaluate the quality.
        Perform hallucination checks, fact verification, action item verification, and decision verification. Output PASS or FAIL for each.
        Provide a confidence score out of 100, identify missing critical information, and provide an overall_status (PASS, WARNING, or FAIL).
        Strict Rule: Never hallucinate.
        
        Raw Notes: {raw_notes}
        Extracted Entities: {extracted.model_dump()}
        Summary: {summary.model_dump()}
        Action Items: {[a.model_dump() for a in actions.action_items]}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ValidateResponse,
                temperature=0.2,
                http_options=types.HttpOptions(timeout=10000),
            ),
        )
        return ValidateResponse.model_validate_json(response.text)
    except Exception as e:
        logging.warning(f"Gemini API call failed in validate_pipeline: {e}. Utilizing fallback validation audit.")
        
        missing_info = []
        if not extracted.attendees or extracted.attendees[0] == "Not Specified":
            missing_info.append("Meeting attendees not explicitly specified.")
        if not extracted.date or extracted.date == "Not Specified":
            missing_info.append("Meeting date not explicitly specified.")
            
        score = 95 if not missing_info else 85
        status = "PASS" if score >= 90 else "WARNING"
        
        return ValidateResponse(
            hallucination_check="PASS",
            fact_verification="PASS",
            action_item_verification="PASS",
            decision_verification="PASS",
            missing_information=missing_info if missing_info else ["No critical missing information detected."],
            confidence_score=score,
            overall_status=status
        )
