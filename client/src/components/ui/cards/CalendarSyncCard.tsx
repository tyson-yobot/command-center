import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const CalendarSyncCard = () => {
  const [eventsSynced, setEventsSynced] = useState(0);
  const [autoScheduledCalls, setAutoScheduledCalls] = useState(0);
  const [avgLeadToCalendarTime, setAvgLeadToCalendarTime] = useState(0);
  const [schedulingConflicts, setSchedulingConflicts] = useState(0);
  const [noShows, setNoShows] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblp8byTYUz3sEjWu')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let totalEvents = 0;
        let totalCalls = 0;
        let totalTime = 0;
        let totalLeads = 0;
        let conflicts = 0;
        let noShowsCount = 0;

        records.forEach(record => {
          const events = Number(record.fields['🔄 Events Synced']) || 0;
          const autoCalls = Number(record.fields['🤖 Auto-Scheduled Calls']) || 0;
          const leadTime = Number(record.fields['⏱ Avg Time From Lead → Calendar']) || 0;
          const conflict = Number(record.fields['🚨 Scheduling Conflicts']) || 0;
          const noShow = Number(record.fields['📬 No-Shows This Week']) || 0;

          totalEvents += events;
          totalCalls += autoCalls;
          totalTime += leadTime;
          if (leadTime > 0) totalLeads++;
          conflicts += conflict;
          noShowsCount += noShow;
        });

        setEventsSynced(totalEvents);
        setAutoScheduledCalls(totalCalls);
        setAvgLeadToCalendarTime(totalLeads > 0 ? Math.round(totalTime / totalLeads) : 0);
        setSchedulingConflicts(conflicts);
        setNoShows(noShowsCount);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📅 Calendar Sync Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">🔄 Events Synced</p>
          <p className="text-xl font-semibold text-[#00ffff]">{eventsSynced}</p>
          <Progress value={eventsSynced} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🤖 Auto-Scheduled Calls via Bot</p>
          <p className="text-xl font-semibold text-[#00ffff]">{autoScheduledCalls}</p>
          <Progress value={autoScheduledCalls} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱ Avg Time From Lead → Calendar</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgLeadToCalendarTime} min</p>
          <Progress value={avgLeadToCalendarTime} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🚨 Scheduling Conflicts Detected</p>
          <p className="text-xl font-semibold text-[#00ffff]">{schedulingConflicts}</p>
          <Progress value={schedulingConflicts} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📬 No-Shows This Week</p>
          <p className="text-xl font-semibold text-[#00ffff]">{noShows}</p>
          <Progress value={noShows} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSyncCard;
