import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickActionCardProps {
  label: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ label, onClick }) => {
  return (
    <Card 
      className="bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-[#0d82da] rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:border-[#66ccff] hover:scale-105 group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d82da] to-[#66ccff] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" />
      
      {/* Subtle animated border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-[#0d82da] to-[#66ccff] opacity-0 group-hover:opacity-50 transition-opacity duration-300" style={{
        background: 'linear-gradient(90deg, transparent, rgba(13, 130, 218, 0.3), transparent)',
        animation: 'borderGlow 2s ease-in-out infinite'
      }} />
      
      <CardContent className="p-0 text-center relative z-10">
        <p className="text-sm font-semibold text-[#66ccff] group-hover:text-white transition-colors duration-300 flex items-center justify-center min-h-[2.5rem]">
          {label}
        </p>
      </CardContent>
      
      <style jsx>{`
        @keyframes borderGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </Card>
  );
};

export default QuickActionCard;