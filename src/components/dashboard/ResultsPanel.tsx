"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FileText, CheckCircle2, Mail, ShieldCheck, Download, Copy, Maximize, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { APIResponse } from "@/types";
import { ValidationPanel } from "./ValidationPanel";

interface ResultsPanelProps {
  results: APIResponse;
  title: string;
}

export function ResultsPanel({ results, title }: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const contentRef = useRef<HTMLDivElement>(null);

  const getActiveContent = () => {
    switch (activeTab) {
      case "summary":
        return `# Executive Summary\n${results.summary.executive_summary}\n\n# Detailed Summary\n${results.summary.detailed_summary}`;
      case "actions":
        return results.actions.action_items.map(a => `- [ ] ${a.task} (@${a.assignee || "Unassigned"} - ${a.deadline || "No deadline"})`).join('\n');
      case "email":
        return `Subject: ${results.email.subject}\n\n${results.email.body}`;
      case "validation":
        return `Validation Score: ${results.validation.score}%\nMissing Info: ${results.validation.missing_information.join(", ")}`;
      default:
        return "";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${title.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
    toast.success("Downloaded JSON");
  };

  const handleDownloadMD = () => {
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(getActiveContent());
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${title.replace(/\s+/g, '_')}_${activeTab}.md`);
    dlAnchorElem.click();
    toast.success("Downloaded Markdown");
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    toast.loading("Generating PDF...", { id: "pdf" });
    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      
      const canvas = await html2canvas(contentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
      toast.success("Downloaded PDF", { id: "pdf" });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to generate PDF", { id: "pdf" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card className="h-full flex flex-col shadow-md border-border/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <CardHeader className="pb-0 border-b px-0 pt-4">
            <div className="px-6 flex justify-between items-center mb-4 flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl truncate max-w-sm" title={title}>{title}</CardTitle>
                <CardDescription>Processed successfully by MeetGenius</CardDescription>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />} Copy Current Tab
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadMD}>
                      <FileText className="h-4 w-4 mr-2" /> Download Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadJSON}>
                      <FileText className="h-4 w-4 mr-2" /> Download JSON (Full)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPDF}>
                      <Download className="h-4 w-4 mr-2" /> Download PDF (View)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Validated ({results.validation.score}%)
                </Badge>
              </div>
            </div>
            <div className="px-6 mb-[-1px] overflow-x-auto">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6 rounded-none border-b-0 min-w-max">
                <TabsTrigger value="summary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-medium">
                  <FileText className="h-4 w-4 mr-2" /> Summary
                </TabsTrigger>
                <TabsTrigger value="actions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-medium">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Action Items
                </TabsTrigger>
                <TabsTrigger value="email" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-medium">
                  <Mail className="h-4 w-4 mr-2" /> Email Draft
                </TabsTrigger>
                <TabsTrigger value="validation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-medium">
                  <ShieldCheck className="h-4 w-4 mr-2" /> Validation
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-6 overflow-y-auto" ref={contentRef}>
            <TabsContent value="summary" className="mt-0 h-full">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
                <p className="mb-6">{results.summary.executive_summary}</p>
                <h3 className="font-semibold text-lg mb-2">Detailed Summary</h3>
                <ReactMarkdown>{results.summary.detailed_summary}</ReactMarkdown>
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0 h-full">
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[50%]">Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.actions.action_items.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No action items identified.</TableCell></TableRow>
                    ) : (
                      results.actions.action_items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{item.task}</TableCell>
                          <TableCell>
                            {!item.assignee || item.assignee === "Not Specified" ? (
                              <Badge variant="destructive" className="bg-red-500/10 text-red-500 shadow-none border-0">Needs Owner</Badge>
                            ) : (
                              <Badge variant="secondary">{item.assignee}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!item.deadline || item.deadline === "Not Specified" ? (
                              <span className="text-muted-foreground italic text-sm">Not set</span>
                            ) : (item.deadline)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="mt-0 h-full flex flex-col">
              <div className="bg-muted/30 p-6 rounded-lg font-sans whitespace-pre-wrap flex-1 border">
                <strong>Subject: </strong>{results.email.subject}
                <br /><br />
                {results.email.body}
              </div>
            </TabsContent>

            <TabsContent value="validation" className="mt-0 h-full">
              <ValidationPanel validation={results.validation} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}
