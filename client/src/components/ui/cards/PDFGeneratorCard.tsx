import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const PDFGeneratorCard = () => {
  const [totalPDFs, setTotalPDFs] = useState(0);
  const [pending, setPending] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [failed, setFailed] = useState(0);
  const [averageGenTime, setAverageGenTime] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tbl9LkU1HnOEql60y').select({}).eachPage((records, fetchNextPage) => {
      let total = 0;
      let pendingCount = 0;
      let completedCount = 0;
      let failedCount = 0;
      let totalTime = 0;

      records.forEach(record => {
        const status = record.fields['📄 PDF Status'] || '';
        const genTime = Number(record.fields['⏱️ Generation Time (s)'] || 0);
        total++;

        if (status === '✅ Completed') completedCount++;
        else if (status === '❌ Failed') failedCount++;
        else pendingCount++;

        if (genTime > 0) totalTime += genTime;
      });

      setTotalPDFs(total);
      setPending(pendingCount);
      setCompleted(completedCount);
      setFailed(failedCount);
      setAverageGenTime(total > 0 ? totalTime / total : 0);
      fetchNextPage();
    });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-black border-4 border-[#0d82da] rounded-2xl p-4 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📄 PDF Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">🧾 Total PDFs</p>
          <p className="text-xl font-semibold text-[#00ff99]">{totalPDFs}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Completed</p>
          <p className="text-xl font-semibold text-[#00ffff]">{completed}</p>
          <Progress value={totalPDFs > 0 ? (completed / totalPDFs) * 100 : 0} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏳ Pending</p>
          <p className="text-xl font-semibold text-[#ffff66]">{pending}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Failed</p>
          <p className="text-xl font-semibold text-[#ff6666]">{failed}</p>
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱️ Avg. Gen Time</p>
          <p className="text-xl font-semibold text-[#ff00ff]">{averageGenTime.toFixed(2)}s</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFGeneratorCard;
