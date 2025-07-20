// CRMHealthCheckCard.tsx
import React, { useEffect, useState } from 'react';

const BASE_ID = 'appRt8V3tH4g5Z5if';
const TABLE_ID = 'tblCRMHealth';
const CARD_ID = 'CRMHealthCheckCard';

const CRMHealthCheckCard = () => {
  const [health, setHealth] = useState<'🟢 Healthy' | '🟡 Stale' | '🔴 Failed'>('🟡 Stale');
  const [lastCheck, setLastCheck] = useState('');

  const fetchHealthStatus = async () => {
    try {
      const res = await fetch(`/api/airtable/${BASE_ID}/${TABLE_ID}`);
      const json = await res.json();
      const record = json.records?.[0];
      const status = record?.fields?.['CRM Sync Status'] || 'Unknown';
      const timestamp = record?.fields?.['Last Check Timestamp'] || '';

      setLastCheck(timestamp);
      setHealth(status);

      if (json.error) throw new Error(json.error);
    } catch (error) {
      setHealth('🔴 Failed');
      await fetch("https://hooks.slack.com/services/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", {
        method: "POST",
        body: JSON.stringify({ text: `🔴 ${CARD_ID} sync error: ${error.message}` }),
        headers: { "Content-Type": "application/json" },
      });
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  return (
    <div className="bg-gradient-to-br from-black to-gray-800 border border-blue-400 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white text-xl font-bold mb-2">📡 CRM Health Check</h3>
      <p className="text-sm text-gray-300 mb-1">Health: {health}</p>
      <p className="text-sm text-gray-400">Last Checked: {lastCheck || '—'}</p>
      <button
        onClick={fetchHealthStatus}
        className="mt-4 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow"
      >
        🔁 Recheck CRM
      </button>
    </div>
  );
};

export default CRMHealthCheckCard;
