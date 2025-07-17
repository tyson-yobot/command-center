import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

// ✅ HARD-CODED Airtable Base ID + Table ID
// Base ID: appRt8V3tH4g5Z5if
// Table ID: tblXGb2iLJfGdK2UJ (💰 SmartSpend™ Log)

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblXGb2iLJfGdK2UJ';
const AIRTABLE_API_KEY = 'Bearer AIRTABLE_API_KEY';

const SmartspendCard = () => {
  const [metrics, setMetrics] = useState({
    totalSavings: 0,
    avgMonthlySavings: 0,
    automationWins: 0,
    flaggedWaste: 0,
    recurringReviewItems: 0,
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

      let totalSavings = 0;
      let monthlySum = 0;
      let automationWins = 0;
      let flaggedWaste = 0;
      let recurringReviewItems = 0;

      for (const r of records) {
        totalSavings += parseFloat(r.fields['💰 Total Saved ($)'] || '0');
        monthlySum += parseFloat(r.fields['📆 Monthly Savings ($)'] || '0');
        automationWins += r.fields['✅ Automation Success'] === true ? 1 : 0;
        flaggedWaste += r.fields['🚨 Flagged as Waste'] === true ? 1 : 0;
        recurringReviewItems += r.fields['🔁 Recurring Review?'] === 'Yes' ? 1 : 0;
      }

      const total = records.length || 1;
      setMetrics({
        totalSavings,
        avgMonthlySavings: +(monthlySum / total).toFixed(2),
        automationWins,
        flaggedWaste,
        recurringReviewItems,
      });
    });
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] p-4 border-2 border-[#0d82da] shadow-xl text-white">
      <CardContent>
        <h3 className="text-white text-xl font-bold mb-4">💰 SmartSpend™ KPIs</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm">💸 Total Savings: <span className="text-[#00ffcc] font-bold text-lg">${metrics.totalSavings}</span></p>
            <Progress value={Math.min(metrics.totalSavings / 1000, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">📆 Avg Monthly Savings: <span className="text-[#ffcc00] font-bold text-lg">${metrics.avgMonthlySavings}</span></p>
            <Progress value={Math.min(metrics.avgMonthlySavings / 100, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">✅ Automation Wins: <span className="text-[#66ff66] font-bold text-lg">{metrics.automationWins}</span></p>
            <Progress value={Math.min(metrics.automationWins, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🚨 Flagged Waste Items: <span className="text-[#ff3366] font-bold text-lg">{metrics.flaggedWaste}</span></p>
            <Progress value={Math.min(metrics.flaggedWaste, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🔁 Recurring Reviews: <span className="text-[#9933ff] font-bold text-lg">{metrics.recurringReviewItems}</span></p>
            <Progress value={Math.min(metrics.recurringReviewItems, 100)} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartspendCard;
