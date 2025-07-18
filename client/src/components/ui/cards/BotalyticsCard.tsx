import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const BotalyticsCard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [botEfficiency, setBotEfficiency] = useState(0);
  const [avgTimePerDeal, setAvgTimePerDeal] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/airtable/analytics-stats');
        const data = await response.json();
        
        if (data.success) {
          setTotalRevenue(data.metrics.totalRevenue || 0);
          setBotEfficiency(data.metrics.botEfficiency || 0);
          setAvgTimePerDeal(data.metrics.avgTimePerDeal || 0);
          setConversionRate(data.metrics.conversionRate || 0);
          setTotalDeals(data.metrics.totalDeals || 0);
        } else {
          setTotalRevenue(0);
          setBotEfficiency(0);
          setAvgTimePerDeal(0);
          setConversionRate(0);
          setTotalDeals(0);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setTotalRevenue(0);
        setBotEfficiency(0);
        setAvgTimePerDeal(0);
        setConversionRate(0);
        setTotalDeals(0);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="bg-gradient-to-b from-yellow-800 to-yellow-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📊 Botalytics ROI Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">💰 Total Revenue</p>
          <p className="text-xl font-semibold text-[#00ffff]">${totalRevenue.toLocaleString()}</p>
          <Progress value={totalRevenue} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🚀 Bot Efficiency (%)</p>
          <p className="text-xl font-semibold text-[#00ffff]">{botEfficiency.toFixed(2)}%</p>
          <Progress value={botEfficiency} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱️ Avg Time Saved per Deal (hrs)</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgTimePerDeal.toFixed(1)}</p>
          <Progress value={avgTimePerDeal} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🔁 Bot Close Rate (%)</p>
          <p className="text-xl font-semibold text-[#00ffff]">{conversionRate.toFixed(2)}%</p>
          <Progress value={conversionRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📦 Total Deals Closed (Bot)</p>
          <p className="text-xl font-semibold text-[#00ffff]">{totalDeals}</p>
          <Progress value={totalDeals} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BotalyticsCard;
