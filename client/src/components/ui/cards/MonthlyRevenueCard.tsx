import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const MonthlyRevenueCard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageDealSize, setAverageDealSize] = useState(0);
  const [recurringRevenue, setRecurringRevenue] = useState(0);
  const [invoiced, setInvoiced] = useState(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tblUJ15ErTcfNjsYi').select({}).eachPage((records, fetchNextPage) => {
      let total = 0;
      let recurring = 0;
      let invoicedTotal = 0;
      let unpaid = 0;

      records.forEach(record => {
        const oneTime = Number(record.fields['💳 One-Time Payment'] || 0);
        const monthly = Number(record.fields['📆 Monthly Recurring'] || 0);
        const paid = record.fields['✅ Paid?'] === true;

        total += oneTime + monthly;
        recurring += monthly;
        invoicedTotal += paid ? oneTime + monthly : 0;
        if (!paid) unpaid += oneTime + monthly;
      });

      setTotalRevenue(total);
      setRecurringRevenue(recurring);
      setInvoiced(invoicedTotal);
      setUnpaidInvoices(unpaid);
      setAverageDealSize(records.length > 0 ? total / records.length : 0);
      fetchNextPage();
    });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-black border-4 border-[#0d82da] rounded-2xl p-4 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">💰 Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">💸 Total Revenue</p>
          <p className="text-xl font-semibold text-[#00ff99]">${totalRevenue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🔁 Recurring Revenue</p>
          <p className="text-xl font-semibold text-[#00ffff]">${recurringRevenue.toFixed(2)}</p>
          <Progress value={totalRevenue > 0 ? (recurringRevenue / totalRevenue) * 100 : 0} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🧾 Invoiced</p>
          <p className="text-xl font-semibold text-[#ffff66]">${invoiced.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📭 Unpaid Invoices</p>
          <p className="text-xl font-semibold text-[#ff6666]">${unpaidInvoices.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📊 Avg Deal Size</p>
          <p className="text-xl font-semibold text-[#ff00ff]">${averageDealSize.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueCard;
