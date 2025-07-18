import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface KPIAnalyticsCardProps {
  label: string;
  airtableField?: string;
  color?: string;
  showMeter?: boolean;
  meterThresholds?: {
    green: number;
    yellow: number;
    red: number;
  };
}

const KPIAnalyticsCard: React.FC<KPIAnalyticsCardProps> = ({ 
  label, 
  airtableField, 
  color = '#66ccff',
  showMeter = false,
  meterThresholds = { green: 75, yellow: 50, red: 25 }
}) => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching - in production this would call Airtable API
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock data based on the label
        const mockValue = Math.floor(Math.random() * 100);
        setValue(mockValue);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [airtableField]);

  const getMeterColor = (value: number) => {
    if (value >= meterThresholds.green) return '#66ff66';
    if (value >= meterThresholds.yellow) return '#ffff66';
    return '#ff6666';
  };

  const getValueColor = (value: number) => {
    if (value >= meterThresholds.green) return 'text-green-400';
    if (value >= meterThresholds.yellow) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-[#0d82da] rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d82da] to-[#66ccff] opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl" />
      
      <CardContent className="p-0 relative z-10">
        <div className="space-y-3">
          <p className="text-sm text-[#c3c3c3] font-medium group-hover:text-[#66ccff] transition-colors duration-300">{label}</p>
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-[#66ccff] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#c3c3c3]">Loading...</span>
            </div>
          ) : (
            <>
              <p className={`text-xl font-bold ${getValueColor(value)} group-hover:scale-105 transition-transform duration-300`}>
                {value}%
              </p>
              
              {showMeter && (
                <div className="mt-3 space-y-2">
                  <div className="relative w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${value}%`,
                        background: `linear-gradient(90deg, ${getMeterColor(value)}, ${getMeterColor(value)}88)`,
                        boxShadow: `0 0 10px ${getMeterColor(value)}66`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#c3c3c3]">
                    <span>0%</span>
                    <span className="text-[#66ccff]">{value}%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPIAnalyticsCard;