"use client";

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FileText, CheckCircle2, Mail, ShieldCheck, Download, Copy, Check, Search, ArrowUpDown, Filter, User, Sparkles, Target, AlertTriangle, HelpCircle, CornerDownRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { APIResponse, ActionItem } from "@/types";
import { ValidationPanel } from "./ValidationPanel";

interface ResultsPanelProps {
  results: APIResponse;
  title: string;
}

export function ResultsPanel({ results, title }: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("actions"); // Default to Action Items for immediate enterprise value
  const [actionSearch, setActionSearch] = useState("");
  const [sortField, setSortField] = useState<keyof ActionItem>("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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
    toast.success("Copied active tab content");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${title.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
    toast.success("Exported full JSON");
  };

  const handleDownloadMD = () => {
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(getActiveContent());
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${title.replace(/\s+/g, '_')}_${activeTab}.md`);
    dlAnchorElem.click();
    toast.success("Exported Markdown");
  };

  // Filter & Sort Action Items
  const filteredActionItems = useMemo(() => {
    let items = [...results.actions.action_items];

    if (actionSearch.trim()) {
      const q = actionSearch.toLowerCase();
      items = items.filter(
        (item) =>
          item.task.toLowerCase().includes(q) ||
          item.assignee.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      items = items.filter((item) => item.status.toUpperCase() === statusFilter);
    }

    items.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [results.actions.action_items, actionSearch, statusFilter, sortField, sortDirection]);

  const toggleSort = (field: keyof ActionItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold text-[11px] px-2 py-0.5">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold text-[11px] px-2 py-0.5">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 text-[11px] px-2 py-0.5">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground text-[11px]">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-medium px-2 py-0.5">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px] font-medium px-2 py-0.5">Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
    }
  };

  const getAvatarInitials = (name: string) => {
    if (!name || name === "Not Specified") return "NS";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full flex-1">
      <Card className="w-full flex flex-col shadow-lg border-border/40 bg-card/60 backdrop-blur-md overflow-hidden min-h-[700px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Header Controls Bar */}
          <CardHeader className="pb-0 border-b border-border/40 px-6 pt-5 flex-shrink-0">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>{title}</span>
                  <Badge variant="secondary" className="text-[10px] font-medium bg-primary/10 text-primary">
                    AI Output Ready
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Processed by Gemini 2.5 Flash Autonomous Engine
                </CardDescription>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs gap-1.5 border-border/60">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Tab"}</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border/60">
                      <Download className="h-3.5 w-3.5" />
                      <span>Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs">
                    <DropdownMenuItem onClick={handleDownloadMD}>
                      <FileText className="h-3.5 w-3.5 mr-2 text-primary" /> Markdown (.md)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadJSON}>
                      <FileText className="h-3.5 w-3.5 mr-2 text-primary" /> Full JSON Payload
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    results.validation.overall_status === 'PASS' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 
                    results.validation.overall_status === 'WARNING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 
                    'bg-rose-500/10 text-rose-600 border-rose-500/30'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 inline" />
                  {results.validation.overall_status} ({results.validation.confidence_score}%)
                </Badge>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-8 rounded-none border-b-0">
              <TabsTrigger 
                value="actions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-2.5 px-1 font-semibold text-xs tracking-tight transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Action Items Matrix ({results.actions.action_items.length})
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-2.5 px-1 font-semibold text-xs tracking-tight transition-all"
              >
                <FileText className="h-3.5 w-3.5 mr-2" /> Executive Summary
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-2.5 px-1 font-semibold text-xs tracking-tight transition-all"
              >
                <Mail className="h-3.5 w-3.5 mr-2" /> Email Communication
              </TabsTrigger>
              <TabsTrigger 
                value="validation" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-2.5 px-1 font-semibold text-xs tracking-tight transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Quality Audit & Safety
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="flex-1 p-6 overflow-y-auto" ref={contentRef}>
            {/* ACTION ITEMS TAB */}
            <TabsContent value="actions" className="mt-0 space-y-4">
              {/* Filter Controls Bar */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-muted/20 p-3 rounded-lg border border-border/40">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter task descriptions, assignees, or notes..."
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    className="h-8 pl-8 text-xs bg-background/60 border-border/40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Status:</span>
                  <div className="flex gap-1">
                    {["ALL", "PENDING", "COMPLETED"].map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={statusFilter === st ? "secondary" : "ghost"}
                        onClick={() => setStatusFilter(st)}
                        className={`h-7 text-[11px] px-2.5 ${statusFilter === st ? "font-semibold text-primary" : ""}`}
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enterprise Full-Width Data Table */}
              <div className="rounded-xl border border-border/40 overflow-x-auto bg-background/40 shadow-sm">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow className="hover:bg-transparent border-b border-border/40">
                      <TableHead className="w-[45%] font-bold text-foreground py-3">
                        <button onClick={() => toggleSort("task")} className="flex items-center gap-1 hover:text-primary transition-colors">
                          Task Description <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[15%] font-bold text-foreground py-3">
                        <button onClick={() => toggleSort("assignee")} className="flex items-center gap-1 hover:text-primary transition-colors">
                          Assignee <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[10%] font-bold text-foreground py-3">
                        <button onClick={() => toggleSort("priority")} className="flex items-center gap-1 hover:text-primary transition-colors">
                          Priority <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[10%] font-bold text-foreground py-3">
                        <button onClick={() => toggleSort("due_date")} className="flex items-center gap-1 hover:text-primary transition-colors">
                          Due Date <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[10%] font-bold text-foreground py-3">
                        <button onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-primary transition-colors">
                          Status <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[10%] font-bold text-foreground py-3">Dependencies</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActionItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No action items found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActionItems.map((item, i) => (
                        <TableRow key={i} className="hover:bg-muted/30 transition-colors border-b border-border/30 group">
                          {/* Expanded Task Description */}
                          <TableCell className="font-medium text-foreground py-3.5 leading-relaxed align-top">
                            <div className="flex items-start gap-2">
                              <CornerDownRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                              <div>
                                <span>{item.task}</span>
                                {item.notes && item.notes !== "Not Specified" && (
                                  <p className="text-[11px] text-muted-foreground mt-1 font-sans">
                                    <span className="font-semibold">Note:</span> {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Assignee with User Avatar */}
                          <TableCell className="align-top py-3.5">
                            {item.assignee === "Not Specified" ? (
                              <span className="text-muted-foreground italic text-[11px]">Not Specified</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 border border-primary/20">
                                  {getAvatarInitials(item.assignee)}
                                </div>
                                <span className="font-medium text-foreground truncate">{item.assignee}</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Priority */}
                          <TableCell className="align-top py-3.5">{getPriorityBadge(item.priority)}</TableCell>

                          {/* Due Date */}
                          <TableCell className="align-top py-3.5 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                            {item.due_date === "Not Specified" ? (
                              <span className="italic opacity-70">Not Specified</span>
                            ) : (
                              item.due_date
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="align-top py-3.5">{getStatusBadge(item.status)}</TableCell>

                          {/* Dependencies */}
                          <TableCell className="align-top py-3.5 text-muted-foreground text-[11px]">
                            {item.dependencies === "None" || item.dependencies === "Not Specified" ? (
                              <span className="opacity-50">—</span>
                            ) : (
                              <Badge variant="outline" className="text-[10px] border-border/60">{item.dependencies}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* EXECUTIVE SUMMARY RESPONSIVE GRID TAB */}
            <TabsContent value="summary" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Executive Summary Card (Full Width) */}
                <Card className="md:col-span-12 border-primary/20 bg-primary/5 shadow-sm">
                  <CardHeader className="py-3 px-4 border-b border-primary/10">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                      <Sparkles className="h-4 w-4" /> Executive Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm leading-relaxed text-foreground font-medium">
                    {results.summary.executive_summary}
                  </CardContent>
                </Card>

                {/* Objective Card */}
                <Card className="md:col-span-6 border-border/40 shadow-sm">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b">
                    <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-blue-500" /> Meeting Objective
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs leading-relaxed text-foreground">
                    {results.summary.meeting_objective}
                  </CardContent>
                </Card>

                {/* Participants Card */}
                <Card className="md:col-span-6 border-border/40 shadow-sm">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b">
                    <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-purple-500" /> Attendees Present
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {results.summary.participants.map((p, i) => (
                        <Badge key={i} variant="secondary" className="text-xs py-0.5 px-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Discussion Points (Full Width) */}
                <Card className="md:col-span-12 border-border/40 shadow-sm">
                  <CardHeader className="py-2.5 px-4 bg-muted/30 border-b">
                    <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      Key Discussion Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs prose prose-xs dark:prose-invert max-w-none space-y-2">
                    {results.summary.key_discussion_points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <div className="flex-1"><ReactMarkdown>{pt}</ReactMarkdown></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Decisions Made */}
                <Card className="md:col-span-6 border-emerald-500/20 shadow-sm">
                  <CardHeader className="py-2.5 px-4 bg-emerald-500/5 border-b border-emerald-500/10">
                    <CardTitle className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Decisions Made
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs space-y-2">
                    {results.summary.decisions_made.map((d, i) => (
                      <div key={i} className="p-2 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-emerald-950 dark:text-emerald-200">
                        {d}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card className="md:col-span-6 border-blue-500/20 shadow-sm">
                  <CardHeader className="py-2.5 px-4 bg-blue-500/5 border-b border-blue-500/10">
                    <CardTitle className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
                      <CornerDownRight className="h-3.5 w-3.5" /> Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs space-y-2">
                    {results.summary.next_steps.map((n, i) => (
                      <div key={i} className="p-2 rounded-md bg-blue-500/5 border border-blue-500/10 text-blue-950 dark:text-blue-200">
                        {n}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Identified Risks */}
                <Card className="md:col-span-6 border-rose-500/20 shadow-sm">
                  <CardHeader className="py-2.5 px-4 bg-rose-500/5 border-b border-rose-500/10">
                    <CardTitle className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Identified Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs space-y-2">
                    {results.summary.risks.map((r, i) => (
                      <div key={i} className="p-2 rounded-md bg-rose-500/5 border border-rose-500/10 text-rose-950 dark:text-rose-200">
                        {r}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Open Issues */}
                <Card className="md:col-span-6 border-amber-500/20 shadow-sm">
                  <CardHeader className="py-2.5 px-4 bg-amber-500/5 border-b border-amber-500/10">
                    <CardTitle className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5" /> Open Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-xs space-y-2">
                    {results.summary.open_issues.map((o, i) => (
                      <div key={i} className="p-2 rounded-md bg-amber-500/5 border border-amber-500/10 text-amber-950 dark:text-amber-200">
                        {o}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* EMAIL CLIENT TAB */}
            <TabsContent value="email" className="mt-0 h-full flex flex-col">
              <Card className="border-border/40 shadow-sm overflow-hidden flex-1 bg-card/40">
                <div className="bg-muted/40 p-4 border-b border-border/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground w-16">Subject:</span>
                    <span className="font-bold text-foreground text-sm">{results.email.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground w-16">Recipients:</span>
                    <span className="text-foreground">{results.extracted.attendees.join(", ")}</span>
                  </div>
                </div>
                <div className="p-6 font-sans text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {results.email.body}
                </div>
              </Card>
            </TabsContent>

            {/* VALIDATION MONITORING TAB */}
            <TabsContent value="validation" className="mt-0 h-full">
              <ValidationPanel validation={results.validation} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}
