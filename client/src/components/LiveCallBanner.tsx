import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Users, Clock, TrendingUp, Eye } from 'lucide-react';

interface LiveCallBannerProps {
  activeCalls: number;
  isVisible: boolean;
  onViewDetails?: () => void;
}

export function LiveCallBanner({ activeCalls, isVisible, onViewDetails }: LiveCallBannerProps) {
  if (!isVisible || activeCalls === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-400 shadow-lg shadow-green-400/20 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <Phone className="w-5 h-5 text-green-400" />
              <span className="text-white font-bold text-lg">LIVE PIPELINE ACTIVE</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold">{activeCalls} calls running</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm">Avg: 6:42 min</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm">Success: 94.2%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge className="bg-green-600 text-white animate-pulse">
              REAL-TIME
            </Badge>
            
            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}