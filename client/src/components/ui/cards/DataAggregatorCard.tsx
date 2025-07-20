// DataAggregatorCard.tsx

import React, { useEffect, useState } from 'react';

const BASE_ID = 'appRt8V3tH4g5Z5if';
const TABLE_ID = 'tblDataAggregator123';
const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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';

const DataAggregatorCard = () => {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      setStatus('loading');
      try {
        const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_KEY}`,
          },
        });

        const json = await res.json();

        if (!res.ok || json.error) {
          throw new Error(json.error?.message || 'Unknown error');
        }

        setRecords(json.records);
        setStatus('success');

        await fetch(SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🟢 DataAggregatorCard successfully synced ${json.records.length} records from Airtable.`,
          }),
        });
      } catch (err) {
        setStatus('error');
        await fetch(SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🔴 DataAggregatorCard failed to sync: ${err?.message}`,
          }),
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="rounded-2xl border border-blue-500 bg-gradient-to-br from-black to-gray-900 p-6 text-white shadow-xl">
      <div className="mb-2 text-xl font-bold">📊 Data Aggregator</div>
      <div className="mb-4 text-sm text-gray-400">
        Live pull from Airtable → Slack on fail/success
      </div>

      {status === 'loading' && <p className="text-yellow-400">Loading records...</p>}
      {status === 'error' && <p className="text-red-500">Failed to fetch data.</p>}
      {status === 'success' && (
        <div className="space-y-1 max-h-64 overflow-y-auto text-sm">
          {records.map((r) => (
            <div key={r.id} className="border-b border-gray-700 pb-1">
              {JSON.stringify(r.fields)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataAggregatorCard;
