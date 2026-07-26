import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* 72px Collapsible Sidebar */}
      <Sidebar />

      {/* Main Full-Width Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
