// 📦 PersonalityPackCard.tsx
import { useEffect, useState } from 'react';

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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';

interface Pack {
  name: string;
  tone: string;
  keywords: string;
}

export function PersonalityPackCard() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/personality-packs/appRt8V3tH4g5Z5if/tblPersonalityPacks')
      .then(res => res.json())
      .then(setPacks)
      .catch(err => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        fetch(SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🔴 Personality Pack fetch failed: ${message}`,
          }),
        });
      });
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a] border-4 border-blue-500 rounded-2xl">
      <h2 className="text-xl font-bold mb-4 text-white">🧠 Personality Packs</h2>
      {error && <p className="text-red-400">Error: {error}</p>}
      {!error && (
        <ul className="space-y-2">
          {packs.map((p, idx) => (
            <li key={idx} className="p-4 bg-black bg-opacity-30 rounded-xl text-white">
              <strong>{p.name}</strong> <br />
              <span className="text-sm text-gray-400">Tone: {p.tone}</span><br />
              <span className="text-sm text-gray-400">Keywords: {p.keywords}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
