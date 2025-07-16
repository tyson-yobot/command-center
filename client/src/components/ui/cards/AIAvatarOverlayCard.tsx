import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const AIAvatarOverlayCard = () => {
  const [avatarsGenerated, setAvatarsGenerated] = useState(0);
  const [successfulOverlays, setSuccessfulOverlays] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [avgRenderTime, setAvgRenderTime] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblAVATARCARD991')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let total = 0;
        let success = 0;
        let fail = 0;
        let timeSum = 0;
        let timeCount = 0;
        const userSet = new Set();

        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          total += 1;
          if (record.fields['✅ Overlay Success']) success += 1;
          if (record.fields['❌ Overlay Failed']) fail += 1;

          const rawRender = record.fields['⏱️ Render Time (s)'];
          const render =
            typeof rawRender === 'string' || typeof rawRender === 'number'
              ? parseFloat(String(rawRender))
              : NaN;
          if (!isNaN(render)) {
            timeSum += render;
            timeCount += 1;
          }

          const user = record.fields['👤 User ID'];
          if (typeof user === 'string' && user.trim() !== '') userSet.add(user);
        }

        setAvatarsGenerated(total);
        setSuccessfulOverlays(success);
        setFailedAttempts(fail);
        setAvgRenderTime(timeSum / (timeCount || 1));
        setUniqueUsers(userSet.size);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-black to-[#0d0d0d] text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">🧑‍💼 AI Avatar Overlay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">🎭 Total Avatars Generated</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avatarsGenerated}</p>
          <Progress value={avatarsGenerated} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Successful Overlays</p>
          <p className="text-xl font-semibold text-[#00ffff]">{successfulOverlays}</p>
          <Progress value={successfulOverlays} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Failed Overlay Attempts</p>
          <p className="text-xl font-semibold text-[#00ffff]">{failedAttempts}</p>
          <Progress value={failedAttempts} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱️ Average Render Time (s)</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgRenderTime.toFixed(2)} sec</p>
          <Progress value={avgRenderTime} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">👤 Unique Users</p>
          <p className="text-xl font-semibold text-[#00ffff]">{uniqueUsers}</p>
          <Progress value={uniqueUsers} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAvatarOverlayCard;
