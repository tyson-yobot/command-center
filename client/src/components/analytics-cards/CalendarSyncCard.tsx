import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export function CalendarSyncCard() {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span>Calendar Sync</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-slate-300">
          <div>Events Synced: 0</div>
          <div>Last Sync: --</div>
        </div>
      </CardContent>
    </Card>
  );
}
