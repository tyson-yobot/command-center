import React from 'react';

interface CallMonitoringPopupProps {
  isOpen: boolean;
  onClose: () => void;
  activeCalls: any;
  totalRecords: any;
  completedCalls: any;
}

export function CallMonitoringPopup({ isOpen, onClose, activeCalls, totalRecords, completedCalls }: CallMonitoringPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">Call Monitoring</h3>
          <button onClick={onClose} className="text-white hover:text-gray-300">✕</button>
        </div>
        <div className="space-y-4 text-white">
          <div>Active Calls: {activeCalls || 0}</div>
          <div>Total Records: {totalRecords || 0}</div>
          <div>Completed Calls: {completedCalls || 0}</div>
        </div>
      </div>
    </div>
  );
}