"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { UploadCloud, Bot, Loader2, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useMeetingStore } from "@/store/useMeetingStore";
import { ProcessingStage } from "@/types";

interface ImportPanelProps {
  stage: ProcessingStage;
  onSubmit: (transcript: string) => void;
}

import { parseFileToText } from "@/lib/fileParser";

export function ImportPanel({ stage, onSubmit }: ImportPanelProps) {
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
        toast.success(`Successfully loaded ${file.name}`, { id: "parse" });
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
      if (draftTranscript.trim() && stage === "idle") {
        onSubmit(draftTranscript);
      }
    }
  };



  const handleClear = () => {
    setDraft("");
    toast.success("Draft cleared.");
  };

  return (
    <Card className="flex flex-col h-full shadow-sm border-border/50 relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            Input Transcript
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={open} disabled={stage !== "idle" && stage !== "complete" && stage !== "error"}>
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            {draftTranscript && (
              <Button variant="ghost" size="icon" onClick={handleClear} title="Clear draft">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Paste your raw meeting transcript, or upload a .txt, .md, .pdf, or .docx file here.
        </CardDescription>
      </CardHeader>
      
      <div {...getRootProps()} className="flex-1 flex flex-col px-6 relative">
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 z-10 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg flex items-center justify-center mx-6 mb-6">
            <div className="text-center">
              <FileText className="h-10 w-10 text-primary mx-auto mb-2 animate-bounce" />
              <p className="font-semibold text-primary">Drop file here</p>
            </div>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={draftTranscript}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="[00:00:00] Alice: Welcome everyone to the Q3 planning meeting...&#10;&#10;Pro tip: Press Ctrl+Enter to generate."
          className={`flex-1 min-h-[400px] lg:min-h-[500px] resize-none text-sm font-mono p-4 mb-4 ${isDragActive ? 'opacity-50' : ''}`}
          disabled={stage !== "idle" && stage !== "complete" && stage !== "error"}
        />
      </div>
      
      <CardFooter className="pt-4 pb-6 px-6 border-t bg-muted/10">
        <Button 
          onClick={() => onSubmit(draftTranscript)}
          className="w-full h-12 text-base" 
          disabled={!draftTranscript.trim() || (stage !== "idle" && stage !== "complete" && stage !== "error")}
        >
          {stage !== "idle" && stage !== "complete" && stage !== "error" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-5 w-5" />
              Generate Insights <span className="ml-2 text-xs opacity-70 hidden sm:inline">(Ctrl+Enter)</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
