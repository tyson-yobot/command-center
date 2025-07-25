import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const BotalyticsCard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [botEfficiency, setBotEfficiency] = useState(0);
  const [avgTimePerDeal, setAvgTimePerDeal] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);
  const [avgBotSpend, setAvgBotSpend] = useState(0);
  const [reductionRate, setReductionRate] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblhxK9sI3MMkTLk2')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let totalBotRevenue = 0;
        let totalManualRevenue = 0;
        let totalTimeSaved = 0;
        let totalBotDeals = 0;
        let totalLeads = 0;
        let totalSpend = 0;
        let totalManualSpend = 0;
        let spendCount = 0;

        records.forEach(record => {
          const botRev = parseFloat(String(record.fields['💰 Revenue (Bot)'] || 0));
          const manualRev = parseFloat(String(record.fields['🧾 Revenue (Manual)'] || 0));
          const time = parseFloat(String(record.fields['⏱️ Time Saved (hrs)'] || 0));
          const deals = parseFloat(String(record.fields['🤖 Deals Closed (Bot)'] || 0));
          const leads = parseFloat(String(record.fields['🟡 Leads Captured'] || 0));
          const spend = parseFloat(String(record.fields['🤖 Bot Spend'] || 0));
          const manualSpend = parseFloat(String(record.fields['🧾 Manual Spend'] || 0));

          totalBotRevenue += isNaN(botRev) ? 0 : botRev;
          totalManualRevenue += isNaN(manualRev) ? 0 : manualRev;
          totalTimeSaved += isNaN(time) ? 0 : time;
          totalBotDeals += isNaN(deals) ? 0 : deals;
          totalLeads += isNaN(leads) ? 0 : leads;
          totalSpend += isNaN(spend) ? 0 : spend;
          totalManualSpend += isNaN(manualSpend) ? 0 : manualSpend;
          spendCount++;
        });

        const total = totalBotRevenue;
        const efficiency = totalManualRevenue > 0 ? ((totalBotRevenue - totalManualRevenue) / totalManualRevenue) * 100 : 0;
        const avgTime = totalBotDeals > 0 ? totalTimeSaved / totalBotDeals : 0;
        const closeRate = totalLeads > 0 ? (totalBotDeals / totalLeads) * 100 : 0;
        const avgSpend = spendCount > 0 ? totalSpend / spendCount : 0;
        const reduction = totalManualSpend > 0 ? ((totalManualSpend - totalSpend) / totalManualSpend) * 100 : 0;

        setTotalRevenue(total);
        setBotEfficiency(efficiency);
        setAvgTimePerDeal(avgTime);
        setConversionRate(closeRate);
        setTotalDeals(totalBotDeals);
        setAvgBotSpend(avgSpend);
        setReductionRate(reduction);

        fetchNextPage();
      });
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
        <div>
          <p className="text-sm text-[#c3c3c3]">💳 Avg Bot Spend</p>
          <p className="text-xl font-semibold text-[#00ffff]">${avgBotSpend.toFixed(2)}</p>
          <Progress value={avgBotSpend} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📉 Manual Spend Reduction (%)</p>
          <p className="text-xl font-semibold text-[#00ffff]">{reductionRate.toFixed(2)}%</p>
          <Progress value={reductionRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default Bo