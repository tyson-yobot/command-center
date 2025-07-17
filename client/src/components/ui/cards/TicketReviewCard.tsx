import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

// ✅ HARD-CODED Airtable Base ID + Table ID
// Base ID: appRt8V3tH4g5Z5if
// Table ID: tblqVuGHJCCvKHzMW (🧪 QA Call Review Log)

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblqVuGHJCCvKHzMW';
const AIRTABLE_API_KEY = 'Bearer AIRTABLE_API_KEY';

const TicketReviewCard = () => {
  const [metrics, setMetrics] = useState({
    avgScore: 0,
    totalReviews: 0,
    ticketsWithEscalation: 0,
    onTimeResponseRate: 0,
    ticketsWithNotes: 0,
  });

  useEffect(() => {
    axios({
      method: 'GET',
      url: AIRTABLE_API_URL,
      headers: {
        Authorization: AIRTABLE_API_KEY,
      },
    }).then((res: any) => {
      const records: any[] = res.data.records;

      let totalScore = 0;
      let reviewCount = 0;
      let escalated = 0;
      let onTime = 0;
      let notes = 0;

      for (const r of records) {
        const score = parseFloat(r.fields['⭐ QA Score'] || '0');
        const escalatedFlag = r.fields['🚨 Escalation'] === true;
        const onTimeFlag = r.fields['⏱️ On-Time Response'] === true;
        const notesText = r.fields['📝 Notes'];

        totalScore += score;
        reviewCount++;

        if (escalatedFlag) escalated++;
        if (onTimeFlag) onTime++;
        if (notesText && notesText.trim() !== '') notes++;
      }

      setMetrics({
        avgScore: reviewCount ? +(totalScore / reviewCount).toFixed(2) : 0,
        totalReviews: reviewCount,
        ticketsWithEscalation: escalated,
        onTimeResponseRate: reviewCount ? +(onTime / reviewCount * 100).toFixed(2) : 0,
        ticketsWithNotes: notes,
      });
    });
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] p-4 border-2 border-[#00FFFF] shadow-xl text-white">
      <CardContent>
        <h3 className="text-white text-xl font-bold mb-4">🧪 Ticket Review KPIs</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm">⭐ Avg QA Score: <span className="text-[#FF00FF] font-bold text-lg">{metrics.avgScore}</span></p>
            <Progress value={Math.min(metrics.avgScore * 20, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">📊 Total Tickets Reviewed: <span className="text-[#00FFAA] font-bold text-lg">{metrics.totalReviews}</span></p>
            <Progress value={Math.min(metrics.totalReviews, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🚨 Escalated Tickets: <span className="text-[#FF3366] font-bold text-lg">{metrics.ticketsWithEscalation}</span></p>
            <Progress value={Math.min(metrics.ticketsWithEscalation, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">⏱️ On-Time Response %: <span className="text-[#00FFFF] font-bold text-lg">{metrics.onTimeResponseRate}%</span></p>
            <Progress value={metrics.onTimeResponseRate} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">📝 Tickets with Notes: <span className="text-[#FFFF00] font-bold text-lg">{metrics.ticketsWithNotes}</span></p>
            <Progress value={Math.min(metrics.ticketsWithNotes, 100)} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketReviewCard;
