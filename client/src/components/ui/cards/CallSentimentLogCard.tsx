// Call Sentiment Log Card – Full Implementation

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CallSentimentLogCard = () => {
  const [sentimentScore, setSentimentScore] = useState(0);
  const [dominantTone, setDominantTone] = useState('');
  const [alertFlag, setAlertFlag] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallSentiment = async () => {
      try {
        const res = await axios.get('/api/airtable/call-sentiment');
        const data = res.data;

        setSentimentScore(data['📊 Sentiment Score'] || 0);
        setDominantTone(data['🗣️ Dominant Tone'] || 'Neutral');
        setAlertFlag(data['🚨 Alert Flag'] === 'Yes');

        if (data['🚨 Alert Flag'] === 'Yes') {
          await postToSlack(`📞 Alert: Negative call sentiment detected – Tone: ${data['🗣️ Dominant Tone']}`);
        }
      } catch (err) {
        console.error('Call sentiment fetch error:', err);
        await postToSlack(`❗ Failed to fetch call sentiment: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCallSentiment();
  }, []);

  const reanalyzeSentiment = async () => {
    try {
      await axios.post('/api/airtable/reanalyze-call-sentiment');
      await postToSlack('🔁 Reanalysis of call sentiment logs manually triggered.');
    } catch (error) {
      console.error('Sentiment reanalysis error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-blue-500 bg-[#0a0a0a] text-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">📞 Call Sentiment Log</h3>
      {loading ? (
        <div className="text-gray-400">Loading call sentiment data...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-yellow-300 font-semibold">
              Sentiment Score: <span className="text-white">{sentimentScore}/100</span>
            </div>
            <div className="text-pink-400 font-semibold">
              Dominant Tone: <span className="text-white">{dominantTone}</span>
            </div>
            <div className="text-red-400 font-semibold">
              Alert Triggered: <span className="text-white">{alertFlag ? 'Yes' : 'No'}</span>
            </div>
          </div>
          <button
            onClick={reanalyzeSentiment}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🔁 Reanalyze Call Logs
          </button>
        </>
      )}
    </div>
  );
};

export default CallSentimentLogCard;


// Slack Util Function – Local Copy
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

export const postToSlack = async (message: string): Promise<void> => {
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❗ Slack webhook failed:', error);
  }
};
