"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, History, Settings, Home, Star, PlayCircle, Menu, PanelLeftClose, PanelLeft, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useMeetingStore } from "@/store/useMeetingStore";

export function Sidebar() {
  const pathname = usePathname();
  const { meetings } = useMeetingStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Workflow", href: "/workflow", icon: Workflow },
    { name: "History", href: "/dashboard/history", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const recentFavorites = meetings.filter((m) => m.favorite).slice(0, 3);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Drawer Navigation */}
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-full flex-col gap-6 p-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">MeetGenius</span>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start ${isActive ? "font-semibold text-primary" : ""}`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm">MeetGenius</span>
          </div>
        </div>
      </div>

      {/* Desktop 72px -> 220px Collapsible Sidebar */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`hidden md:flex flex-col border-r border-border/40 bg-background/95 backdrop-blur-md h-screen sticky top-0 z-50 transition-all duration-300 ease-in-out shrink-0 ${
          isExpanded ? "w-[220px] shadow-xl" : "w-[72px]"
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/40 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 transition-transform hover:scale-105">
              <Bot className="h-5 w-5" />
            </div>
            {isExpanded && (
              <span className="font-bold text-base tracking-tight text-foreground whitespace-nowrap animate-in fade-in duration-200">
                MeetGenius
              </span>
            )}
          </Link>

          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start h-10 px-3 transition-colors ${
                        isActive ? "bg-primary/15 text-primary font-semibold border-l-2 border-primary" : "text-muted-foreground hover:text-foreground"
                      } ${!isExpanded ? "justify-center px-0" : ""}`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${isExpanded ? "mr-3" : ""}`} />
                      {isExpanded && (
                        <span className="truncate text-sm whitespace-nowrap animate-in fade-in duration-200">
                          {item.name}
                        </span>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right" className="font-medium text-xs">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {/* Favorite Meetings Section (When Expanded) */}
          {isExpanded && recentFavorites.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border/40 animate-in fade-in duration-200">
              <h4 className="px-3 mb-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                Favorites
              </h4>
              <div className="space-y-1">
                {recentFavorites.map((fav) => (
                  <Link key={fav.id} href={`/dashboard/history?id=${fav.id}`}>
                    <Button variant="ghost" className="w-full justify-start h-8 px-3 text-left">
                      <Star className="mr-2 h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span className="truncate text-xs text-muted-foreground hover:text-foreground">{fav.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer System Status */}
        <div className="p-3 border-t border-border/40 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`rounded-xl bg-primary/5 p-2.5 border border-primary/10 flex items-center ${isExpanded ? "gap-3" : "justify-center"}`}>
                <PlayCircle className="h-4 w-4 text-green-500 shrink-0 animate-pulse" />
                {isExpanded && (
                  <div className="min-w-0 animate-in fade-in duration-200">
                    <p className="text-xs font-semibold text-foreground leading-none">Engine Active</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-1">Gemini 2.5 Operational</p>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right" className="text-xs">
                AI Engine: Gemini 2.5 Operational
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
