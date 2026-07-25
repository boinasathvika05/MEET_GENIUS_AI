export interface NormalizeResponse {
  normalized_text: string;
}

export interface ExtractResponse {
  date?: string;
  time?: string;
  attendees: string[];
  key_topics: string[];
}

export interface SummaryResponse {
  executive_summary: string;
  meeting_objective: string;
  participants: string[];
  key_discussion_points: string[];
  decisions_made: string[];
  risks: string[];
  open_issues: string[];
  next_steps: string[];
}

export interface ActionItem {
  task: string;
  assignee: string;
  priority: string;
  due_date: string;
  status: string;
  dependencies: string;
  notes: string;
}

export interface ActionsResponse {
  action_items: ActionItem[];
}

export interface EmailResponse {
  subject: string;
  body: string;
}

export interface ValidateResponse {
  hallucination_check: string;
  fact_verification: string;
  action_item_verification: string;
  decision_verification: string;
  missing_information: string[];
  confidence_score: number;
  overall_status: string;
}

export interface APIResponse {
  normalized: NormalizeResponse;
  extracted: ExtractResponse;
  summary: SummaryResponse;
  actions: ActionsResponse;
  email: EmailResponse;
  validation: ValidateResponse;
}

export type ProcessingStage = "idle" | "summarizing" | "extracting" | "drafting" | "emailing" | "validating" | "complete" | "error";
