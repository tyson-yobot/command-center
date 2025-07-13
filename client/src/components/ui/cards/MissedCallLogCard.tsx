// LoggerIntegrityCard.tsx
// (Already added above)

// MissedCallLogCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const MissedCallLogCard = () => {
  const [missed, setMissed] = useState(0);
  const [voicemail, setVoicemail] = useState(0);
  const [callback, setCallback] = useState(0);
  const [notified, setNotified] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');
    base('tblb9HyjUKmlRAfn3').select({}).eachPage((records, fetchNextPage) => {
      let missedCount = 0;
      let voicemailCount = 0;
      let callbackCount = 0;
      let notifiedCount = 0;
      let totalCount = 0;

      records.forEach(record => {
        const missedFlag = record.fields['📞 Missed?'] === true;
        const voicemailFlag = record.fields['🎙️ Voicemail Left?'] === true;
        const callbackFlag = record.fields['📆 Callback Scheduled?'] === true;
        const notifiedFlag = record.fields['📣 Slack Notified?'] === true;

        totalCount++;
        if (missedFlag) missedCount++;
        if (voicemailFlag) voicemailCount++;
        if (callbackFlag) callbackCount++;
        if (notifiedFlag) notifiedCount++;
      });

      setMissed(missedCount);
      setVoicemail(voicemailCount);
      setCallback(callbackCount);
      setNotified(notifiedCount);
      setTotal(totalCount);
      fetchNextPage();
    });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-black border-4 border-[#0d82da] rounded-2xl p-4 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📵 Missed Call Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">📞 Missed Calls</p>
          <p className="text-xl font-semibold text-[#ff6666]">{missed}</p>
          <Progress value={missed} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🎙️ Voicemails</p>
          <p className="text-xl font-semibold text-[#00ffff]">{voicemail}</p>
          <Progress value={voicemail} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📆 Callbacks</p>
          <p className="text-xl font-semibold text-[#00ff99]">{callback}</p>
          <Progress value={callback} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📣 Slack Alerts</p>
          <p className="text-xl font-semibold text-[#ffff66]">{notified}</p>
          <Progress value={notified} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📊 Total Logs</p>
          <p className="text-xl font-semibold text-[#ff00ff]">{total}</p>
          <Progress value={total} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default MissedCallLogCard;
