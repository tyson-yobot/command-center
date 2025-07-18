// Competitor Intelligence Radar – Full Implementation

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompetitorRadarCard = () => {
  const [competitorAlert, setCompetitorAlert] = useState('');
  const [adActivity, setAdActivity] = useState('');
  const [keywordChanges, setKeywordChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        const res = await axios.get('/api/airtable/competitor-radar');
        const data = res.data;

        setCompetitorAlert(data['🚨 Competitor Alert'] || 'None');
        setAdActivity(data['📢 Ad Activity'] || 'Stable');
        setKeywordChanges(data['🔑 Keyword Changes'] || []);

        if (data['🚨 Competitor Alert'] === 'Yes') {
          await postToSlack(`🧠 Competitive Intelligence Alert: New competitor activity or pricing change detected.`);
        }
      } catch (err) {
        console.error('Competitor radar error:', err);
        await postToSlack(`❗ Competitor radar fetch failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRadarData();
  }, []);

  const triggerRadarScan = async () => {
    try {
      await axios.post('/api/airtable/scan-competitors');
      await postToSlack('📡 Competitor radar scan triggered from Command Center.');
    } catch (error) {
      console.error('Radar trigger error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-blue-500 bg-[#0a0a0a] text-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">📡 Competitive Intelligence Radar</h3>
      {loading ? (
        <div className="text-gray-400">Scanning competitor activity...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-red-400 font-semibold">
              Competitor Alert: <span className="text-white">{competitorAlert}</span>
            </div>
            <div className="text-yellow-300 font-semibold">
              Ad Activity: <span className="text-white">{adActivity}</span>
            </div>
            <div className="text-lime-400 font-semibold">
              Keyword Changes:
              <ul className="list-disc ml-6 text-white">
                {keywordChanges.map((kw, index) => (
                  <li key={index}>{kw}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={triggerRadarScan}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🔍 Trigger Radar Scan
          </button>
        </>
      )}
    </div>
  );
};

export default CompetitorRadarCard;


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
