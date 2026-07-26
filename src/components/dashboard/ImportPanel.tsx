"use client";

import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { UploadCloud, Bot, Loader2, FileText, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useMeetingStore } from "@/store/useMeetingStore";
import { ProcessingStage } from "@/types";
import { parseFileToText } from "@/lib/fileParser";

interface ImportPanelProps {
  stage: ProcessingStage;
  onSubmit: (transcript: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ImportPanel({ stage, onSubmit, isCollapsed = false, onToggleCollapse }: ImportPanelProps) {
  const { draftTranscript, setDraft } = useMeetingStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'md', 'pdf', 'docx'].includes(extension || '')) {
      toast.error("Invalid file type. Please upload .txt, .md, .pdf, or .docx");
      return;
    }

    toast.loading(`Extracting text from ${file.name}...`, { id: "parse" });
    try {
      const text = await parseFileToText(file);
      if (text) {
        setDraft(text);
        toast.success(`Loaded ${file.name}`, { id: "parse" });
      } else {
        toast.error("File appears to be empty.", { id: "parse" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to read file", { id: "parse" });
    }
  }, [setDraft]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      if (draftTranscript.trim() && (stage === "idle" || stage === "complete")) {
        onSubmit(draftTranscript);
      }
    }
  };

  const handleClear = () => {
    setDraft("");
    toast.success("Draft cleared.");
  };

  if (isCollapsed) {
    return (
      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center justify-between transition-all hover:border-primary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Meeting Transcript Source</h4>
            <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
              {draftTranscript ? `${draftTranscript.slice(0, 60)}...` : "No transcript loaded"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <Button size="sm" variant="outline" onClick={onToggleCollapse} className="gap-1.5 text-xs">
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Expand Input</span>
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-sm border-border/50 bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-primary" />
            Source Transcript
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={open} disabled={stage !== "idle" && stage !== "complete" && stage !== "error"} className="h-8 text-xs gap-1.5">
              <UploadCloud className="h-3.5 w-3.5" />
              Upload
            </Button>
            {draftTranscript && (
              <Button variant="ghost" size="icon" onClick={handleClear} title="Clear draft" className="h-8 w-8 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onToggleCollapse && (
              <Button variant="ghost" size="icon" onClick={onToggleCollapse} title="Collapse Panel" className="h-8 w-8 text-muted-foreground">
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          Paste your meeting transcript or drop a .txt, .md, .pdf, or .docx file.
        </CardDescription>
      </CardHeader>
      
      <CardContent {...getRootProps()} className="flex-1 flex flex-col px-5 relative pb-3">
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 z-10 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg flex items-center justify-center m-5">
            <div className="text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2 animate-bounce" />
              <p className="font-semibold text-xs text-primary">Drop file to load</p>
            </div>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={draftTranscript}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="[00:00:00] Alice: Welcome everyone to our sprint planning sync...&#10;&#10;Pro tip: Press Ctrl+Enter to generate."
          className={`w-full min-h-[220px] max-h-[350px] resize-y text-xs font-mono p-3 border-border/50 bg-background/50 rounded-lg ${isDragActive ? 'opacity-50' : ''}`}
          disabled={stage !== "idle" && stage !== "complete" && stage !== "error"}
        />
      </CardContent>
      
      <CardFooter className="py-3 px-5 border-t border-border/40 bg-muted/20 flex justify-between items-center">
        <span className="text-[11px] text-muted-foreground hidden sm:inline">Ctrl+Enter to process</span>
        <Button 
          onClick={() => onSubmit(draftTranscript)}
          size="sm"
          className="w-full sm:w-auto h-9 text-xs font-semibold px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
          disabled={!draftTranscript.trim() || (stage !== "idle" && stage !== "complete" && stage !== "error")}
        >
          {stage !== "idle" && stage !== "complete" && stage !== "error" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Pipeline...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
