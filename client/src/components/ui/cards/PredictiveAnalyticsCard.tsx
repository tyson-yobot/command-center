// Predictive Analytics Card Full Implementation

// ✅ Imports
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { postToSlack } from '@/utils/slack';

const PredictiveAnalyticsCard = () => {
  const [forecastScore, setForecastScore] = useState(0);
  const [opportunityRate, setOpportunityRate] = useState(0);
  const [projectedMRR, setProjectedMRR] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await axios.get('/api/airtable/forecast');
        const data = res.data;

        setForecastScore(data['📈 Forecast Score'] || 0);
        setOpportunityRate(data['🔥 Lead Opportunity %'] || 0);
        setProjectedMRR(data['💰 Projected MRR'] || 0);

        // Slack alert logic
        if (data['🔥 Lead Opportunity %'] > 70) {
          await postToSlack(`🔥 High opportunity rate detected: ${data['🔥 Lead Opportunity %']}%`);
        }
      } catch (err) {
        console.error('Forecast error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        await postToSlack(`❗ Failed to load forecast data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  const runForecast = async () => {
    try {
      await axios.post('/api/airtable/run-forecast');
      await postToSlack('📊 Forecast manually triggered via Command Center.');
    } catch (error) {
      console.error('Trigger forecast error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-blue-500 bg-[#0d0d0d] text-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">📈 Predictive Analytics</h3>

      {loading ? (
        <div className="text-gray-400">Loading predictions...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-lime-400 text-md font-semibold">
              Forecast Score: <span className="text-white">{forecastScore}/100</span>
            </div>
            <div className="text-pink-400 text-md font-semibold">
              Opportunity Rate: <span className="text-white">{opportunityRate}%</span>
            </div>
            <div className="text-yellow-300 text-md font-semibold">
              Projected MRR: <span className="text-white">${projectedMRR}</span>
            </div>
          </div>
          <button
            onClick={runForecast}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🔄 Run Forecast
          </button>
        </>
      )}
    </div>
  );
};

export default PredictiveAnalyticsCard;
