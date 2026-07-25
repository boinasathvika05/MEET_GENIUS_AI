"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Search, Star, Trash2, Edit2, Calendar, Clock, FileText, CheckCircle2, History } from "lucide-react";
import { toast } from "sonner";
import { useMeetingStore } from "@/store/useMeetingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResultsPanel } from "@/components/dashboard/ResultsPanel";

export default function HistoryPage() {
  const { meetings, deleteMeeting, toggleFavorite, renameMeeting } = useMeetingStore();
  
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewingMeetingId, setViewingMeetingId] = useState<string | null>(null);

  const filteredMeetings = useMemo(() => {
    let result = meetings.filter(m => 
      m.title.toLowerCase().includes(search.toLowerCase()) || 
      m.results?.extracted?.attendees?.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
      m.results?.extracted?.key_topics?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    if (sort === "newest") {
      result = result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === "oldest") {
      result = result.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sort === "favorites") {
      result = result.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    }

    return result;
  }, [meetings, search, sort]);

  const viewingMeeting = meetings.find(m => m.id === viewingMeetingId);

  const handleRename = (id: string, oldTitle: string) => {
    const newTitle = prompt("Enter new meeting title:", oldTitle);
    if (newTitle && newTitle.trim()) {
      renameMeeting(id, newTitle.trim());
      toast.success("Meeting renamed");
    }
  };

  if (viewingMeeting) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-4">
          <Button variant="outline" onClick={() => setViewingMeetingId(null)}>
            &larr; Back to History
          </Button>
        </div>
        <div className="flex-1 min-h-[600px]">
          <ResultsPanel results={viewingMeeting.results} title={viewingMeeting.title} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meeting History</h1>
          <p className="text-muted-foreground mt-1">View and manage your saved transcripts and AI insights.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search titles, attendees, topics..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredMeetings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-background/50">
          <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No meetings found</h3>
          <p className="text-muted-foreground">Adjust your search or process a new transcript.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg truncate cursor-pointer hover:text-primary transition-colors" onClick={() => setViewingMeetingId(meeting.id)}>
                    {meeting.title}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 -mt-1 -mr-2 shrink-0"
                    onClick={() => toggleFavorite(meeting.id)}
                  >
                    <Star className={`h-4 w-4 ${meeting.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(meeting.createdAt, 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.round((meeting.processingTimeMs || 0)/1000)}s</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{meeting.results.extracted.attendees.length > 0 ? meeting.results.extracted.attendees.join(", ") : "No attendees listed"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{meeting.results.actions.action_items.length} Action Items</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRename(meeting.id, meeting.title)} title="Rename">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                      if(confirm("Delete this meeting permanently?")) deleteMeeting(meeting.id);
                    }} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button size="sm" onClick={() => setViewingMeetingId(meeting.id)}>
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
