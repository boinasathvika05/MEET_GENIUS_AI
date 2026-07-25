from pydantic import BaseModel, Field
from typing import List, Optional

class ProcessRequest(BaseModel):
    raw_notes: str = Field(..., description="The raw meeting notes to process.")

class NormalizeResponse(BaseModel):
    normalized_text: str = Field(..., description="Cleaned and logically structured meeting notes.")

class ExtractResponse(BaseModel):
    date: Optional[str] = Field(None, description="Date of the meeting.")
    time: Optional[str] = Field(None, description="Time of the meeting.")
    attendees: List[str] = Field(default_factory=list, description="List of attendees present.")
    key_topics: List[str] = Field(default_factory=list, description="List of key topics discussed.")

class SummaryResponse(BaseModel):
    executive_summary: str = Field(..., description="A short 2-3 sentence executive summary.")
    detailed_summary: str = Field(..., description="A detailed summary of the meeting grouped by topics.")

class ActionItem(BaseModel):
    task: str = Field(..., description="The action item or task.")
    assignee: Optional[str] = Field(None, description="The person assigned to the task.")
    deadline: Optional[str] = Field(None, description="The deadline for the task, if mentioned.")

class ActionsResponse(BaseModel):
    action_items: List[ActionItem] = Field(default_factory=list, description="List of action items.")

class EmailResponse(BaseModel):
    subject: str = Field(..., description="Subject line for the email.")
    body: str = Field(..., description="The body of the email ready to be sent to attendees.")

class ValidateResponse(BaseModel):
    score: int = Field(..., description="Quality score of the processed notes from 1 to 100.")
    missing_information: List[str] = Field(default_factory=list, description="Any critical information missing from the raw notes.")
    suggestions: List[str] = Field(default_factory=list, description="Suggestions to improve future meeting notes.")

class ProcessResponse(BaseModel):
    normalized: NormalizeResponse
    extracted: ExtractResponse
    summary: SummaryResponse
    actions: ActionsResponse
    email: EmailResponse
    validation: ValidateResponse
