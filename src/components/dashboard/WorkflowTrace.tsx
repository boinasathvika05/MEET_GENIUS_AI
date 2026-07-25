"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, FileText, Bot, ListChecks, Mail, ShieldCheck, Sparkles, Activity } from "lucide-react";
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
      // Keep final time
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [stage, startTime]);

  const stages = [
    { id: "idle", label: "Raw Transcript Input", icon: <FileText className="h-4 w-4" /> },
    { id: "summarizing", label: "Cleaning & Normalizing", icon: <Sparkles className="h-4 w-4" /> },
    { id: "extracting", label: "Information Extraction", icon: <Bot className="h-4 w-4" /> },
    { id: "drafting", label: "Summary & Action Items", icon: <ListChecks className="h-4 w-4" /> },
    { id: "emailing", label: "Follow-up Email", icon: <Mail className="h-4 w-4" /> },
    { id: "validating", label: "AI Validation", icon: <ShieldCheck className="h-4 w-4" /> },
    { id: "complete", label: "Processing Completed", icon: <CheckCircle2 className="h-4 w-4" /> }
  ];

  const getStageIndex = () => {
    switch (stage) {
      case "idle": return 0;
      case "summarizing": return 1;
      case "extracting": return 2;
      case "drafting": return 3;
      case "emailing": return 4;
      case "validating": return 5;
      case "complete": return 6;
      case "error": return -1;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex();

  return (
    <Card className="h-full border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Pipeline Visualization
            </CardTitle>
            <CardDescription>
              Enterprise AI Workflow Architecture
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-primary font-bold">
              {elapsed}s
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Processing</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 space-y-6">
        <AnimatePresence>
          {stages.map((s, i) => {
            const isActive = currentIndex === i;
            const isPast = currentIndex > i;
            
            return (
              <motion.div 
                key={s.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="relative">
                  {/* Connecting Line */}
                  {i < stages.length - 1 && (
                    <div className={`absolute top-8 bottom-[-24px] left-1/2 w-0.5 -translate-x-1/2 transition-colors duration-500 ${isPast ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                  
                  <div className={`relative z-10 mt-0.5 rounded-full p-2 border-2 transition-all duration-500 ${
                    isPast ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/30' :
                    isActive ? 'border-primary text-primary bg-primary/10 shadow-sm shadow-primary/20 scale-110' :
                    'border-muted text-muted-foreground bg-muted/50'
                  }`}>
                    {isPast ? <CheckCircle2 className="h-5 w-5" /> : (
                      isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : s.icon
                    )}
                  </div>
                </div>
                
                <div className="flex-1 space-y-2 pt-1.5 pb-2">
                  <h4 className={`font-semibold tracking-tight transition-colors duration-500 ${isActive ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </h4>
                  {isActive && stage !== 'complete' && stage !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2 mt-2"
                    >
                      <Skeleton className="h-2 w-full bg-primary/20" />
                      <Skeleton className="h-2 w-[80%] bg-primary/10" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
