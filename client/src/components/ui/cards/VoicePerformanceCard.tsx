import React, { useEffect } from 'react';
import axios from 'axios';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CircleMeter } from '@/components/ui/CircleMeter';
import { AlertCircle } from 'phosphor-react';

export default function VoicePerformanceCard() {
  useEffect(() => {
    fetchVoicePerformanceData();
  }, []);

  const fetchVoicePerformanceData = async () => {
    try {
      const response = await axios.get(
        'https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblhux5RjOYMaQ3R1',
        {
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      );

    const records: any[] = response.data.records;

      const totalCalls = records.length;

      let totalDuration = 0;
      let totalSentiment = 0;
      let conversionCount = 0;
      let missedCount = 0;

      for (const r of records) {
        totalDuration += Number(r.fields?.['⏱ Call Duration (min)']) || 0;
        totalSentiment += Number(r.fields?.['📊 Sentiment Score (%)']) || 0;
        if (r.fields?.['🎯 Conversion'] === true) conversionCount++;
        if (r.fields?.['📞 Call Outcome'] === '❌ Missed') missedCount++;
      }

      const avgCallDuration = totalCalls > 0 ? Math.round((totalDuration / totalCalls) * 10) / 10 : 0;
      const conversionRate = totalCalls > 0 ? Math.round((conversionCount / totalCalls) * 100) : 0;
      const sentimentScore = totalCalls > 0 ? Math.round(totalSentiment / totalCalls) : 0;

      document.getElementById('totalCalls')?.style.setProperty('--progress', `${totalCalls}`);
      document.getElementById('avgCallDuration')?.style.setProperty('--percent', `${Math.min((avgCallDuration / 10) * 100, 100)}`);
      document.getElementById('conversionRate')?.style.setProperty('--progress', `${conversionRate}`);
      document.getElementById('sentimentScore')?.style.setProperty('--percent', `${sentimentScore}`);
      document.getElementById('missedCalls')!.textContent = `${missedCount}`;
    } catch (error) {
      console.error('[ERROR] VoicePerformanceCard failed to load:', error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] border-4 border-[#c0c0c0] rounded-2xl p-4 shadow-xl text-white w-full max-w-[420px]">
      <h2 className="text-white text-xl font-bold mb-4">📞 VoiceBot Performance</h2>

      <div className="space-y-5">
        <div>
          <div className="text-neon-green text-lg font-semibold">📈 Total Calls</div>
          <ProgressBar id="totalCalls" value={0} max={500} label={`...`} />
        </div>

        <div>
          <div className="text-neon-yellow text-lg font-semibold">⏱ Avg Call Duration</div>
          <CircleMeter id="avgCallDuration" percent={0} label={`...`} />
        </div>

        <div>
          <div className="text-neon-blue text-lg font-semibold">🎯 Conversion Rate</div>
          <ProgressBar id="conversionRate" value={0} max={100} label={`...`} />
        </div>

        <div>
          <div className="text-neon-purple text-lg font-semibold">😊 Avg Sentiment</div>
          <CircleMeter id="sentimentScore" percent={0} label={`...`} />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-neon-red text-lg font-semibold">❌ Missed Calls</div>
          <div className="flex items-center gap-2">
            <AlertCircle size={28} className="text-red-500 animate-pulse" />
            <span id="missedCalls" className="text-white font-bold text-xl">...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
