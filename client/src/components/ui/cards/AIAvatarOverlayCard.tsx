import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const AIAvatarOverlayCard = () => {
  const [avatarsGenerated, setAvatarsGenerated] = useState(0);
  const [successfulOverlays, setSuccessfulOverlays] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [avgRenderTime, setAvgRenderTime] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/airtable/avatar-stats');
        const data = await response.json();
        
        if (data.success && data.metrics) {
          setAvatarsGenerated(data.metrics.avatarsGenerated);
          setSuccessfulOverlays(data.metrics.successfulOverlays);
          setFailedAttempts(data.metrics.failedAttempts);
          setAvgRenderTime(data.metrics.avgRenderTime);
          setUniqueUsers(data.metrics.uniqueUsers);
        } else {
          console.warn('Avatar stats API returned no data:', data.message);
          // Keep values at 0 if no data
          setAvatarsGenerated(0);
          setSuccessfulOverlays(0);
          setFailedAttempts(0);
          setAvgRenderTime(0);
          setUniqueUsers(0);
        }
      } catch (error) {
        console.error('Error fetching avatar data:', error);
        // Fallback to 0 values on error
        setAvatarsGenerated(0);
        setSuccessfulOverlays(0);
        setFailedAttempts(0);
        setAvgRenderTime(0);
        setUniqueUsers(0);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="bg-gradient-to-b from-black to-[#0d0d0d] text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">🧑‍💼 AI Avatar Overlay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">🎭 Total Avatars Generated</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avatarsGenerated}</p>
          <Progress value={avatarsGenerated} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">✅ Successful Overlays</p>
          <p className="text-xl font-semibold text-[#00ffff]">{successfulOverlays}</p>
          <Progress value={successfulOverlays} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Failed Overlay Attempts</p>
          <p className="text-xl font-semibold text-[#00ffff]">{failedAttempts}</p>
          <Progress value={failedAttempts} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">⏱️ Average Render Time (s)</p>
          <p className="text-xl font-semibold text-[#00ffff]">{avgRenderTime.toFixed(2)} sec</p>
          <Progress value={avgRenderTime} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">👤 Unique Users</p>
          <p className="text-xl font-semibold text-[#00ffff]">{uniqueUsers}</p>
          <Progress value={uniqueUsers} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAvatarOverlayCard;
