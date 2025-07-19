// Conversational Intelligence Card Full Implementation

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { postToSlack } from '@/utils/slack';

const ConversationalInsightsCard = () => {
  const [dropRate, setDropRate] = useState(0);
  const [commonObjection, setCommonObjection] = useState('');
  const [positiveCloseRate, setPositiveCloseRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get('/api/airtable/convo-insights');
        const data = res.data;

        setDropRate(data['🚫 Drop-Off Rate'] || 0);
        setCommonObjection(data['❓ Top Objection'] || 'N/A');
        setPositiveCloseRate(data['✅ Positive Close Rate'] || 0);

        if (data['🚫 Drop-Off Rate'] > 60) {
          await postToSlack(`❗ High drop-off rate detected: ${data['🚫 Drop-Off Rate']}%`);
        }
      } catch (err) {
        console.error('Conversation insight error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        await postToSlack(`❗ Failed to load conversation insights: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const triggerAnalysis = async () => {
    try {
      await axios.post('/api/airtable/analyze-conversations');
      await postToSlack('🧠 Conversational Intelligence analysis triggered from Command Center.');
    } catch (error) {
      console.error('Trigger analysis error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-blue-500 bg-[#0d0d0d] text-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">🧠 Conversational Insights</h3>
      {loading ? (
        <div className="text-gray-400">Analyzing conversations...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-orange-400 font-semibold">
              Drop-Off Rate: <span className="text-white">{dropRate}%</span>
            </div>
            <div className="text-purple-400 font-semibold">
              Top Objection: <span className="text-white">{commonObjection}</span>
            </div>
            <div className="text-lime-400 font-semibold">
              Close Success Rate: <span className="text-white">{positiveCloseRate}%</span>
            </div>
          </div>
          <button
            onClick={triggerAnalysis}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🧪 Re-Analyze Conversations
          </button>
        </>
      )}
    </div>
  );
};

export default ConversationalInsightsCard;
