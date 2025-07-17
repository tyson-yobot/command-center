import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff } from 'lucide-react';

import { LiveCallBanner } from './components/LiveCallBanner';
import { VoiceCommandInterface } from './components/VoiceCommandInterface';
import { CallMonitoringPopup } from './components/CallMonitoringPopup';

const AnimatedCounter = ({ value, label }: { value: number; label: string }) => {
  const [display, setDisplay] = useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / (end - start)));
    const timer = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start === end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{display}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
};

const CommandCenter = () => {
  const [micEnabled, setMicEnabled] = useState(true);
  const toggleMic = () => setMicEnabled((prev) => !prev);

  return (
    <div className="p-6 space-y-6">
      <LiveCallBanner />
      <CallMonitoringPopup />
      <VoiceCommandInterface micEnabled={micEnabled} toggleMic={toggleMic} />

      <Card>
        <CardHeader>
          <CardTitle>Sales Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <AnimatedCounter value={12} label="Deals Closed" />
          <AnimatedCounter value={7} label="Follow-ups Scheduled" />
          <AnimatedCounter value={34} label="Leads Contacted" />
          <AnimatedCounter value={4} label="Voice Calls Today" />
        </CardContent>
      </Card>

      <Progress value={micEnabled ? 75 : 25} />
    </div>
  );
};

export default CommandCenter;
