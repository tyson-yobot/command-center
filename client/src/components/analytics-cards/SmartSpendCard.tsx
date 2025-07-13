import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export function SmartSpendCard() {
  return (
    <Card className="rounded-xl border-2 border-[#0d82da] bg-black shadow-[0_0_12px_#0d82da50] text-white">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-[#0d82da]" />
          <span className="bg-gradient-to-r from-[#ffffff] via-[#c3c3c3] to-[#666666] text-transparent bg-clip-text">📈 SmartSpend™ Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-center text-sm text-[#c3c3c3]">
          <div className="rounded-xl border-2 border-[#0d82da] p-4 bg-black/80 shadow-[0_0_8px_#0d82da]">
            <h4 className="uppercase tracking-wide">Monthly Savings</h4>
            <div className="text-2xl font-bold text-white">$0</div>
          </div>
          <div className="rounded-xl border-2 border-[#0d82da] p-4 bg-black/80 shadow-[0_0_8px_#0d82da]">
            <h4 className="uppercase tracking-wide">Cost Reduction</h4>
            <div className="text-2xl font-bold text-white">$0</div>
          </div>
          <div className="rounded-xl border-2 border-[#0d82da] p-4 bg-black/80 shadow-[0_0_8px_#0d82da]">
            <h4 className="uppercase tracking-wide">ROI</h4>
            <div className="text-2xl font-bold text-white">0%</div>
          </div>
          <div className="rounded-xl border-2 border-[#0d82da] p-4 bg-black/80 shadow-[0_0_8px_#0d82da]">
            <h4 className="uppercase tracking-wide">Payback Days</h4>
            <div className="text-2xl font-bold text-white">0</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
