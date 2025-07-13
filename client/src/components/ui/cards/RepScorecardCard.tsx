import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

// ✅ HARD-CODED Airtable Base ID + Table ID
// Base ID: appe0OSJtB1In1kn5
// Table ID: tblh3NQUtD22M7tDM (🧑‍💼 Rep Scorecard Log)

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appe0OSJtB1In1kn5/tblh3NQUtD22M7tDM';
const AIRTABLE_API_KEY = 'Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';

const RepScoreCard = () => {
  const [metrics, setMetrics] = useState({
    callVolume: 0,
    avgResponseTime: 0,
    dealsClosed: 0,
    ticketsResolved: 0,
    qualityScore: 0,
  });

  useEffect(() => {
    axios({
      method: 'GET',
      url: AIRTABLE_API_URL,
      headers: {
        Authorization: AIRTABLE_API_KEY,
      },
    })
    .then((response: any) => {
        const records: any[] = response.data.records;


      let callVolume = 0;
      let avgResponseTime = 0;
      let dealsClosed = 0;
      let ticketsResolved = 0;
      let qualityScore = 0;

      for (const r of records) {
        callVolume += parseInt(r.fields['📞 Call Volume'] || '0', 10);
        avgResponseTime += parseFloat(r.fields['⏱ Avg Response Time'] || '0');
        dealsClosed += parseInt(r.fields['💼 Deals Closed'] || '0', 10);
        ticketsResolved += parseInt(r.fields['✅ Tickets Resolved'] || '0', 10);
        qualityScore += parseFloat(r.fields['🌟 Quality Score'] || '0');
      }

      const total = records.length || 1;
      setMetrics({
        callVolume,
        avgResponseTime: +(avgResponseTime / total).toFixed(2),
        dealsClosed,
        ticketsResolved,
        qualityScore: +(qualityScore / total).toFixed(2),
      });
    });
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#001F3F] to-[#004466] p-4 border-2 border-cyan-400 shadow-xl text-white">
      <CardContent>
        <h3 className="text-white text-xl font-bold mb-4">🧑‍💼 Rep Scorecard Metrics</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm">📞 Call Volume: <span className="text-[#FF7BE5] font-bold text-lg">{metrics.callVolume}</span></p>
            <Progress value={Math.min(metrics.callVolume, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">⏱ Avg Response Time: <span className="text-[#73FBD3] font-bold text-lg">{metrics.avgResponseTime}s</span></p>
            <Progress value={Math.min(metrics.avgResponseTime, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">💼 Deals Closed: <span className="text-[#E0FF00] font-bold text-lg">{metrics.dealsClosed}</span></p>
            <Progress value={Math.min(metrics.dealsClosed, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">✅ Tickets Resolved: <span className="text-[#A3F3FF] font-bold text-lg">{metrics.ticketsResolved}</span></p>
            <Progress value={Math.min(metrics.ticketsResolved, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🌟 Quality Score: <span className="text-[#FFAD5C] font-bold text-lg">{metrics.qualityScore}</span></p>
            <Progress value={Math.min(metrics.qualityScore, 100)} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepScoreCard;
