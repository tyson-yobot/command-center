import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const KPIAnalyticsCard = () => {
  const [leadVolume, setLeadVolume] = useState(0);
  const [qualified, setQualified] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [followUpRate, setFollowUpRate] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblEoo3iMYkN3sxlf')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let totalLeads = 0;
        let qualifiedCount = 0;
        let responded = 0;
        let totalResponse = 0;
        let followUps = 0;

        records.forEach(record => {
          const isQualified = record.fields['✅ Qualified'] === true;
          const isFollowedUp = record.fields['📍 Followed Up'] === true;
          const rawResponse = record.fields['⏱️ Response Time (min)'] || '0';
          const responseTime = typeof rawResponse === 'string' ? parseFloat(rawResponse) : Number(rawResponse);

          totalLeads++;
          if (isQualified) qualifiedCount++;
          if (isFollowedUp) followUps++;
          if (!isNaN(responseTime) && responseTime > 0) {
            responded++;
            totalResponse += responseTime;
          }
        });

        setLeadVolume(totalLeads);
        setQualified(qualifiedCount);
        setConversionRate(totalLeads > 0 ? Math.round((qualifiedCount / totalLeads) * 100) : 0);
        setAvgResponseTime(responded > 0 ? Math.round(totalResponse / responded) : 0);
        setFollowUpRate(totalLeads > 0 ? Math.round((followUps / totalLeads) * 100) : 0);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📊 KPI Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">📥 Lead Volume</p>
          <p className="text-xl font-semibold text-[#00ffff]">{leadVolume}</p>
          <Progress value={leadVolume} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Qualified Leads</p>
          <p className="text-xl font-semibold text-[#00ffff]">{qualified}</p>
          <Progress value={qualified} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📈 Conversion Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{conversionRate}%</p>
          <Progress value={conversionRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱️ Avg Response Time</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgResponseTime} min</p>
          <Progress value={avgResponseTime} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📍 Follow-Up Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{followUpRate}%</p>
          <Progress value={followUpRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default KPIAnalyticsCard;
