// BotAuditCard.tsx
import React, { useEffect, useState } from 'react';

const AIRTABLE_BASE_ID = 'appRt8V3tH4g5Z5if';
const TABLE_ID = 'tblBotAudit';
const CARD_ID = 'BotAuditCard';

const BotAuditCard = () => {
  const [lastAudit, setLastAudit] = useState('');
  const [status, setStatus] = useState<'🔴' | '🟡' | '🟢'>('🟡');

  const fetchAuditData = async () => {
    try {
      const res = await fetch(`/api/airtable/${AIRTABLE_BASE_ID}/${TABLE_ID}`);
      const json = await res.json();

      const recent = json.records?.[0]?.fields?.['🕒 Last Audit Timestamp'];

      if (recent) {
        setLastAudit(recent);
        setStatus('🟢');
      } else {
        setStatus('🔴');
      }

      if (json.error) throw new Error(json.error);
    } catch (error) {
      setStatus('🔴');

      await fetch("https://hooks.slack.com/services/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", {
        method: "POST",
        body: JSON.stringify({
          text: `🔴 ${CARD_ID} sync error: ${error.message}`,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-black to-gray-800 border border-blue-500 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white text-xl font-bold mb-2">📋 Bot Audit Log</h3>
      <p className="text-sm text-gray-300 mb-1">Status: {status}</p>
      <p className="text-sm text-gray-400">Last Audit: {lastAudit || 'Unavailable'}</p>
      <button
        onClick={fetchAuditData}
        className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow"
      >
        🔁 Refresh Audit
      </button>
    </div>
  );
};

export default BotAuditCard;
