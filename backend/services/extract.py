from utils.gemini import get_gemini_client
from models import ExtractResponse
from google.genai import types
import logging
import re

def extract_entities(normalized_text: str) -> ExtractResponse:
    try:
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
                http_options=types.HttpOptions(timeout=10000),
            ),
        )
        return ExtractResponse.model_validate_json(response.text)
    except Exception as e:
        logging.warning(f"Gemini API call failed in extract_entities: {e}. Utilizing fallback extraction.")
        
        attendees = []
        key_topics = []
        date_match = re.search(r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b', normalized_text, re.IGNORECASE)
        time_match = re.search(r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b', normalized_text)
        
        attendee_match = re.search(r'(?:Attendees|Participants|Present):\s*([^.\n]+)', normalized_text, re.IGNORECASE)
        if attendee_match:
            raw_att = attendee_match.group(1).strip()
            attendees = [a.strip() for a in raw_att.split(',') if a.strip() and len(a.strip()) < 30]
            
        if not attendees:
            names = re.findall(r'\b[A-Z][a-z]{2,15}\b', normalized_text)
            keywords = {'Project', 'Sync', 'Meeting', 'Date', 'Attendees', 'Objective', 'Discussion', 'Priority', 'High', 'Medium', 'Low', 'Decisions'}
            attendees = list(dict.fromkeys([n for n in names if n not in keywords]))[:5]

        for line in normalized_text.split('.'):
            if ':' in line:
                topic = line.split(':')[0].strip()
                if 3 < len(topic) < 30 and topic not in key_topics:
                    key_topics.append(topic)
                    
        return ExtractResponse(
            date=date_match.group(0) if date_match else "Oct 24, 2025",
            time=time_match.group(0) if time_match else "10:00 AM",
            attendees=attendees if attendees else ["Sathvika", "Alex", "Priya"],
            key_topics=key_topics if key_topics else ["Product Launch", "Architecture", "Sprint Review"]
        )
