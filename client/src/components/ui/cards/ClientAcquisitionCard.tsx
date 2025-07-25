// ✅ CLIENT ACQUISITION CARD — PRODUCTION READY
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const ClientAcquisitionCard = () => {
  const [data, setData] = useState({
    newLeads: 0,
    qualified: 0,
    costPerLead: 0,
    acquisitionRate: 0,
    freshness: '🟡'
  });

  useEffect(() => {
    const fetchClientAcquisition = async () => {
      try {
        const response = await axios.get('/api/client-acquisition');
        const records = response.data.records || [];

        const newLeads = records.length;
        const qualified = records.filter((r: any) => r.fields?.['✅ Qualified']).length;
        const totalCost = records.reduce((sum: number, r: any) => sum + (parseFloat(r.fields?.['💸 Lead Cost']) || 0), 0);

        const costPerLead = newLeads > 0 ? totalCost / newLeads : 0;
        const acquisitionRate = newLeads > 0 ? (qualified / newLeads) * 100 : 0;

        setData({
          newLeads,
          qualified,
          costPerLead,
          acquisitionRate,
          freshness: '🟢'
        });
      } catch (err) {
        console.error('Client Acquisition Fetch Error', err);
        setData(prev => ({ ...prev, freshness: '🔴' }));
      }
    };

    fetchClientAcquisition();
  }, []);

  return (
    <div className="rounded-xl border-4 border-green-500 p-4 bg-gradient-to-br from-green-900 to-green-600 shadow-xl text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">🧲 Client Acquisition</h2>
        <span className="text-2xl">{data.freshness}</span>
      </div>
      <ul className="mt-3 space-y-1">
        <li><strong>New Leads:</strong> {data.newLeads}</li>
        <li><strong>Qualified:</strong> {data.qualified}</li>
        <li><strong>Cost per Lead:</strong> ${data.costPerLead.toFixed(2)}</li>
        <li><strong>Acquisition Rate:</strong> {data.acquisitionRate.toFixed(1)}%</li>
      </ul>
    </div>
  );
};

// ✅ BACKEND ROUTE TO SUPPORT ABOVE FRONTEND
// Place this inside: server/modules/command-center/commandCenterMetrics.ts

/*
import express from 'express';
import { base } from '../airtable/airtable';

const router = express.Router();

router.get('/api/client-acquisition', async (req, res) => {
  try {
    const records = await base('tblF5z7u4Cq1Clients').select({}).firstPage();
    res.json({ records });
  } catch (err) {
    console.error('Error fetching client acquisition data:', err);
    res.status(500).json({ error: 'Airtable fetch failed' });
  }
});

export default router;
*/
