import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';

export function ABTestCard() {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-emerald-400" />
          <span>A/B Testing</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-slate-300">
          <div>Active Tests: 0</div>
          <div>Winning Variant: N/A</div>
        </div>
      </CardContent>
    </Card>
  );
}
