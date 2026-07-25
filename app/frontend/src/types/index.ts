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
  detailed_summary: string;
}

export interface ActionItem {
  task: string;
  assignee?: string;
  deadline?: string;
}

export interface ActionsResponse {
  action_items: ActionItem[];
}

export interface EmailResponse {
  subject: string;
  body: string;
}

export interface ValidateResponse {
  score: number;
  missing_information: string[];
  suggestions: string[];
}

export interface APIResponse {
  normalized: NormalizeResponse;
  extracted: ExtractResponse;
  summary: SummaryResponse;
  actions: ActionsResponse;
  email: EmailResponse;
  validation: ValidateResponse;
}

export type ProcessingStage = "idle" | "summarizing" | "extracting" | "drafting" | "validating" | "complete" | "error";
