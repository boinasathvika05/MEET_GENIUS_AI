"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, User, Download, Save, ShieldCheck, ShieldAlert, Sparkles, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMeetingStore } from "@/store/useMeetingStore";
import { toast } from "sonner";
import Link from "next/link";

interface HeaderProps {
  onSave?: () => void;
  onExport?: () => void;
  isComplete?: boolean;
  validationStatus?: string;
  confidenceScore?: number;
}

export function Header({ onSave, onExport, isComplete, validationStatus, confidenceScore }: HeaderProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { activities } = useMeetingStore();

  const getPageTitle = () => {
    if (pathname.includes("/history")) return { title: "Meeting History", subtitle: "Archive of processed transcripts & insights" };
    if (pathname.includes("/settings")) return { title: "Platform Settings", subtitle: "Configure model integrations & API keys" };
    if (pathname.includes("/workflow")) return { title: "Workflow Architecture", subtitle: "Autonomous 6-stage AI pipeline trace" };
    return { title: "AI Workspace", subtitle: "Autonomous meeting intelligence platform" };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-[1800px] mx-auto">
        {/* Left: Breadcrumbs & Titles */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 shrink-0">
            <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>MeetGenius</span>
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-foreground font-medium capitalize">{title}</span>
          </div>

          <div className="h-4 w-px bg-border/60 hidden sm:block shrink-0" />

          <div className="min-w-0 hidden md:block">
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-none truncate">{title}</h1>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Validation Badge Indicator (when output ready) */}
          {isComplete && validationStatus && (
            <Badge 
              variant="outline" 
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                validationStatus === 'PASS' ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400' :
                validationStatus === 'WARNING' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'border-destructive/30 bg-destructive/10 text-destructive'
              }`}
            >
              {validationStatus === 'PASS' ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              <span>AI Validation: {validationStatus} ({confidenceScore}%)</span>
            </Badge>
          )}

          {/* Quick Search */}
          <div className="relative w-40 md:w-56 hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-muted/30 border-muted focus:bg-background transition-all rounded-md"
            />
          </div>

          {/* Contextual Action Buttons */}
          {isComplete && (
            <div className="flex items-center gap-2">
              {onExport && (
                <Button size="sm" variant="outline" onClick={onExport} className="h-8 gap-1.5 text-xs font-medium border-border/60">
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              )}
              {onSave && (
                <Button size="sm" onClick={onSave} className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Meeting</span>
                </Button>
              )}
            </div>
          )}

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {activities.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between text-xs">
                <span>Activity Stream</span>
                <Badge variant="secondary" className="text-[10px]">{activities.length}</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto space-y-1 p-1">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="p-2 rounded-md hover:bg-muted text-xs space-y-1">
                      <p className="font-medium text-foreground">{act.action}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(act.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground p-3 text-center">No recent activities</p>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/60 bg-muted/40">
                <User className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-xs">
              <DropdownMenuLabel>
                <p className="font-bold text-foreground">Sathvika Boina</p>
                <p className="text-[10px] text-muted-foreground font-mono">Senior Product Architect</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("Gemini 2.5 Flash active")}>
                <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                <span>AI Engine: Gemini 2.5</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings & API</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
