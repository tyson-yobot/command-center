import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

// ✅ HARD-CODED Airtable Base ID + Table ID
// Base ID: appe0OSJtB1In1kn5
// Table ID: tblB5BG0ZYXarAKsAv (📣 Slack Alerts Log)

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appe0OSJtB1In1kn5/tblB5BG0ZYXarAKsAv';
const AIRTABLE_API_KEY = 'Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';

const SlackAlertsCard = () => {
  const [metrics, setMetrics] = useState({
    alertsToday: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0,
    avgResponseTime: 0,
    openIssues: 0,
  });

  useEffect(() => {
    axios({
      method: 'GET',
      url: AIRTABLE_API_URL,
      headers: {
        Authorization: AIRTABLE_API_KEY,
      },
    }).then((response: any) => {
      const records: any[] = response.data.records;

      let alertsToday = 0;
      let criticalAlerts = 0;
      let resolvedAlerts = 0;
      let totalResponseTime = 0;
      let openIssues = 0;

      for (const r of records) {
        alertsToday += r.fields['📆 Alert Today'] ? 1 : 0;
        criticalAlerts += r.fields['❗ Severity'] === 'Critical' ? 1 : 0;
        resolvedAlerts += r.fields['✅ Resolved'] === true ? 1 : 0;
        totalResponseTime += parseFloat(r.fields['⏱️ Response Time (min)'] || '0');
        openIssues += r.fields['🟡 Open'] === true ? 1 : 0;
      }

      const total = records.length || 1;
      setMetrics({
        alertsToday,
        criticalAlerts,
        resolvedAlerts,
        avgResponseTime: +(totalResponseTime / total).toFixed(2),
        openIssues,
      });
    });
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] p-4 border-2 border-[#00FFFF] shadow-xl text-white">
      <CardContent>
        <h3 className="text-white text-xl font-bold mb-4">📣 Slack Alerts KPIs</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm">📆 Alerts Today: <span className="text-[#00FFAA] font-bold text-lg">{metrics.alertsToday}</span></p>
            <Progress value={Math.min(metrics.alertsToday, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">❗ Critical Alerts: <span className="text-[#FF3366] font-bold text-lg">{metrics.criticalAlerts}</span></p>
            <Progress value={Math.min(metrics.criticalAlerts, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">✅ Resolved Alerts: <span className="text-[#00FF00] font-bold text-lg">{metrics.resolvedAlerts}</span></p>
            <Progress value={Math.min(metrics.resolvedAlerts, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">⏱️ Avg Response Time: <span className="text-[#FF00FF] font-bold text-lg">{metrics.avgResponseTime} min</span></p>
            <Progress value={Math.min(metrics.avgResponseTime, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🟡 Open Issues: <span className="text-[#FFFF00] font-bold text-lg">{metrics.openIssues}</span></p>
            <Progress value={Math.min(metrics.openIssues, 100)} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SlackAlertsCard;
