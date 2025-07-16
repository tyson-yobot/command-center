import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export function RepScorecardCard() {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <User className="w-5 h-5 text-purple-400" />
          <span>Rep Scorecard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-slate-300">
          <div>Calls Handled: 0</div>
          <div>Avg Rating: --</div>
        </div>
      </CardContent>
    </Card>
  );
}
