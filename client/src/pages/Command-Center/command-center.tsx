import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import robotHeadImage from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1749785199597.png';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderBar from '@/components/HeaderBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

import { 
  TrendingUp, 
  Phone, 
  PhoneOff,
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  Activity,
  MessageSquare,
  Target,
  BarChart3,
  Headphones,
  Mic,
  MicOff,
  AlertTriangle,
  Bell,
  Zap,
  Calendar,
  Brain,
  Settings,
  MessageCircle,
  Send,
  Ticket,
  Monitor,
  PieChart,
  FileText,
  Gauge,
  Search,
  Mail,
  Database,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  Edit,
  Edit3,
  Share2,
  FileDown,
  Printer,
  RotateCcw,
  HelpCircle,
  Camera,
  Building,
  Info,
  Bot,
  User,
  MapPin,
  Globe,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { useToast } from '@/hooks/use-toast';

export default function CommandCenter() {
  return (
    <div className="min-h-screen bg-black">
    </div>
  );

  // Fetch system mode from API
  const { data: systemModeData } = useQuery({
    queryKey: ['/api/system-mode'],
    refetchInterval: 5000,
  });

  // Fetch live metrics
  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard-metrics'],
    refetchInterval: 10000,
  });

  // Fetch live activity
  const { data: liveActivity } = useQuery({
    queryKey: ['/api/live-activity'],
    refetchInterval: 8000,
  });

  // Fetch automation performance
  const { data: automationPerformance } = useQuery({
    queryKey: ['/api/automation-performance'],
    refetchInterval: 12000,
  });

  useEffect(() => {
    if (systemModeData?.systemMode) {
      setCurrentSystemMode(systemModeData.systemMode);
      localStorage.setItem('systemMode', systemModeData.systemMode);
    }
  }, [systemModeData]);

  const handleVoiceToggle = () => {
    if (!isListening) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            setVoiceCommand(lastResult[0].transcript);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.log('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        try {
          recognition.start();
          setIsListening(true);
          setCurrentRecognition(recognition);
          recognitionRef.current = recognition;
        } catch (error) {
          console.error('Failed to start recognition:', error);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access for voice commands",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Voice Recognition Unavailable",
          description: "Voice recognition not supported in this browser",
          variant: "destructive"
        });
      }
    } else {
      setIsListening(false);
      if (currentRecognition) {
        try {
          currentRecognition.stop();
          setCurrentRecognition(null);
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
      if (recognitionRef.current) {
        recognitionRef.current = null;
      }
      setVoiceCommand('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <HeaderBar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Dashboard Title */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <img 
                src={robotHeadImage} 
                alt="YoBot Robot Head" 
                className="w-14 h-14 mr-0 -mt-3"
                onError={(e) => {
                  console.log('Image failed to load, showing Bot icon fallback');
                  (e.target as HTMLImageElement).style.display = 'none';
                  const botIcon = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (botIcon) botIcon.style.display = 'block';
                }}
              />
              <Bot className="w-14 h-14 mr-1 -mt-2 text-blue-400" style={{ display: 'none' }} />
              YoBot<sup className="text-lg">®</sup> Command Center Dashboard
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Your Complete AI Automation Control Panel
          </p>
        </div>

        {/* Global Voice Control Bar */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm border border-blue-400 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mic className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Voice Control</span>
              <Badge className={`${isListening ? 'bg-green-500' : 'bg-gray-500'} text-white flex items-center`}>
                {isListening && <div className="w-2 h-2 bg-green-200 rounded-full mr-1 animate-pulse"></div>}
                {isListening ? 'Listening...' : 'Ready'}
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleVoiceToggle}
                className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isListening ? 'Stop Voice' : 'Start Voice'}
              </Button>
            </div>
          </div>
          {isListening && (
            <div className="mt-3 text-sm text-green-400 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Voice commands ready. Say "YoBot" to activate commands.
            </div>
          )}
        </div>

        {/* Live Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-400" />
                Active Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {metrics?.activeCalls || '0'}
              </div>
              <p className="text-slate-300 text-sm">
                {metrics?.activeCalls ? 'Live voice sessions' : 'No active sessions'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {metrics?.aiOperations || '0'}
              </div>
              <p className="text-slate-300 text-sm">
                AI operations active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-400" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {automationPerformance?.successRate || '0%'}
              </div>
              <p className="text-slate-300 text-sm">
                {automationPerformance?.successRate ? 'Live automation rate' : 'No automation data'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {metrics?.systemHealth || '0%'}
              </div>
              <p className="text-slate-300 text-sm">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveActivity && Array.isArray(liveActivity) && liveActivity.length > 0 ? (
                liveActivity.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.action}</p>
                      <p className="text-slate-300 text-sm">{item.company} • {item.time}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">Monitoring live activity...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}