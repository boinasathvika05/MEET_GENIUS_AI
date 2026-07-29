"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

import { APIResponse, ProcessingStage } from "@/types";
import { useMeetingStore } from "@/store/useMeetingStore";

import { Header } from "@/components/layout/Header";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { ImportPanel } from "@/components/dashboard/ImportPanel";
import { WorkflowTrace } from "@/components/dashboard/WorkflowTrace";
import { ResultsPanel } from "@/components/dashboard/ResultsPanel";

export default function DashboardPage() {
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [results, setResults] = useState<APIResponse | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);

  const { saveMeeting, logActivity } = useMeetingStore();

  const generateAutoTitle = (transcript: string, apiResponse: APIResponse) => {
    const topics = apiResponse.extracted.key_topics;
    if (topics && topics.length > 0 && topics[0] !== "Not Specified") {
      return `${topics[0]} Sync`;
    }
    const dateStr = new Date().toLocaleDateString();
    return `Executive Meeting - ${dateStr}`;
  };

  const handleProcess = async (transcript: string) => {
    if (!transcript.trim()) return;

    setStage("summarizing");
    setResults(null);
    setStartTime(Date.now());

    // Cycle through stages visually
    const pipelineStages: ProcessingStage[] = ["summarizing", "extracting", "drafting", "emailing", "validating"];
    let currentStageIndex = 0;
    
    const cycleInterval = setInterval(() => {
      if (currentStageIndex < pipelineStages.length - 1) {
        currentStageIndex++;
        setStage(pipelineStages[currentStageIndex]);
      }
    }, 2500);

    try {
      let response: Response;
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        response = await fetch(`${backendUrl}/api/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw_notes: transcript }),
        });
      } catch (err) {
        response = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw_notes: transcript }),
        });
      }

      clearInterval(cycleInterval);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseData: APIResponse = await response.json();
      setResults(responseData);
      setStage("complete");
      setCurrentTitle(generateAutoTitle(transcript, responseData));
      
      // Auto-collapse input panel to maximize results viewport space!
      setIsInputCollapsed(true);

      toast.success("Meeting processed successfully!");
      logActivity("Processed new meeting transcript");
    } catch (error: any) {
      clearInterval(cycleInterval);
      setStage("error");
      toast.error(error.message || "Failed to process transcript");
      logActivity("Error processing meeting transcript");
    }
  };

  const handleSave = () => {
    if (!results || !startTime) return;
    const processingTimeMs = Date.now() - startTime;
    
    saveMeeting({
      title: currentTitle,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      processingTimeMs,
      rawTranscript: "",
      results: results
    });
    
    toast.success("Meeting saved to History!");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground">
      {/* Sticky Enterprise Top Header */}
      <Header
        onSave={handleSave}
        isComplete={stage === "complete"}
        validationStatus={results?.validation?.overall_status}
        confidenceScore={results?.validation?.confidence_score}
      />

      {/* Main Ultra-Wide Content Area */}
      <div className="flex-1 p-4 lg:p-6 max-w-[1750px] w-full mx-auto space-y-6">
        {/* Single Compact KPI Bar */}
        <StatsPanel />

        {/* Dynamic Full-Width Layout */}
        <div className="flex flex-col gap-6 w-full">
          {/* Transcript Source Input (Collapsible Bar or Full Input) */}
          <ImportPanel 
            stage={stage} 
            onSubmit={handleProcess} 
            isCollapsed={isInputCollapsed} 
            onToggleCollapse={() => setIsInputCollapsed(!isInputCollapsed)} 
          />

          {/* Results Workspace / Processing Trace */}
          <div className="w-full min-h-[600px] flex-1">
            {stage === "idle" && !results && (
              <div className="h-full flex flex-col items-center justify-center text-center p-16 border-2 border-dashed border-border/50 rounded-2xl bg-card/40 text-muted-foreground min-h-[450px]">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-4">
                  <Bot className="h-10 w-10 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-foreground">Awaiting Meeting Transcript</h3>
                <p className="max-w-md text-xs text-muted-foreground leading-relaxed">
                  Paste your raw transcript or upload a file above and click <span className="font-semibold text-primary">Generate Insights</span> to execute the autonomous 6-stage AI pipeline.
                </p>
              </div>
            )}

            {(stage !== "idle" && stage !== "complete" && stage !== "error") && (
              <WorkflowTrace stage={stage} startTime={startTime} />
            )}

            {stage === "error" && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-destructive/30 bg-destructive/5 rounded-2xl text-destructive min-h-[400px]">
                <h3 className="text-lg font-bold mb-1">Pipeline Execution Failed</h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">Verify that the Python FastAPI backend server is active on port 8000 and try again.</p>
                <Button variant="outline" size="sm" onClick={() => setStage("idle")}>Reset Workspace</Button>
              </div>
            )}

            {stage === "complete" && results && (
              <ResultsPanel results={results} title={currentTitle} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
