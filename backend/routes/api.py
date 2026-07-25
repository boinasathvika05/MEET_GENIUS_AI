from fastapi import APIRouter, UploadFile, File, HTTPException
import PyPDF2
import docx
import io

from models import ProcessRequest, ProcessResponse
from services.normalize import normalize_notes
from services.extract import extract_entities
from services.summary import summarize_notes
from services.actions import extract_actions
from services.email import draft_email
from services.validate import validate_pipeline
import time

router = APIRouter()

@router.post("/parse-file")
async def parse_file(file: UploadFile = File(...)):
    text = ""
    try:
        content = await file.read()
        if file.filename.endswith(".pdf"):
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif file.filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"text": text}

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "meeting-notes-pipeline"}

@router.post("/process", response_model=ProcessResponse)
def process_meeting_notes(request: ProcessRequest):
    # Stage 1: Normalize
    normalized = normalize_notes(request.raw_notes)
    time.sleep(2)
    
    # Stage 2: Extract
    extracted = extract_entities(normalized.normalized_text)
    time.sleep(2)
    
    # Stage 3: Summary
    summary = summarize_notes(normalized.normalized_text)
    time.sleep(2)
    
    # Stage 4: Actions
    actions = extract_actions(normalized.normalized_text)
    time.sleep(2)
    
    # Stage 5: Email
    email = draft_email(normalized, extracted, summary, actions)
    time.sleep(2)
    
    # Stage 6: Validate
    validation = validate_pipeline(request.raw_notes, normalized, extracted, summary, actions)
    
    return ProcessResponse(
        normalized=normalized,
        extracted=extracted,
        summary=summary,
        actions=actions,
        email=email,
        validation=validation
    )
