// LoggerIntegrityCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const LoggerIntegrityCard = () => {
  const [passed, setPassed] = useState(0);
  const [failed, setFailed] = useState(0);
  const [tampered, setTampered] = useState(0);
  const [missingFields, setMissingFields] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tbl1OaFaDA9jWKn0L').select({}).eachPage((records, fetchNextPage) => {
      let pass = 0;
      let fail = 0;
      let tamper = 0;
      let missing = 0;
      let total = 0;

      records.forEach(record => {
        const passFlag = record.fields['✅ Passed Check'] === true;
        const tamperFlag = record.fields['🚨 Tampering Flag'] === true;
        const failFlag = record.fields['❌ Failed Check'] === true;
        const missingFlag = record.fields['⚠️ Missing Fields?'] === true;

        if (passFlag) pass++;
        if (failFlag) fail++;
        if (tamperFlag) tamper++;
        if (missingFlag) missing++;
        total++;
      });

      setPassed(pass);
      setFailed(fail);
      setTampered(tamper);
      setMissingFields(missing);
      setTotalLogs(total);
      fetchNextPage();
    });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-black border-4 border-[#0d82da] rounded-2xl p-4 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">🛡️ Logger Integrity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Passed</p>
          <p className="text-xl font-semibold text-[#00ff99]">{passed}</p>
          <Progress value={totalLogs > 0 ? (passed / totalLogs) * 100 : 0} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Failed</p>
          <p className="text-xl font-semibold text-[#ff6666]">{failed}</p>
          <Progress value={totalLogs > 0 ? (failed / totalLogs) * 100 : 0} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🚨 Tampering</p>
          <p className="text-xl font-semibold text-[#ffff66]">{tampered}</p>
          <Progress value={totalLogs > 0 ? (tampered / totalLogs) * 100 : 0} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⚠️ Missing Fields</p>
          <p className="text-xl font-semibold text-[#ff00ff]">{missingFields}</p>
          <Progress value={totalLogs > 0 ? (missingFields / totalLogs) * 100 : 0} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📊 Total Logs</p>
          <p className="text-xl font-semibold text-[#00ffff]">{totalLogs}</p>
          <Progress value={100} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LoggerIntegrityCard;
