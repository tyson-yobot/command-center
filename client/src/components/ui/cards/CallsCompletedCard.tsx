import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const CallsCompletedCard = () => {
  const [totalCalls, setTotalCalls] = useState(0);
  const [successfulCalls, setSuccessfulCalls] = useState(0);
  const [avgCallDuration, setAvgCallDuration] = useState(0);
  const [missedCalls, setMissedCalls] = useState(0);
  const [voicemailRate, setVoicemailRate] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblOXzI1AzCklA0Jv')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let total = 0;
        let success = 0;
        let totalDuration = 0;
        let countDuration = 0;
        let missed = 0;
        let voicemail = 0;

        records.forEach(record => {
          const isComplete = record.fields['📞 Call Completed'] === true;
          const isSuccessful = record.fields['✅ Call Success'] === true;
          const duration = Number(record.fields['⏱ Call Duration']) || 0;
          const isMissed = record.fields['🚫 Missed Call'] === true;
          const isVoicemail = record.fields['📬 Voicemail Left'] === true;

          if (isComplete) total++;
          if (isSuccessful) success++;
          if (duration > 0) {
            totalDuration += duration;
            countDuration++;
          }
          if (isMissed) missed++;
          if (isVoicemail) voicemail++;
        });

        setTotalCalls(total);
        setSuccessfulCalls(success);
        setAvgCallDuration(countDuration > 0 ? Math.round(totalDuration / countDuration) : 0);
        setMissedCalls(missed);
        setVoicemailRate(total > 0 ? Math.round((voicemail / total) * 100) : 0);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📞 Calls Completed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">📞 Total Completed Calls</p>
          <p className="text-xl font-semibold text-[#00ffff]">{totalCalls}</p>
          <Progress value={totalCalls} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Successful Calls</p>
          <p className="text-xl font-semibold text-[#00ffff]">{successfulCalls}</p>
          <Progress value={successfulCalls} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱ Avg Call Duration</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgCallDuration} sec</p>
          <Progress value={avgCallDuration} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">🚫 Missed Calls</p>
          <p className="text-xl font-semibold text-[#00ffff]">{missedCalls}</p>
          <Progress value={missedCalls} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📬 Voicemail Rate</p>
          <p className="text-xl font-semibold text-[#00ffff]">{voicemailRate}%</p>
          <Progress value={voicemailRate} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CallsCompletedCard;
