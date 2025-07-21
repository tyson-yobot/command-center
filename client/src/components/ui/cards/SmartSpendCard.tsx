import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';


const SmartspendCard = () => {
  const [metrics, setMetrics] = useState({
    totalSavings: 0,
    avgMonthlySavings: 0,
    automationWins: 0,
    flaggedWaste: 0,
    recurringReviewItems: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/airtable/smart-spend-stats');
        const data = await response.json();
        
        if (data.success) {
          setMetrics({
            totalSavings: data.metrics.totalSavings || 0,
            avgMonthlySavings: data.metrics.avgMonthlySavings || 0,
            automationWins: data.metrics.automationWins || 0,
            flaggedWaste: data.metrics.flaggedWaste || 0,
            recurringReviewItems: data.metrics.recurringReviewItems || 0
          });
        } else {
          setMetrics({
            totalSavings: 0,
            avgMonthlySavings: 0,
            automationWins: 0,
            flaggedWaste: 0,
            recurringReviewItems: 0
          });
        }
      } catch (error) {
        console.error('Error fetching spend data:', error);
        setMetrics({
          totalSavings: 0,
          avgMonthlySavings: 0,
          automationWins: 0,
          flaggedWaste: 0,
          recurringReviewItems: 0
        });
      }
    };

    fetchData();
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
