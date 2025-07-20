// PersonaTrainerCard.tsx – Full Automation Production Code

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCcw, Brain } from 'lucide-react';

const BASE_ID = 'appRt8V3tH4g5Z5if';
const TABLE_ID = 'tblPersonaTrainer123';
const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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';

const PersonaTrainerCard = () => {
  const [personas, setPersonas] = useState([]);
  const [freshness, setFreshness] = useState('🟡');

  const fetchPersonas = async () => {
    try {
      const response = await fetch(`/api/persona-trainer?baseId=${BASE_ID}&tableId=${TABLE_ID}`);
      const data = await response.json();
      setPersonas(data.records);
      setFreshness('🟢');
    } catch (error) {
      setFreshness('🔴');
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `🔴 Persona Trainer fetch failed: ${error.message}` })
      });
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border border-blue-600 shadow-xl p-4 rounded-2xl">
      <CardContent>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">🧠 Persona Trainer {freshness}</h3>
          <button className="text-blue-300 hover:text-white" onClick={fetchPersonas}>
            <RefreshCcw size={18} />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {personas.map((record) => (
            <div
              key={record.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-gray-200"
            >
              <strong>{record.fields.Name}</strong>: {record.fields.Notes || '—'}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaTrainerCard;
