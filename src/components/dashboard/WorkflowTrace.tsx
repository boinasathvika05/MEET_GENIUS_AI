"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, FileText, Bot, ListChecks, Mail, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessingStage } from "@/types";

interface WorkflowTraceProps {
  stage: ProcessingStage;
  startTime: number | null;
}

export function WorkflowTrace({ stage, startTime }: WorkflowTraceProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage !== "idle" && stage !== "complete" && stage !== "error" && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (stage === "complete" || stage === "error") {
      // Keep the final elapsed time
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [stage, startTime]);

  const stages = [
    { id: "summarizing", label: "Transcript Normalized", icon: <FileText className="h-4 w-4" /> },
    { id: "extracting", label: "Information Extracted", icon: <Bot className="h-4 w-4" /> },
    { id: "drafting", label: "Summary & Action Items Generated", icon: <ListChecks className="h-4 w-4" /> },
    { id: "emailing", label: "Follow-up Email Drafted", icon: <Mail className="h-4 w-4" /> },
    { id: "validating", label: "Validation Passed", icon: <ShieldCheck className="h-4 w-4" /> }
  ];

  // Map the single active stage to visual stages
  // The actual pipeline is 6 steps, but we map them to 5 visual steps for simplicity in UI.
  const getStageIndex = () => {
    switch (stage) {
      case "summarizing": return 0;
      case "extracting": return 1;
      case "drafting": return 2;
      case "emailing": return 3;
      case "validating": return 4;
      case "complete": return 5;
      default: return -1;
    }
  };

  const currentIndex = getStageIndex();

  return (
    <Card className="h-full border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              AI Workflow Trace
            </CardTitle>
            <CardDescription>
              Orchestrating specialized models sequentially.
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-primary font-bold">
              {elapsed}s
            </div>
            <div className="text-xs text-muted-foreground">elapsed time</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 space-y-8">
        {stages.map((s, i) => {
          const isActive = currentIndex === i;
          const isPast = currentIndex > i;
          
          return (
            <div key={s.id} className="flex items-start gap-4">
              <div className={`mt-0.5 rounded-full p-2 border-2 transition-colors duration-500 ${
                isPast ? 'bg-primary border-primary text-primary-foreground' :
                isActive ? 'border-primary text-primary animate-pulse' :
                'border-muted text-muted-foreground bg-muted/50'
              }`}>
                {isPast ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
              </div>
              <div className="flex-1 space-y-2">
                <h4 className={`font-semibold transition-colors duration-500 ${isActive ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </h4>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-[80%]" />
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
