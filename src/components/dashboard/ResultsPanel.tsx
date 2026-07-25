"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FileText, CheckCircle2, Mail, ShieldCheck, Download, Copy, Check } from "lucide-react";
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
        return `# Executive Summary\n${results.summary.executive_summary}\n\n# Objective\n${results.summary.meeting_objective}`;
      case "actions":
        return results.actions.action_items.map(a => `- [ ] ${a.task} (@${a.assignee} - ${a.due_date}) [Priority: ${a.priority}]`).join('\n');
      case "email":
        return `Subject: ${results.email.subject}\n\n${results.email.body}`;
      case "validation":
        return `Confidence Score: ${results.validation.confidence_score}%\nOverall: ${results.validation.overall_status}`;
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

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return <Badge variant="destructive">{priority}</Badge>;
      case 'medium': return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">{priority}</Badge>;
      case 'low': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">{priority}</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <Badge className="bg-green-500 hover:bg-green-600 text-white">{status}</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card className="h-full flex flex-col shadow-md border-border/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-0 border-b px-0 pt-4 flex-shrink-0">
            <div className="px-6 flex justify-between items-center mb-4 flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl truncate max-w-sm" title={title}>{title}</CardTitle>
                <CardDescription>Processed successfully by MeetGenius AI</CardDescription>
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
                <Badge variant={results.validation.overall_status === 'PASS' ? 'secondary' : (results.validation.overall_status === 'WARNING' ? 'default' : 'destructive')} 
                       className={results.validation.overall_status === 'PASS' ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}>
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {results.validation.overall_status} ({results.validation.confidence_score}%)
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
                  <ShieldCheck className="h-4 w-4 mr-2" /> Validation Report
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-6 overflow-y-auto" ref={contentRef}>
            <TabsContent value="summary" className="mt-0 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="col-span-1 md:col-span-2 shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base flex items-center"><FileText className="h-4 w-4 mr-2 text-primary" /> Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm">{results.summary.executive_summary}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base text-muted-foreground">Meeting Objective</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm">{results.summary.meeting_objective}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base text-muted-foreground">Participants</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {results.summary.participants.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base text-muted-foreground">Key Discussion Points</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                    <ul className="space-y-1">
                      {results.summary.key_discussion_points.map((pt, i) => <li key={i}><ReactMarkdown>{pt}</ReactMarkdown></li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base text-green-600">Decisions Made</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {results.summary.decisions_made.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base text-blue-600">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {results.summary.next_steps.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base text-red-500">Risks</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {results.summary.risks.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="py-3 bg-muted/30 border-b">
                    <CardTitle className="text-base text-orange-500">Open Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {results.summary.open_issues.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0 h-full">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[25%]">Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dependencies</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.actions.action_items.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No action items identified.</TableCell></TableRow>
                    ) : (
                      results.actions.action_items.map((item, i) => (
                        <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-sm">{item.task}</TableCell>
                          <TableCell className="text-sm">
                            {item.assignee === "Not Specified" ? (
                              <span className="text-muted-foreground italic">Not Specified</span>
                            ) : (
                              <Badge variant="secondary" className="bg-primary/5">{item.assignee}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {item.due_date === "Not Specified" ? (
                              <span className="text-muted-foreground italic">Not Specified</span>
                            ) : (item.due_date)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate" title={item.dependencies}>{item.dependencies}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate" title={item.notes}>{item.notes}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="mt-0 h-full flex flex-col">
              <div className="bg-muted/30 p-8 rounded-lg font-sans whitespace-pre-wrap flex-1 border shadow-inner leading-relaxed">
                <div className="pb-4 mb-4 border-b">
                  <strong className="text-muted-foreground mr-2">Subject:</strong> 
                  <span className="font-medium">{results.email.subject}</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {results.email.body}
                </div>
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
