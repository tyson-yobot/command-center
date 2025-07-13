import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const FollowUpTrackerCard = () => {
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [overdue, setOverdue] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [contactRate, setContactRate] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tbl0Yazm68Tgdq8JP')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let totalRecords = 0;
        let completedCount = 0;
        let overdueCount = 0;
        let totalResponse = 0;
        let contactedCount = 0;

        records.forEach(record => {
          const status = record.fields['✅ Status'] || '';
          const rawResponse = record.fields['⏱️ Response Time (min)'] || '0';
          const responseTime = typeof rawResponse === 'string' ? parseFloat(rawResponse) : Number(rawResponse);
          const contactedFlag = record.fields['📞 Contacted'] === true;
          const overdueFlag = record.fields['❌ Overdue'] === true;

          totalRecords++;
          if (status === 'Completed') completedCount++;
          if (overdueFlag) overdueCount++;
          if (!isNaN(responseTime)) totalResponse += responseTime;
          if (contactedFlag) contactedCount++;
        });

        setTotal(totalRecords);
        setCompleted(completedCount);
        setOverdue(overdueCount);
        setAvgResponseTime(totalRecords > 0 ? Math.round(totalResponse / totalRecords) : 0);
        setContactRate(totalRecords > 0 ? Math.round((contactedCount / totalRecords) * 100) : 0);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📬 Follow-Up Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">📬 Total Follow-Ups</p>
          <p className="text-xl font-semibold text-[#00ffff]">{total}</p>
          <Progress value={total} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Completed</p>
          <p className="text-xl font-semibold text-[#00ffff]">{completed}</p>
          <Progress value={completed} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🚨 Overdue</p>
          <p className="text-xl font-semibold text-[#00ffff]">{overdue}</p>
          <Progress value={overdue} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱️ Avg Response Time</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgResponseTime} min</p>
          <Progress value={avgResponseTime} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📞 Contact Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{contactRate}%</p>
          <Progress value={contactRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpTrackerCard;
