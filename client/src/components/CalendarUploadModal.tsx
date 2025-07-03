import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Upload, FileText, Globe, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalendarSync: (data: any) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  attendees?: string[];
  location?: string;
  type: 'meeting' | 'call' | 'task' | 'reminder';
}

export function CalendarUploadModal({ isOpen, onClose, onCalendarSync }: CalendarUploadModalProps) {
  const [uploadType, setUploadType] = useState<'file' | 'google' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedEvents, setUploadedEvents] = useState<CalendarEvent[]>([]);
  const [weekForecast, setWeekForecast] = useState<CalendarEvent[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('calendar', file);
      formData.append('type', file.name.endsWith('.ics') ? 'ics' : 'csv');

      const response = await fetch('/api/calendar/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedEvents(result.events || []);
      generateWeekForecast(result.events || []);
      
      toast({
        title: "Calendar Uploaded",
        description: `Successfully imported ${result.events?.length || 0} events`
      });

      onCalendarSync(result);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process calendar file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleCalendarSync = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/calendar/google-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Google Calendar sync failed');
      }

      const result = await response.json();
      setUploadedEvents(result.events || []);
      generateWeekForecast(result.events || []);
      setIsGoogleConnected(true);
      
      toast({
        title: "Google Calendar Synced",
        description: `Synced ${result.events?.length || 0} events from Google Calendar`
      });

      onCalendarSync(result);
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWeekForecast = (events: CalendarEvent[]) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= today && eventDate <= nextWeek;
    }).slice(0, 10);

    setWeekForecast(thisWeekEvents);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'call': return <Calendar className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'call': return 'bg-green-100 text-green-800 border-green-200';
      case 'task': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 via-blue-900/80 to-indigo-900/70 backdrop-blur-xl border border-blue-400/50 shadow-2xl shadow-blue-500/20 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-blue-300 text-xl font-bold flex items-center">
            <span className="text-2xl mr-3">📅</span>
            Smart Calendar Integration
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload/Sync Panel */}
          <div className="space-y-6">
            {!uploadType ? (
              <Card className="bg-slate-800/50 border border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Choose Integration Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setUploadType('file')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Calendar File (ICS/CSV)
                  </Button>
                  
                  <Button
                    onClick={() => setUploadType('google')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Sync with Google Calendar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    {uploadType === 'file' ? (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        File Upload
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Google Calendar Sync
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {uploadType === 'file' ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".ics,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-300 text-sm mb-2">
                          Drag and drop your calendar file here, or click to browse
                        </p>
                        <p className="text-slate-500 text-xs">
                          Supports ICS and CSV formats
                        </p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="mt-3 bg-blue-600 hover:bg-blue-700"
                        >
                          {isProcessing ? 'Processing...' : 'Choose File'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Globe className="w-5 h-5 text-green-400" />
                          <span className="text-white font-medium">Google Calendar Integration</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-4">
                          Sync your Google Calendar events for real-time updates and scheduling.
                        </p>
                        <Button
                          onClick={handleGoogleCalendarSync}
                          disabled={isProcessing}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? 'Syncing...' : isGoogleConnected ? 'Re-sync Calendar' : 'Connect Google Calendar'}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setUploadType(null);
                      setUploadedEvents([]);
                      setWeekForecast([]);
                    }}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Back to Options
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upload Status */}
            {uploadedEvents.length > 0 && (
              <Card className="bg-slate-800/50 border border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Import Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Total Events:</span>
                      <span className="text-white font-bold">{uploadedEvents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">This Week:</span>
                      <span className="text-green-400 font-bold">{weekForecast.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Source:</span>
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        {uploadType === 'file' ? 'File Upload' : 'Google Calendar'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Week Forecast Panel */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-400" />
                  7-Day Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weekForecast.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">
                      No upcoming events this week
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Upload or sync your calendar to see upcoming events
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {weekForecast.map((event, index) => (
                      <div key={event.id || index} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={`${getEventColor(event.type)} text-xs`}>
                                {getEventIcon(event.type)}
                                <span className="ml-1 capitalize">{event.type}</span>
                              </Badge>
                            </div>
                            <h4 className="text-white text-sm font-medium mb-1">
                              {event.title}
                            </h4>
                            <p className="text-slate-400 text-xs">
                              {formatEventDate(event.start)}
                            </p>
                            {event.location && (
                              <p className="text-slate-500 text-xs mt-1">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar Statistics */}
            {uploadedEvents.length > 0 && (
              <Card className="bg-slate-800/50 border border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Calendar Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {uploadedEvents.filter(e => e.type === 'meeting').length}
                      </div>
                      <div className="text-slate-400 text-xs">Meetings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {uploadedEvents.filter(e => e.type === 'call').length}
                      </div>
                      <div className="text-slate-400 text-xs">Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {uploadedEvents.filter(e => e.type === 'task').length}
                      </div>
                      <div className="text-slate-400 text-xs">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {weekForecast.length}
                      </div>
                      <div className="text-slate-400 text-xs">This Week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-blue-400/30">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 px-6 py-3 rounded-lg transition-all duration-200"
          >
            Close
          </Button>
          
          {uploadedEvents.length > 0 && (
            <Button
              onClick={() => {
                onCalendarSync({
                  events: uploadedEvents,
                  weekForecast,
                  source: uploadType,
                  totalEvents: uploadedEvents.length,
                  upcomingEvents: weekForecast.length
                });
                onClose();
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply Calendar Integration
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}