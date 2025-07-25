import { useState } from 'react';

export default function ManualDialerModal({ onClose }: { onClose: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [status, setStatus] = useState<'idle' | 'calling' | 'logged'>('idle');
  const [error, setError] = useState('');

  const handleDial = async () => {
    if (!/^[0-9\-\+\s\(\)]+$/.test(phoneNumber)) {
      alert('Please enter a valid phone number.');
      return;
    }

    const confirmDial = window.confirm(`Confirm call to ${phoneNumber}?`);
    if (!confirmDial) return;

    setStatus('calling');
    setError('');

    try {
      const response = await fetch('/api/manual-dialer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, notes, outcome })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unknown error');
      }

      // Optional: Slack webhook mirror (backend should ideally do this)
      await fetch('https://hooks.slack.com/services/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', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📞 Manual call made to *${phoneNumber}*\n📝 Notes: _${notes}_\n📊 Outcome: ${outcome || 'N/A'}`
        })
      });

      setStatus('logged');
      setTimeout(() => {
        setPhoneNumber('');
        setNotes('');
        setOutcome('');
        setStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Manual dial error:', err);
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Optional: Slack error alert
      await fetch('https://hooks.slack.com/services/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', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `❌ Manual dial failed for ${phoneNumber}: ${err instanceof Error ? err.message : 'Unknown error'}`
        })
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-lg border border-blue-400 shadow-2xl">
        <h2 className="text-xl text-white font-bold mb-4">📞 Manual Dialer</h2>

        <input
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full mb-4 p-2 rounded text-black"
        />

        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="w-full mb-4 p-2 rounded text-black"
        >
          <option value="">Select call outcome</option>
          <option value="Answered">✅ Answered</option>
          <option value="No Answer">⏰ No Answer</option>
          <option value="Voicemail">📬 Voicemail</option>
          <option value="Wrong Number">❌ Wrong Number</option>
        </select>

        <textarea
          placeholder="Call notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full mb-4 p-2 rounded text-black"
        />

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDial}
            disabled={status === 'calling'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {status === 'calling' ? 'Dialing...' : 'Dial Now'}
          </button>
        </div>

        {status === 'logged' && <p className="text-green-400 mt-4">✅ Call logged successfully.</p>}
        {error && <p className="text-red-400 mt-4">❌ {error}</p>}
      </div>
    </div>
  );
}
