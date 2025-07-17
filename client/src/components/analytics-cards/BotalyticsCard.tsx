import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function BotalyticsCard() {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <span>📊 Botalytics™ Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-[18px] text-slate-300 text-sm">
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 text-center">
            <div className="text-2xl font-black text-green-400 mb-1">0</div>
            <div>Cost Per Lead</div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 text-center">
            <div className="text-2xl font-black text-blue-400 mb-1">0%</div>
            <div>Accuracy Rate</div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 text-center">
            <div className="text-2xl font-black text-purple-400 mb-1">0%</div>
            <div>Learning Rate</div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 text-center">
            <div className="text-2xl font-black text-cyan-400 mb-1">0</div>
            <div>Interactions</div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600 text-center">
            <div className="text-2xl font-black text-emerald-400 mb-1">0%</div>
            <div>Close Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
