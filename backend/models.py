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
    meeting_objective: str = Field(default="Not Specified", description="The main objective or goal of the meeting.")
    participants: List[str] = Field(default_factory=list, description="List of participants. If none, return ['Not Specified'].")
    key_discussion_points: List[str] = Field(default_factory=list, description="List of key discussion points.")
    decisions_made: List[str] = Field(default_factory=list, description="List of decisions made. If none, return ['Not Specified'].")
    risks: List[str] = Field(default_factory=list, description="List of identified risks. If none, return ['Not Specified'].")
    open_issues: List[str] = Field(default_factory=list, description="List of open issues. If none, return ['Not Specified'].")
    next_steps: List[str] = Field(default_factory=list, description="List of immediate next steps. If none, return ['Not Specified'].")

class ActionItem(BaseModel):
    assignee: str = Field(default="Not Specified", description="The person assigned to the task.")
    task: str = Field(..., description="The action item or task.")
    priority: str = Field(default="Not Specified", description="Priority level (High, Medium, Low, or Not Specified).")
    due_date: str = Field(default="Not Specified", description="The deadline or due date.")
    status: str = Field(default="Pending", description="Status of the task (Pending, Completed).")
    dependencies: str = Field(default="None", description="Dependencies for this task.")
    notes: str = Field(default="Not Specified", description="Any additional notes.")

class ActionsResponse(BaseModel):
    action_items: List[ActionItem] = Field(default_factory=list, description="List of action items.")

class EmailResponse(BaseModel):
    subject: str = Field(..., description="Subject line for the email.")
    body: str = Field(..., description="The body of the email ready to be sent to attendees.")

class ValidateResponse(BaseModel):
    hallucination_check: str = Field(..., description="PASS or FAIL. Checks if the AI hallucinated information.")
    fact_verification: str = Field(..., description="PASS or FAIL. Verifies factual accuracy based on notes.")
    action_item_verification: str = Field(..., description="PASS or FAIL. Verifies action items match notes.")
    decision_verification: str = Field(..., description="PASS or FAIL. Verifies decisions match notes.")
    missing_information: List[str] = Field(default_factory=list, description="List of missing critical information.")
    confidence_score: int = Field(..., description="Confidence score from 1 to 100.")
    overall_status: str = Field(..., description="PASS, WARNING, or FAIL.")

class ProcessResponse(BaseModel):
    normalized: NormalizeResponse
    extracted: ExtractResponse
    summary: SummaryResponse
    actions: ActionsResponse
    email: EmailResponse
    validation: ValidateResponse
