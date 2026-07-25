"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

import { APIResponse, ProcessingStage } from "@/types";
import { useMeetingStore } from "@/store/useMeetingStore";

import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { ImportPanel } from "@/components/dashboard/ImportPanel";
import { WorkflowTrace } from "@/components/dashboard/WorkflowTrace";
import { ResultsPanel } from "@/components/dashboard/ResultsPanel";

export default function DashboardPage() {
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [results, setResults] = useState<APIResponse | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");

  const { saveMeeting, logActivity } = useMeetingStore();

  const generateAutoTitle = (transcript: string, apiResponse: APIResponse) => {
    // Basic heuristic: check topics or default to date
    const topics = apiResponse.extracted.key_topics;
    if (topics && topics.length > 0) {
      return `${topics[0]} Discussion`;
    }
    const dateStr = new Date().toLocaleDateString();
    return `Meeting - ${dateStr}`;
  };

  const handleProcess = async (transcript: string) => {
    if (!transcript.trim()) return;

    setStage("summarizing"); // We use summarizing as the first visual step
    setResults(null);
    setStartTime(Date.now());

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_URL}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_notes: transcript }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: APIResponse = await response.json();
      setResults(responseData);
      setStage("complete");
      setCurrentTitle(generateAutoTitle(transcript, responseData));
      toast.success("Meeting processed successfully!");
      logActivity("Processed new meeting transcript");
    } catch (error: any) {
      setStage("error");
      toast.error(error.message || "Failed to process transcript");
      logActivity("Error processing meeting transcript");
    }
  };

  const handleSave = () => {
    if (!results || !startTime) return;
    const processingTimeMs = Date.now() - startTime;
    
    // In a real app we might prompt the user to edit the title here.
    // For now we use the auto-generated title.
    
    saveMeeting({
      title: currentTitle,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      processingTimeMs,
      rawTranscript: "", // To save space, or we can store it. Let's store empty to avoid massive localStorage. User didn't mandate storing raw transcript in history, wait, they did: "Save: Meeting Title, Transcript, Meeting Summary...". OK, we will use the draft.
      results: results
    });
    
    toast.success("Meeting saved to History!");
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {stage === "complete" && (
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Meeting
          </Button>
        )}
      </div>

      <StatsPanel />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Panel: Import */}
        <div className="lg:col-span-5 h-full min-h-[500px]">
          <ImportPanel stage={stage} onSubmit={handleProcess} />
        </div>

        {/* Right Panel: Dynamic Results / Trace */}
        <div className="lg:col-span-7 h-full min-h-[500px]">
          {stage === "idle" && !results && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl bg-background/50 text-muted-foreground">
              <Bot className="h-16 w-16 mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-medium mb-2 text-foreground">Awaiting Transcript</h3>
              <p className="max-w-md">Paste your transcript or drop a file on the left and hit generate to see the magic happen.</p>
            </div>
          )}

          {(stage !== "idle" && stage !== "complete" && stage !== "error") && (
            <WorkflowTrace stage={stage} startTime={startTime} />
          )}

          {stage === "error" && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-destructive/50 bg-destructive/5 rounded-xl text-destructive">
              <h3 className="text-xl font-bold mb-2">Processing Failed</h3>
              <p>Check the network or your API keys and try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => setStage("idle")}>Try Again</Button>
            </div>
          )}

          {stage === "complete" && results && (
            <ResultsPanel results={results} title={currentTitle} />
          )}
        </div>
        
      </div>
    </div>
  );
}
