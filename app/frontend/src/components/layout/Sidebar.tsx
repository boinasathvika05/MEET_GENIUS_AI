"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, History, Settings, Home, Star, PlayCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { meetings } = useMeetingStore();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "History", href: "/dashboard/history", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const recentFavorites = meetings.filter((m) => m.favorite).slice(0, 3);

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2 px-2">
        <Bot className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">MeetGenius</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "font-semibold" : ""}`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {recentFavorites.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="px-3 mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Favorites
          </h4>
          <div className="space-y-1">
            {recentFavorites.map((fav) => (
              <Link key={fav.id} href={`/dashboard/history?id=${fav.id}`} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-auto py-2 text-left">
                  <Star className="mr-3 h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                  <span className="truncate text-sm">{fav.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <PlayCircle className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">System Status</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Gemini AI API is connected and operating normally.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className="md:hidden flex items-center p-4 border-b bg-background sticky top-0 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-bold">MeetGenius</span>
        </div>
      </div>

      {/* Desktop Permanent Sidebar */}
      <div className="hidden md:flex flex-col w-[260px] border-r bg-muted/20 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
