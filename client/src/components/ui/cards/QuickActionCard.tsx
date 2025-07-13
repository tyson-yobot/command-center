// QuickActionsCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const QuickActionsCard = () => {
  const [actionsTriggered, setActionsTriggered] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [avgExecutionTime, setAvgExecutionTime] = useState(0);
  const [scheduled, setScheduled] = useState(0);
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tblYNZXKp6qqnBFy6').select({}).eachPage((records, fetchNextPage) => {
      let total = 0;
      let success = 0;
      let failedCount = 0;
      let scheduledCount = 0;
      let totalTime = 0;

      records.forEach(record => {
        const status = record.fields['⚙️ Action Status'] || '';
        const execTime = Number(record.fields['⏱️ Execution Time (s)'] || 0);

        total++;
        if (status === '✅ Success') success++;
        else if (status === '❌ Failed') failedCount++;
        else if (status === '⏳ Scheduled') scheduledCount++;
        if (execTime > 0) totalTime += execTime;
      });

      setActionsTriggered(total);
      setSuccessRate(total > 0 ? (success / total) * 100 : 0);
      setFailed(failedCount);
      setScheduled(scheduledCount);
      setAvgExecutionTime(total > 0 ? totalTime / total : 0);
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
          <p className="text-sm text-[#c3c3c3]">⚙️ Total Triggered</p>
          <p className="text-xl font-semibold text-[#00ff99]">{actionsTriggered}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Success Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{successRate.toFixed(1)}%</p>
          <Progress value={successRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱️ Avg Exec Time</p>
          <p className="text-xl font-semibold text-[#ffff66]">{avgExecutionTime.toFixed(2)}s</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📆 Scheduled</p>
          <p className="text-xl font-semibold text-[#ff00ff]">{scheduled}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Failed</p>
          <p className="text-xl font-semibold text-[#ff6666]">{failed}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
