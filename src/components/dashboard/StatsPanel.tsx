"use client";

import { useMeetingStore } from "@/store/useMeetingStore";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, FileText, CheckCircle2, Clock, Users, AlertTriangle, Zap, Target } from "lucide-react";

export function StatsPanel() {
  const { meetings } = useMeetingStore();
  
  if (meetings.length === 0) return null;

  const currentMeeting = meetings[0];
  const results = currentMeeting.results;
  
  if (!results) return null;

  const processingTime = currentMeeting.processingTimeMs 
    ? (currentMeeting.processingTimeMs / 1000).toFixed(1)
    : "0.0";

  const participantsCount = results.summary.participants.length > 0 && results.summary.participants[0] !== "Not Specified" 
    ? results.summary.participants.length 
    : 0;

  const discussionPointsCount = results.summary.key_discussion_points.length > 0 && results.summary.key_discussion_points[0] !== "Not Specified" 
    ? results.summary.key_discussion_points.length 
    : 0;

  const decisionsCount = results.summary.decisions_made.length > 0 && results.summary.decisions_made[0] !== "Not Specified"
    ? results.summary.decisions_made.length
    : 0;
    
  const risksCount = results.summary.risks.length > 0 && results.summary.risks[0] !== "Not Specified"
    ? results.summary.risks.length
    : 0;
    
  const openIssuesCount = results.summary.open_issues.length > 0 && results.summary.open_issues[0] !== "Not Specified"
    ? results.summary.open_issues.length
    : 0;

  const actionsCount = results.actions.action_items.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Processing Time</p>
            <h4 className="text-xl font-bold">{processingTime}s</h4>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-full text-purple-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Participants</p>
            <h4 className="text-xl font-bold">{participantsCount}</h4>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full text-green-600">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Decisions</p>
            <h4 className="text-xl font-bold">{decisionsCount}</h4>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Action Items</p>
            <h4 className="text-xl font-bold">{actionsCount}</h4>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-full text-orange-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Discussion Points</p>
            <h4 className="text-xl font-bold">{discussionPointsCount}</h4>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-full text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Risks & Issues</p>
            <h4 className="text-xl font-bold">{risksCount + openIssuesCount}</h4>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm col-span-2">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-full text-slate-600">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Model</p>
              <h4 className="text-lg font-bold">Gemini 2.5 Flash</h4>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pipeline Stage</p>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-sm">Enterprise Processing</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
