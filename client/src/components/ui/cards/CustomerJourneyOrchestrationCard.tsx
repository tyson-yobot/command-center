// Customer Journey Orchestration Card – Full Implementation

import React, { useEffect, useState } from 'react';
import axios from 'axios';


const CustomerJourneyCard = () => {
  const [lifecycleStage, setLifecycleStage] = useState('');
  const [touchpointCount, setTouchpointCount] = useState(0);
  const [conversionHeat, setConversionHeat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourneyData = async () => {
      try {
        const res = await axios.get('/api/airtable/customer-journey');
        const data = res.data;

        setLifecycleStage(data['📍 Lifecycle Stage'] || 'Unknown');
        setTouchpointCount(data['🔁 Touchpoints'] || 0);
        setConversionHeat(data['🔥 Conversion Heat'] || 'Neutral');

        if (data['🔥 Conversion Heat'] === 'Hot') {
          await postToSlack(`📈 Conversion heat detected: Hot lead in '${data['📍 Lifecycle Stage']}' stage.`);
        }
      } catch (err) {
        console.error('Customer journey fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        await postToSlack(`❗ Customer journey data fetch failed: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyData();
  }, []);

  const reanalyzeJourney = async () => {
    try {
      await axios.post('/api/airtable/analyze-journey');
      await postToSlack('🧭 Customer journey re-analysis triggered.');
    } catch (error) {
      console.error('Re-analysis error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-blue-500 bg-[#0a0a0a] text-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">🧭 Customer Journey Orchestration</h3>
      {loading ? (
        <div className="text-gray-400">Loading lifecycle data...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-yellow-300 font-semibold">
              Lifecycle Stage: <span className="text-white">{lifecycleStage}</span>
            </div>
            <div className="text-blue-400 font-semibold">
              Touchpoints: <span className="text-white">{touchpointCount}</span>
            </div>
            <div className="text-pink-400 font-semibold">
              Conversion Heat: <span className="text-white">{conversionHeat}</span>
            </div>
          </div>
          <button
            onClick={reanalyzeJourney}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🔁 Reanalyze Journey
          </button>
        </>
      )}
    </div>
  );
};

export default CustomerJourneyCard;


// Slack Util Function – Already defined below
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
