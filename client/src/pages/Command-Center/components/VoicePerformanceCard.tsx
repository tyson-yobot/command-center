import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface VoicePerformanceFields {
  callsToday: number;
  avgDuration: string;
  successRate: number;
  conversionRate: number;
}

interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
}

export function VoicePerformanceCard() {
  const { data } = useQuery({
    queryKey: ['/api/voice-performance'],
    queryFn: async () => {
      const response = await axios.get<AirtableResponse<VoicePerformanceFields>>('/api/voice-performance');
      return response.data.records;
    },
    refetchInterval: 60000,
  });

  const metrics = data?.[0]?.fields;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 min-h-[200px]">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Mic className="w-5 h-5 text-cyan-400" />
          <span>Voice Analytics & Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-[18px] text-center">
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
            <div>
              <div className="text-2xl font-black text-green-400 mb-1">{metrics?.callsToday ?? 0}</div>
              <div className="text-slate-300 text-sm">Total Calls Today</div>
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
            <div>
              <div className="text-2xl font-black text-blue-400 mb-1">{metrics?.avgDuration ?? '0:00'}</div>
              <div className="text-slate-300 text-sm">Avg Call Duration</div>
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
            <div>
              <div className="text-2xl font-black text-purple-400 mb-1">{metrics?.successRate ?? 0}%</div>
              <div className="text-slate-300 text-sm">Success Rate</div>
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 h-32 flex flex-col justify-center">
            <div>
              <div className="text-2xl font-black text-cyan-400 mb-1">{metrics?.conversionRate ?? 0}%</div>
              <div className="text-slate-300 text-sm">Conversion Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
