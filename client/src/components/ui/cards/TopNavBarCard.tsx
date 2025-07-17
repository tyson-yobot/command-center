import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TopNavBarCard = () => {
  return (
    <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] p-2 border-b-[3px] border-[#00FFFF] shadow-md text-white rounded-none sticky top-0 z-50">
      <CardContent className="flex flex-row justify-between items-center">
        <div className="text-lg font-bold text-white">🚀 YoBot® Command Center</div>
        <div className="flex space-x-2">
          <Button className="bg-[#0d82da] text-white border border-silver bg-gradient-to-br from-[#0d82da] to-[#3fbfff] hover:shadow-lg hover:shadow-cyan-400/50 font-semibold px-4 py-2 rounded-xl">🏠 Dashboard</Button>
          <Button className="bg-[#0d82da] text-white border border-silver bg-gradient-to-br from-[#0d82da] to-[#3fbfff] hover:shadow-lg hover:shadow-cyan-400/50 font-semibold px-4 py-2 rounded-xl">🛠️ Voice Studio</Button>
          <Button className="bg-[#0d82da] text-white border border-silver bg-gradient-to-br from-[#0d82da] to-[#3fbfff] hover:shadow-lg hover:shadow-cyan-400/50 font-semibold px-4 py-2 rounded-xl">📁 Projects</Button>
          <Button className="bg-[#0d82da] text-white border border-silver bg-gradient-to-br from-[#0d82da] to-[#3fbfff] hover:shadow-lg hover:shadow-cyan-400/50 font-semibold px-4 py-2 rounded-xl">🧾 Quotes</Button>
          <Button className="bg-[#0d82da] text-white border border-silver bg-gradient-to-br from-[#0d82da] to-[#3fbfff] hover:shadow-lg hover:shadow-cyan-400/50 font-semibold px-4 py-2 rounded-xl">📞 Support</Button>
          <Button className="bg-[#0d82da] text-white border border-silver bg-gradient-to-br from-[#0d82da] to-[#3fbfff] hover:shadow-lg hover:shadow-cyan-400/50 font-semibold px-4 py-2 rounded-xl">🧠 RAG Center</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopNavBarCard;
