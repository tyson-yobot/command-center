import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../card';

const VoicePerformanceCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>📈 VoicePerformance</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Voice pipeline uptime and latency stats.</p>
    </CardContent>
  </Card>
);
export default VoicePerformanceCard;
