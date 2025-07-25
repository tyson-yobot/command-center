// 📊 ROITrackingCard.tsx
import { useEffect, useState } from 'react';

interface ROIRecord {
  leads: number;
  revenue: number;
  botCost: number;
  breakEven: number;
  trend30Days: string;
}

export function ROITrackingCard() {
  const [roi, setRoi] = useState<ROIRecord | null>(null);

  useEffect(() => {
    fetch('/api/ 📈 Botalytics - ROI Tracker/appbFDTqB2WtRNV1H/tblt0WJwiw9q9NJoo')
      .then(res => res.json())
      .then(setRoi)
      .catch(err => console.error('ROI fetch error:', err));
  }, []);

  const roiPercent = roi ? (((roi.revenue - roi.botCost) / roi.botCost) * 100).toFixed(1) : '...';

  return (
    <div className="p-6 bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a] border-4 border-yellow-500 rounded-2xl">
      <h2 className="text-xl font-bold mb-2 text-white">📈 ROI Tracker</h2>
      {roi ? (
        <>
          <p className="text-white">Leads: {roi.leads}</p>
          <p className="text-white">Revenue: ${roi.revenue.toLocaleString()}</p>
          <p className="text-white">Bot Cost: ${roi.botCost.toLocaleString()}</p>
          <p className="text-white">Break-Even: ${roi.breakEven.toLocaleString()}</p>
          <p className="text-white">30-Day Trend: {roi.trend30Days}</p>
          <p className="text-green-400 font-bold text-xl mt-2">ROI: {roiPercent}%</p>
        </>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}
    </div>
  );
}
