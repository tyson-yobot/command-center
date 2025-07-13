// QuickActionsCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const QuickActionsCard = () => {
  const [scheduledActions, setScheduledActions] = useState(0);
  const [executedActions, setExecutedActions] = useState(0);
  const [failedActions, setFailedActions] = useState(0);
  const [avgExecTime, setAvgExecTime] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tblXPB3V1Ky3o3EiT').select({}).eachPage((records, fetchNextPage) => {
      let scheduled = 0;
      let executed = 0;
      let failed = 0;
      let execTimeTotal = 0;
      let timeCount = 0;

      records.forEach(record => {
        const status = record.fields['⚙️ Action Status'];
        const execTime = Number(record.fields['⏱️ Execution Time (s)'] || 0);

        if (status === '✅ Executed') executed++;
        if (status === '🕒 Scheduled') scheduled++;
        if (status === '❌ Failed') failed++;

        if (execTime > 0) {
          execTimeTotal += execTime;
          timeCount++;
        }
      });

      setScheduledActions(scheduled);
      setExecutedActions(executed);
      setFailedActions(failed);
      setAvgExecTime(timeCount > 0 ? execTimeTotal / timeCount : 0);
      setCompletionRate((executed / (executed + failed)) * 100 || 0);
      fetchNextPage();
    });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-black border-4 border-[#0d82da] rounded-2xl p-4 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">🚀 Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">🕒 Total Scheduled Actions</p>
          <p className="text-xl font-semibold text-[#66ccff]">{scheduledActions}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Successfully Executed Actions</p>
          <p className="text-xl font-semibold text-[#66ff66]">{executedActions}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Failed Executions</p>
          <p className="text-xl font-semibold text-[#ff6666]">{failedActions}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⚡ Avg Execution Time (s)</p>
          <p className="text-xl font-semibold text-[#cc99ff]">{avgExecTime.toFixed(2)}s</p>
          <Progress value={Math.min(avgExecTime, 60)} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📊 Action Completion Rate (%)</p>
          <p className="text-xl font-semibold text-[#ffff66]">{completionRate.toFixed(1)}%</p>
          <Progress value={completionRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;


// QuickBooksSyncCard.tsx
// (already included and confirmed as correct in previous update)


// PersonalityPackCard.tsx
// (already included and confirmed as correct in previous update)
