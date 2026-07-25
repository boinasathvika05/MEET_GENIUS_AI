"use client";

import { useMeetingStore } from "@/store/useMeetingStore";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, FileText, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function StatsPanel() {
  const { meetings } = useMeetingStore();
  
  const totalMeetings = meetings.length;
  
  const avgProcessingTime = totalMeetings > 0 
    ? Math.round(meetings.reduce((acc, m) => acc + (m.processingTimeMs || 0), 0) / totalMeetings / 1000) 
    : 0;

  const totalActions = meetings.reduce((acc, m) => acc + (m.results?.actions?.action_items?.length || 0), 0);
  
  const lastProcessed = meetings.length > 0 
    ? formatDistanceToNow(meetings[0].createdAt, { addSuffix: true }) 
    : "Never";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Saved Meetings</p>
            <h4 className="text-2xl font-bold">{totalMeetings}</h4>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Action Items</p>
            <h4 className="text-2xl font-bold">{totalActions}</h4>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Avg Time (AI)</p>
            <h4 className="text-2xl font-bold">{avgProcessingTime}s</h4>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-full text-purple-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Last Processed</p>
            <h4 className="text-lg font-bold mt-1 truncate max-w-[120px]">{lastProcessed}</h4>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
