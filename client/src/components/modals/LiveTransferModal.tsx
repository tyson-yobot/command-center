import React, { useState } from 'react';

interface LiveTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveTransferModal: React.FC<LiveTransferModalProps> = ({ isOpen, onClose }) => {
  const [targetNumber, setTargetNumber] = useState('');
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    try {
      const response = await fetch('/api/live-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: targetNumber }),
      });

      if (!response.ok) throw new Error('Transfer failed');

      setStatus('✅ Transfer initiated');
    } catch (err) {
      setStatus('❌ Transfer failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      await fetch('https://hooks.slack.com/services/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', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `🚨 Live Transfer Error: ${errorMessage}` }),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white text-black p-8 rounded-2xl w-full max-w-lg shadow-2xl border-[6px] border-blue-500">
        <h2 className="text-xl font-bold mb-4">🔄 Live Call Transfer</h2>
        <input
          className="w-full p-2 border-2 border-blue-400 rounded-lg mb-4"
          placeholder="Enter number to transfer to"
          value={targetNumber}
          onChange={(e) => setTargetNumber(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Transfer Call
          </button>
        </div>
        {status && <p className="mt-4 text-center">{status}</p>}
      </div>
    </div>
  );
};

export default LiveTransferModal;
