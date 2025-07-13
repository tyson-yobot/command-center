import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const CRMSyncCard = () => {
  const [recordsSynced, setRecordsSynced] = useState(0);
  const [syncErrors, setSyncErrors] = useState(0);
  const [totalLeadsCreated, setTotalLeadsCreated] = useState(0);
  const [syncSuccessRate, setSyncSuccessRate] = useState(0);
  const [duplicatesBlocked, setDuplicatesBlocked] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblAS8oT9IdEvRtsT')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let synced = 0;
        let errors = 0;
        let leads = 0;
        let blocked = 0;

        records.forEach(record => {
          const isSynced = record.fields['✅ Synced to CRM'] === true;
          const hasError = record.fields['❌ CRM Error'] === true;
          const isLead = record.fields['👤 Lead Created'] === true;
          const isDuplicate = record.fields['🛑 Duplicate Blocked'] === true;

          if (isSynced) synced++;
          if (hasError) errors++;
          if (isLead) leads++;
          if (isDuplicate) blocked++;
        });

        const successRate = synced + errors > 0 ? Math.round((synced / (synced + errors)) * 100) : 0;

        setRecordsSynced(synced);
        setSyncErrors(errors);
        setTotalLeadsCreated(leads);
        setDuplicatesBlocked(blocked);
        setSyncSuccessRate(successRate);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">🔗 CRM Sync</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Records Synced</p>
          <p className="text-xl font-semibold text-[#00ffff]">{recordsSynced}</p>
          <Progress value={recordsSynced} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Sync Errors</p>
          <p className="text-xl font-semibold text-[#00ffff]">{syncErrors}</p>
          <Progress value={syncErrors} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📇 Leads Created</p>
          <p className="text-xl font-semibold text-[#00ffff]">{totalLeadsCreated}</p>
          <Progress value={totalLeadsCreated} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📊 Sync Success Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{syncSuccessRate}%</p>
          <Progress value={syncSuccessRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🛑 Duplicates Blocked</p>
          <p className="text-xl font-semibold text-[#00ffff]">{duplicatesBlocked}</p>
          <Progress value={duplicatesBlocked} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMSyncCard;
