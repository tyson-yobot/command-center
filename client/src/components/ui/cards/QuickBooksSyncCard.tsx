// QuickBooksSyncCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const QuickBooksSyncCard = () => {
  const [invoicesSynced, setInvoicesSynced] = useState(0);
  const [paymentsPosted, setPaymentsPosted] = useState(0);
  const [errors, setErrors] = useState(0);
  const [avgSyncTime, setAvgSyncTime] = useState(0);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tblxuM76W9gvdAfkM').select({}).eachPage((records, fetchNextPage) => {
      let synced = 0;
      let posted = 0;
      let errorCount = 0;
      let syncTimeTotal = 0;
      let syncTimeCount = 0;
      let pending = 0;

      records.forEach(record => {
        const status = record.fields['🧾 Sync Status'];
        const type = record.fields['📂 Record Type'];
        const syncTime = Number(record.fields['⏱️ Sync Time (s)'] || 0);

        if (status === '✅ Synced' && type === 'Invoice') synced++;
        if (status === '✅ Synced' && type === 'Payment') posted++;
        if (status === '❌ Error') errorCount++;
        if (status === '🕒 Pending') pending++;

        if (syncTime > 0) {
          syncTimeTotal += syncTime;
          syncTimeCount++;
        }
      });

      setInvoicesSynced(synced);
      setPaymentsPosted(posted);
      setErrors(errorCount);
      setAvgSyncTime(syncTimeCount > 0 ? syncTimeTotal / syncTimeCount : 0);
      setPendingSyncs(pending);
      fetchNextPage();
    });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-black border-4 border-[#0d82da] rounded-2xl p-4 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">💰 QuickBooks Sync</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">🧾 Invoices Synced (All Sources)</p>
          <p className="text-xl font-semibold text-[#66ff66]">{invoicesSynced}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">💳 Payments Successfully Posted</p>
          <p className="text-xl font-semibold text-[#33ffff]">{paymentsPosted}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Total Errors Encountered</p>
          <p className="text-xl font-semibold text-[#ff6666]">{errors}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⚡ Avg Sync Time (Seconds)</p>
          <p className="text-xl font-semibold text-[#cc99ff]">{avgSyncTime.toFixed(2)}s</p>
          <Progress value={Math.min(avgSyncTime, 30)} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📥 Pending Items Waiting for Sync</p>
          <p className="text-xl font-semibold text-[#ffff66]">{pendingSyncs}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickBooksSyncCard;
