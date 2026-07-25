"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ValidateResponse } from "@/types";

interface ValidationPanelProps {
  validation: ValidateResponse;
}

export function ValidationPanel({ validation }: ValidationPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
        <div className={`text-4xl font-bold ${validation.score >= 80 ? 'text-green-500' : validation.score >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
          {validation.score}%
        </div>
        <div>
          <h4 className="font-semibold text-lg">Quality Score</h4>
          <p className="text-sm text-muted-foreground">
            Evaluated by the AI validation stage.
          </p>
        </div>
        <div className="ml-auto">
          {validation.score >= 80 ? (
            <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-semibold border border-green-500/20">PASS</div>
          ) : (
            <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-sm font-semibold border border-amber-500/20">REVIEW</div>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Missing Information & Suggestions
        </h4>
        
        <div className="space-y-3">
          {validation.missing_information?.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground font-semibold">Missing Info:</p>
              {validation.missing_information.map((info: string, i: number) => (
                <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{info}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-900 dark:text-green-200 rounded-md text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>No critical missing information detected.</span>
            </div>
          )}

          {validation.suggestions?.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground font-semibold mt-4">Suggestions:</p>
              {validation.suggestions.map((sugg: string, i: number) => (
                <div key={i} className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 rounded-md text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{sugg}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
