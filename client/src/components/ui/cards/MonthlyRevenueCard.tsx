// MonthlyRevenueCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const MonthlyRevenueCard = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(0);
  const [oneTimeRevenue, setOneTimeRevenue] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [avgDealSize, setAvgDealSize] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tblrAXR8cDqsxJ9yW').select({}).eachPage((records, fetchNextPage) => {
      let total = 0;
      let subTotal = 0;
      let oneTimeTotal = 0;
      let pending = 0;
      let deals = 0;

      records.forEach(record => {
        const amount = Number(record.fields['💰 Invoice Amount'] || 0);
        const type = record.fields['🔁 Recurring Type'];
        const status = record.fields['📌 Payment Status'];

        if (status === '✅ Paid') {
          total += amount;
          if (type === 'Monthly') subTotal += amount;
          if (type === 'One-Time') oneTimeTotal += amount;
          deals++;
        } else if (status === '⏳ Pending') {
          pending++;
        }
      });

      setMonthlyRevenue(total);
      setSubscriptionRevenue(subTotal);
      setOneTimeRevenue(oneTimeTotal);
      setPendingInvoices(pending);
      setAvgDealSize(deals > 0 ? total / deals : 0);

      fetchNextPage();
    });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-black border-4 border-[#0d82da] rounded-2xl p-4 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">💵 Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">💰 Total Revenue Collected</p>
          <p className="text-xl font-semibold text-[#33ffcc]">${monthlyRevenue.toLocaleString()}</p>
          <Progress value={monthlyRevenue / 100000 * 100} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🔁 Recurring Subscription Revenue</p>
          <p className="text-xl font-semibold text-[#66ff66]">${subscriptionRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🧾 One-Time Payments</p>
          <p className="text-xl font-semibold text-[#ffcc66]">${oneTimeRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏳ Pending Invoices</p>
          <p className="text-xl font-semibold text-[#ff6666]">{pendingInvoices}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📈 Avg Deal Size</p>
          <p className="text-xl font-semibold text-[#cc99ff]">${avgDealSize.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueCard;
