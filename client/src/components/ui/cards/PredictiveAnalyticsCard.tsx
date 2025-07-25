import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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';

interface ForecastResponse {
  labels: string[];
  data: number[];
}

export default function PredictiveAnalyticsCard() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/predictive-forecast')
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const result = await res.json();
        setForecast(result);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Predictive Analytics fetch error:', message);
        setError(message);
        // Slack fallback
        fetch(SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🔴 Predictive Analytics fetch failed: ${message}`,
          }),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-white">Loading forecast...</div>;
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>;
  if (!forecast) return null;

  const chartData = {
    labels: forecast.labels,
    datasets: [
      {
        label: 'Revenue Forecast ($)',
        data: forecast.data,
        fill: true,
        borderColor: '#0d82da',
        backgroundColor: 'rgba(13,130,218,0.3)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '📉 Predictive Revenue Forecast',
        color: 'white',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
      },
    },
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a] border-4 border-blue-500">
      <h2 className="text-xl font-bold mb-4 text-white">🧠 Predictive Analytics</h2>
      <Line data={chartData} options={options} />
    </div>
  );
}
