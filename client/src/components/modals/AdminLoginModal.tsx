// File: client/src/components/modals/AdminLoginModal.tsx

import React, { useState } from 'react';
import '@/styles/Modal.css';

export default function AdminLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === import.meta.env.VITE_ADMIN_PASS) {
      onSuccess();
    } else {
      setError('Access Denied');
    }
  };

  return (
    <div className="modal-wrapper">
      <div className="modal-content">
        <h2>🔐 Admin Login</h2>
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleLogin}>Login</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
