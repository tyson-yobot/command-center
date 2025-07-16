import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const DealsClosedCard = () => {
  const [closedWon, setClosedWon] = useState(0);
  const [closedLost, setClosedLost] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [avgDealSize, setAvgDealSize] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblgPyQHVaygoRHJ2')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let won = 0;
        let lost = 0;
        let total = 0;
        let totalRevenue = 0;

        records.forEach(record => {
          const status = record.fields['🎯 Deal Status'];
          const rawValue = record.fields['💵 Deal Value'];
          const value = typeof rawValue === 'string' ? parseFloat(rawValue) : Number(rawValue) || 0;

          if (status === 'Closed Won') {
            won++;
            totalRevenue += value;
          } else if (status === 'Closed Lost') {
            lost++;
          }
        });

        total = won + lost;

        setClosedWon(won);
        setClosedLost(lost);
        setTotalDeals(total);
        setWinRate(total > 0 ? Math.round((won / total) * 100) : 0);
        setAvgDealSize(won > 0 ? Math.round(totalRevenue / won) : 0);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">🤝 Deals Closed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Closed Won</p>
          <p className="text-xl font-semibold text-[#00ffff]">{closedWon}</p>
          <Progress value={closedWon} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Closed Lost</p>
          <p className="text-xl font-semibold text-[#00ffff]">{closedLost}</p>
          <Progress value={closedLost} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📊 Total Deals</p>
          <p className="text-xl font-semibold text-[#00ffff]">{totalDeals}</p>
          <Progress value={totalDeals} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🏆 Win Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{winRate}%</p>
          <Progress value={winRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">💰 Avg Deal Size</p>
          <p className="text-xl font-semibold text-[#00ffff]">${avgDealSize}</p>
          <Progress value={avgDealSize} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default DealsClosedCard;
