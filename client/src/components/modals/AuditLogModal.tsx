import React, { useEffect, useState } from 'react';
import '@/styles/Modal.css';
import { fetchAuditLog } from '@/utils/function_library';

export default function AuditLogModal({ onClose }: { onClose: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      const result = await fetchAuditLog();
      setLogs(result || []);
    };
    loadLogs();
  }, []);

  return (
    <div className="modal-wrapper">
      <div className="modal-content">
        <h2>🧾 System Activity Log</h2>
        <ul className="log-list">
          {logs.map((log, idx) => (
            <li key={idx}>{log.timestamp} — {log.event}</li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
