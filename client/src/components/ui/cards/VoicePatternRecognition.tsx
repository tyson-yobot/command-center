// Voice Pattern Recognition Card – Full Implementation

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { postToSlack } from '@/utils/slack';

const VoicePatternCard = () => {
  const [emotionDetected, setEmotionDetected] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [hesitationRate, setHesitationRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoiceMetrics = async () => {
      try {
        const res = await axios.get('/api/airtable/voice-pattern');
        const data = res.data;

        setEmotionDetected(data['🎭 Dominant Emotion'] || 'Neutral');
        setUrgencyLevel(data['⚡ Urgency Level'] || 'Low');
        setHesitationRate(data['⏸️ Hesitation Rate'] || 0);

        if (data['⚡ Urgency Level'] === 'High' || data['🎭 Dominant Emotion'] === 'Frustrated') {
          await postToSlack(`🔊 Alert: Elevated urgency or frustration detected in voice patterns.`);
        }
      } catch (err) {
        console.error('Voice pattern fetch error:', err);
        await postToSlack(`❗ Voice pattern analysis failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVoiceMetrics();
  }, []);

  const reprocessVoiceLogs = async () => {
    try {
      await axios.post('/api/airtable/reprocess-voice-patterns');
      await postToSlack('🎤 Voice pattern re-analysis triggered manually.');
    } catch (error) {
      console.error('Re-analysis error:', error);
    }
  };

  return (
    <div className="yobot-card border-[4px] border-blue-500 bg-[#0a0a0a] text-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">🎤 Voice Pattern Recognition</h3>
      {loading ? (
        <div className="text-gray-400">Analyzing voice logs...</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-pink-500 font-semibold">
              Emotion Detected: <span className="text-white">{emotionDetected}</span>
            </div>
            <div className="text-yellow-400 font-semibold">
              Urgency Level: <span className="text-white">{urgencyLevel}</span>
            </div>
            <div className="text-orange-400 font-semibold">
              Hesitation Rate: <span className="text-white">{hesitationRate}%</span>
            </div>
          </div>
          <button
            onClick={reprocessVoiceLogs}
            className="btn-blue mt-4 px-4 py-2 rounded-lg hover:shadow-xl hover:scale-105 transition"
          >
            🔁 Reprocess Voice Logs
          </button>
        </>
      )}
    </div>
  );
};

export default VoicePatternCard;


// Slack Util Function – Already defined below
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

export const postToSlack = async (message: string): Promise<void> => {
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❗ Slack webhook failed:', error);
  }
};
