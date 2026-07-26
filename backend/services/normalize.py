from utils.gemini import get_gemini_client
from models import NormalizeResponse
from google.genai import types
import logging

def normalize_notes(raw_notes: str) -> NormalizeResponse:
    try:
        client = get_gemini_client()
        prompt = f"""
        You are an AI assistant specialized in structuring meeting notes.
        Given the following raw, unstructured meeting notes, your task is to clean them up.
        Fix any obvious typos, grammatical errors, and reformat the text into a clear, logical structure.
        Do not add any new information or remove any existing meaning.

        Raw Notes:
        {raw_notes}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=NormalizeResponse,
                temperature=0.2,
                http_options=types.HttpOptions(timeout=10000),
            ),
        )
        return NormalizeResponse.model_validate_json(response.text)
    except Exception as e:
        logging.warning(f"Gemini API call failed in normalize_notes: {e}. Utilizing fallback normalization.")
        cleaned = raw_notes.strip()
        lines = [line.strip() for line in cleaned.split('\n') if line.strip()]
        formatted_text = "\n".join(lines)
        return NormalizeResponse(normalized_text=formatted_text)
