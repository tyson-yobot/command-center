// AlertCenterCard.tsx
import React, { useEffect, useState } from 'react';

const AIRTABLE_BASE_ID = 'appRt8V3tH4g5Z5if';
const TABLE_ID = 'tblAlertSync001';
const CARD_ID = 'AlertCenterCard';

const AlertCenterCard = () => {
  const [status, setStatus] = useState<'🔴' | '🟡' | '🟢'>('🟡');
  const [message, setMessage] = useState('Loading alert data...');

  const fetchAlertData = async () => {
    try {
      const res = await fetch(`/api/airtable/${AIRTABLE_BASE_ID}/${TABLE_ID}`);
      const json = await res.json();

      if (!json.records || json.records.length === 0) {
        setStatus('🔴');
        setMessage('No alert data found');
      } else {
        setStatus('🟢');
        setMessage('System alerts are active and being tracked');
      }

      if (json.error) throw new Error(json.error);
    } catch (error) {
      setStatus('🔴');
      setMessage('Alert sync failed');

      await fetch("https://hooks.slack.com/services/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", {
        method: "POST",
        body: JSON.stringify({
          text: `🔴 ${CARD_ID} failed to sync: ${error.message}`,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }
  };

  useEffect(() => {
    fetchAlertData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-600 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white text-xl font-bold mb-2">🚨 Alert Center</h3>
      <p className="text-sm text-gray-300">Status: <span>{status}</span></p>
      <p className="text-sm text-gray-400 mt-1">{message}</p>
      <button
        onClick={fetchAlertData}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
      >
        🔁 Refresh Alerts
      </button>
    </div>
  );
};

export default AlertCenterCard;
