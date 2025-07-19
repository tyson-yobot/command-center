// Smart Quoting Engine Card – Full Implementation

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SmartQuotingCard = () => {
  const [quote, setQuote] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await axios.get('/api/airtable/smart-quote');
        const data = res.data;

        setQuote(data['🧾 Latest Quote'] || 'No quote available');
        setLastUpdated(data['🕒 Last Updated'] || 'N/A');
      } catch (err) {
        console.error('Smart quote fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        await postToSlack(`❗ Smart Quoting fetch failed: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  const generateNewQuote = async () => {
    try {
      const res = await axios.post('/api/airtable/generate-smart-quote');
      const data = res.data;
      setQuote(data['🧾 Latest Quote'] || '');
      setLastUpdated(data['🕒 Last Updated'] || '');
      await postToSlack('📄 New Smart Quote generated.');
    } catch (error) {
      console.error('Quote generation error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-yellow-400 bg-[#0a0a0a] text-white rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4">📄 Smart Quoting Engine</h3>
      {loading ? (
        <div className="text-gray-400">Loading smart quote...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-white text-base bg-[#111] p-3 rounded-lg border border-gray-700">
              {quote}
            </div>
            <div className="text-gray-400 text-sm italic">
              Last Updated: {lastUpdated}
            </div>
          </div>
          <button
            onClick={generateNewQuote}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🧠 Generate New Quote
          </button>
        </>
      )}
    </div>
  );
};

export default SmartQuotingCard;


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
