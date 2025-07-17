// Lead Qualifier – Final Full Automation Build

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

const postToSlack = async (message: string): Promise<void> => {
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❗ Slack webhook failed:', error);
  }
};

const LeadQualifierCard = () => {
  const [leads, setLeads] = useState(0);
  const [qualified, setQualified] = useState(0);
  const [disqualified, setDisqualified] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: 'keyyobotsecureapi2025' }).base('appRt8V3tH4g5Z5if');

    base('tbl26BpRKPehZfEsl')
      .select({})
      .eachPage(
        async (records, fetchNextPage) => {
          let totalLeads = 0;
          let qualifiedCount = 0;
          let disqualifiedCount = 0;
          let scoreTotal = 0;
          let engagedCount = 0;

          records.forEach(record => {
            const status = record.fields['✅ Qualification Status'] || '';
            const scoreRaw = record.fields['📊 Qualification Score'] || '0';
            const score = typeof scoreRaw === 'string' ? parseFloat(scoreRaw) : Number(scoreRaw);
            const engaged = record.fields['📞 Engaged'] === true;

            totalLeads++;
            if (status === 'Qualified') qualifiedCount++;
            if (status === 'Disqualified') disqualifiedCount++;
            if (!isNaN(score)) scoreTotal += score;
            if (engaged) engagedCount++;
          });

          setLeads(totalLeads);
          setQualified(qualifiedCount);
          setDisqualified(disqualifiedCount);
          setAvgScore(totalLeads > 0 ? Math.round(scoreTotal / totalLeads) : 0);
          setEngagementRate(totalLeads > 0 ? Math.round((engagedCount / totalLeads) * 100) : 0);

          await postToSlack(`📊 Lead data pulled: ${qualifiedCount} qualified, ${disqualifiedCount} disqualified, ${avgScore} avg score, ${engagementRate}% engagement.`);

          fetchNextPage();
        },
        (err) => {
          if (err) {
            console.error('Lead qualification error:', err);
            postToSlack(`❗ Failed to load lead qualification data: ${err.message}`);
          }
        }
      );
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">🧠 Lead Qualifier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">📥 Total Leads</p>
          <p className="text-xl font-semibold text-[#00ffff]">{leads}</p>
          <Progress value={leads} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Qualified</p>
          <p className="text-xl font-semibold text-[#00ffff]">{qualified}</p>
          <Progress value={qualified} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Disqualified</p>
          <p className="text-xl font-semibold text-[#00ffff]">{disqualified}</p>
          <Progress value={disqualified} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📊 Avg Qualification Score</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgScore}</p>
          <Progress value={avgScore} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📞 Engagement Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{engagementRate}%</p>
          <Progress value={engagementRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadQualifierCard;
