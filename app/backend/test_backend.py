from config import settings
from utils.gemini import get_gemini_client
from services.normalize import normalize_notes
from services.extract import extract_entities
from services.summary import summarize_notes
from services.actions import extract_actions
from services.email import draft_email
from services.validate import validate_pipeline

raw_notes = "Alice: Let's do X by tomorrow."
try:
    print("Normalizing...")
    norm = normalize_notes(raw_notes)
    print("Extracting...")
    ext = extract_entities(norm.normalized_text)
    print("Summarizing...")
    summ = summarize_notes(norm.normalized_text)
    print("Actions...")
    act = extract_actions(norm.normalized_text)
    print("Email...")
    em = draft_email(norm, ext, summ, act)
    print("Validate...")
    val = validate_pipeline(raw_notes, norm, ext, summ, act)
    print("SUCCESS!")
except Exception as e:
    import traceback
    traceback.print_exc()
