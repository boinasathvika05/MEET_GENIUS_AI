"use client";

import { AlertCircle, CheckCircle2, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { ValidateResponse } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ValidationPanelProps {
  validation: ValidateResponse;
}

export function ValidationPanel({ validation }: ValidationPanelProps) {
  const isPass = (status: string) => status === "PASS";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "WARNING": return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case "FAIL": return <ShieldX className="h-5 w-5 text-destructive" />;
      default: return <ShieldCheck className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "WARNING": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "FAIL": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-4 p-5 rounded-xl border-2 ${validation.overall_status === 'PASS' ? 'border-green-500/20 bg-green-500/5' : validation.overall_status === 'WARNING' ? 'border-amber-500/20 bg-amber-500/5' : 'border-destructive/20 bg-destructive/5'}`}>
        <div className={`text-4xl font-black ${validation.overall_status === 'PASS' ? 'text-green-500' : validation.overall_status === 'WARNING' ? 'text-amber-500' : 'text-destructive'}`}>
          {validation.confidence_score}%
        </div>
        <div>
          <h4 className="font-semibold text-lg flex items-center gap-2">
            AI Validation Report {getStatusIcon(validation.overall_status)}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Automated quality assurance and hallucination checks.
          </p>
        </div>
        <div className="ml-auto">
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold border tracking-wider ${getStatusColor(validation.overall_status)}`}>
            {validation.overall_status}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card flex justify-between items-center shadow-sm">
          <div>
            <p className="font-medium">Hallucination Check</p>
            <p className="text-xs text-muted-foreground mt-0.5">Verifies no invented information.</p>
          </div>
          <Badge variant={isPass(validation.hallucination_check) ? "secondary" : "destructive"} className={isPass(validation.hallucination_check) ? "bg-green-500/10 text-green-600" : ""}>
            {validation.hallucination_check}
          </Badge>
        </div>

        <div className="p-4 rounded-lg border bg-card flex justify-between items-center shadow-sm">
          <div>
            <p className="font-medium">Fact Verification</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ensures facts match original transcript.</p>
          </div>
          <Badge variant={isPass(validation.fact_verification) ? "secondary" : "destructive"} className={isPass(validation.fact_verification) ? "bg-green-500/10 text-green-600" : ""}>
            {validation.fact_verification}
          </Badge>
        </div>

        <div className="p-4 rounded-lg border bg-card flex justify-between items-center shadow-sm">
          <div>
            <p className="font-medium">Action Items Verification</p>
            <p className="text-xs text-muted-foreground mt-0.5">Validates assignees and deadlines.</p>
          </div>
          <Badge variant={isPass(validation.action_item_verification) ? "secondary" : "destructive"} className={isPass(validation.action_item_verification) ? "bg-green-500/10 text-green-600" : ""}>
            {validation.action_item_verification}
          </Badge>
        </div>

        <div className="p-4 rounded-lg border bg-card flex justify-between items-center shadow-sm">
          <div>
            <p className="font-medium">Decision Verification</p>
            <p className="text-xs text-muted-foreground mt-0.5">Validates accurate decision tracking.</p>
          </div>
          <Badge variant={isPass(validation.decision_verification) ? "secondary" : "destructive"} className={isPass(validation.decision_verification) ? "bg-green-500/10 text-green-600" : ""}>
            {validation.decision_verification}
          </Badge>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Missing Information
        </h4>
        
        <div className="space-y-2">
          {validation.missing_information?.length > 0 && validation.missing_information[0] !== "Not Specified" ? (
            validation.missing_information.map((info: string, i: number) => (
              <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-md text-sm flex items-start gap-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span className="leading-relaxed">{info}</span>
              </div>
            ))
          ) : (
            <div className="p-4 bg-green-500/5 border border-green-500/20 text-green-700 dark:text-green-400 rounded-md text-sm flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              <span className="font-medium">No critical missing information detected.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
