// Data Integration Hub Card – Full Implementation

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataIntegrationHubCard = () => {
  const [connectedSystems, setConnectedSystems] = useState([]);
  const [syncStatus, setSyncStatus] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      try {
        const res = await axios.get('/api/airtable/data-integration-status');
        const data = res.data;

        setConnectedSystems(data['🔗 Connected Systems'] || []);
        setSyncStatus(data['✅ Sync Status'] || 'Unknown');
        setLastSyncTime(data['🕒 Last Sync Time'] || 'Not Recorded');

        if (data['✅ Sync Status'] === 'Error') {
          await postToSlack('🚨 Data integration sync error detected in Data Integration Hub.');
        }
      } catch (err) {
        console.error('Integration hub fetch error:', err);
        await postToSlack(`❗ Failed to fetch integration data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrationStatus();
  }, []);

  const triggerSystemSync = async () => {
    try {
      await axios.post('/api/airtable/trigger-data-sync');
      await postToSlack('🔄 Manual sync triggered from Data Integration Hub.');
    } catch (error) {
      console.error('Sync trigger error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-blue-500 bg-[#0a0a0a] text-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">🔌 Data Integration Hub</h3>
      {loading ? (
        <div className="text-gray-400">Checking system integrations...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-green-400 font-semibold">
              Connected Systems:
              <ul className="list-disc ml-6 text-white">
                {connectedSystems.map((sys, index) => (
                  <li key={index}>{sys}</li>
                ))}
              </ul>
            </div>
            <div className="text-yellow-300 font-semibold">
              Sync Status: <span className="text-white">{syncStatus}</span>
            </div>
            <div className="text-pink-400 font-semibold">
              Last Sync Time: <span className="text-white">{lastSyncTime}</span>
            </div>
          </div>
          <button
            onClick={triggerSystemSync}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🔄 Trigger Sync
          </button>
        </>
      )}
    </div>
  );
};

export default DataIntegrationHubCard;


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
