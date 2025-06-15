import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Users, Clock, TrendingUp, Eye, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface LiveCallBannerProps {
  onViewDetails?: () => void;
}

export function LiveCallBanner({ onViewDetails }: LiveCallBannerProps) {
  const { data: pipelineStatus, isLoading, error } = useQuery({
    queryKey: ['/api/pipeline-status'],
    queryFn: () => fetch('/api/pipeline-status', {
      headers: { 'x-system-mode': localStorage.getItem('systemMode') || 'live' }
    }).then(res => res.json()),
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 15000,
  });

  const callData = pipelineStatus?.data;
  
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-400 shadow-lg shadow-yellow-400/20 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
            <span className="text-yellow-400">Loading pipeline status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !callData || callData.status === 'inactive' || callData.calls_today === 0) {
    return null;
  }

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
                <span className="text-green-400 font-bold">{callData.in_progress} calls running</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm">Avg: {callData.avg_duration}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm">Success: {callData.success_rate}%</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm">Today:</span>
                <span className="text-white font-bold">{callData.calls_today} total</span>
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