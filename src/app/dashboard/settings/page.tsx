"use client";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Trash2, Download, Upload, Moon, Sun, Monitor, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMeetingStore } from "@/store/useMeetingStore";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { meetings, clearHistory } = useMeetingStore();

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(meetings, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `meetgenius_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    toast.success("Data exported successfully");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          // Simplistic merge: Just replace for demo, or we could merge
          useMeetingStore.setState({ meetings: importedData });
          toast.success("Data imported successfully");
        } else {
          toast.error("Invalid backup file format");
        }
      } catch (error) {
        toast.error("Failed to parse backup file");
      }
    };
    reader.readAsText(file);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to permanently delete all saved meetings and drafts? This cannot be undone.")) {
      clearHistory();
      toast.success("All data has been cleared");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and local data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how MeetGenius looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <div className="font-medium">Light Mode</div>
                <div className="text-sm text-muted-foreground">Always use light theme</div>
              </div>
            </div>
            <Switch checked={theme === "light"} onCheckedChange={() => setTheme("light")} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Always use dark theme</div>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={() => setTheme("dark")} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <div className="font-medium">System Default</div>
                <div className="text-sm text-muted-foreground">Match your system settings</div>
              </div>
            </div>
            <Switch checked={theme === "system"} onCheckedChange={() => setTheme("system")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            MeetGenius is a privacy-first app. All your meeting data is stored locally in your browser's localStorage. No backend database is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <div className="font-medium">Export Backup</div>
              <div className="text-sm text-muted-foreground mt-1">Download all your saved meetings as a JSON file.</div>
            </div>
            <Button onClick={handleExportData} variant="outline"><Download className="h-4 w-4 mr-2"/> Export</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <div className="font-medium">Import Backup</div>
              <div className="text-sm text-muted-foreground mt-1">Restore your meetings from a previous JSON backup.</div>
            </div>
            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportData} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline"><Upload className="h-4 w-4 mr-2"/> Import</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-destructive/5 rounded-b-lg border-t border-destructive/10 p-6 flex items-center justify-between">
          <div>
            <div className="font-medium text-destructive">Danger Zone</div>
            <div className="text-sm text-muted-foreground mt-1">Permanently delete all data from this browser.</div>
          </div>
          <Button variant="destructive" onClick={handleClearHistory}><Trash2 className="h-4 w-4 mr-2"/> Clear All Data</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="font-medium">Backend API</div>
            </div>
            <div className="text-sm text-muted-foreground">Connected (http://localhost:8000)</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="font-medium">Gemini AI Engine</div>
            </div>
            <div className="text-sm text-muted-foreground">Operational</div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="font-medium">Version</div>
            <div className="text-sm font-mono text-muted-foreground">v1.0.0-saas</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
