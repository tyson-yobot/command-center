import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

// ✅ HARD-CODED Airtable Base ID + Table ID
// Base ID: appe0OSJtB1In1kn5
// Table ID: tblY0QXuXkDE3EDg3 (📊 Call Sentiment Log)

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appe0OSJtB1In1kn5/tblY0QXuXkDE3EDg3';
const AIRTABLE_API_KEY = 'Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';

const SentimentCard = () => {
  const [metrics, setMetrics] = useState({
    positiveSentiment: 0,
    negativeSentiment: 0,
    neutralSentiment: 0,
    avgSentimentScore: 0,
    flaggedCalls: 0,
  });

  useEffect(() => {
    axios({
      method: 'GET',
      url: AIRTABLE_API_URL,
      headers: {
        Authorization: AIRTABLE_API_KEY,
      },
    }).then((response: any) => {
      const records: any[] = response.data.records;

      let positiveSentiment = 0;
      let negativeSentiment = 0;
      let neutralSentiment = 0;
      let avgSentimentScore = 0;
      let flaggedCalls = 0;

      for (const r of records) {
        positiveSentiment += parseInt(r.fields['😊 Positive'] || '0', 10);
        negativeSentiment += parseInt(r.fields['😠 Negative'] || '0', 10);
        neutralSentiment += parseInt(r.fields['😐 Neutral'] || '0', 10);
        avgSentimentScore += parseFloat(r.fields['📊 Avg Score'] || '0');
        flaggedCalls += parseInt(r.fields['🚩 Flagged'] || '0', 10);
      }

      const total = records.length || 1;
      setMetrics({
        positiveSentiment,
        negativeSentiment,
        neutralSentiment,
        avgSentimentScore: +(avgSentimentScore / total).toFixed(2),
        flaggedCalls,
      });
    });
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] p-4 border-2 border-[#00FFFF] shadow-xl text-white">
      <CardContent>
        <h3 className="text-white text-xl font-bold mb-4">📊 Sentiment Analysis KPIs</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm">😊 Positive: <span className="text-[#00FFAA] font-bold text-lg">{metrics.positiveSentiment}</span></p>
            <Progress value={Math.min(metrics.positiveSentiment, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">😠 Negative: <span className="text-[#FF3366] font-bold text-lg">{metrics.negativeSentiment}</span></p>
            <Progress value={Math.min(metrics.negativeSentiment, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">😐 Neutral: <span className="text-[#CCCC00] font-bold text-lg">{metrics.neutralSentiment}</span></p>
            <Progress value={Math.min(metrics.neutralSentiment, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">📊 Avg Sentiment Score: <span className="text-[#FF00FF] font-bold text-lg">{metrics.avgSentimentScore}</span></p>
            <Progress value={Math.min(metrics.avgSentimentScore, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🚩 Flagged Calls: <span className="text-[#FF6600] font-bold text-lg">{metrics.flaggedCalls}</span></p>
            <Progress value={Math.min(metrics.flaggedCalls, 100)} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentCard;
