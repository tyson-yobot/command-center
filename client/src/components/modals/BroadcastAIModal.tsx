import { useState } from 'react';

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblBroadcastQueue';
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_KEY;

export default function BroadcastAIModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [platform, setPlatform] = useState('email');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const sendBroadcast = async () => {
    setStatus('sending');
    try {
      const airtableRes = await fetch(AIRTABLE_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Message: message,
                Platform: platform,
                Status: 'Queued',
              },
            },
          ],
        }),
      });

      if (!airtableRes.ok) throw new Error(`Airtable Error: ${airtableRes.status}`);

      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `📢 Broadcast sent via ${platform}` }),
      });

      setStatus('sent');
      setMessage('');
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-xl border-4 border-blue-500 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">📢 AI Broadcast Tool</h2>
        <label className="block text-sm mb-1">Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 mb-3"
        >
          <option value="email">📧 Email</option>
          <option value="sms">📱 SMS</option>
          <option value="slack">💬 Slack</option>
        </select>

        <label className="block text-sm mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 mb-4"
        />

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={sendBroadcast}
            disabled={status === 'sending'}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          >
            {status === 'sending' ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}
