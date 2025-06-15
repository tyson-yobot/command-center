import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Calendar, FileText, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

interface CalendarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarUploadModal({ isOpen, onClose }: CalendarUploadModalProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'google' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedEvents, setUploadedEvents] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('processing');

    try {
      const formData = new FormData();
      formData.append('calendar', file);

      const response = await fetch('/api/calendar/upload', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedEvents(result.events || []);
        setUploadStatus('success');
        setUploadProgress(100);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Calendar upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGoogleCalendarSync = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('processing');

    try {
      // Simulate progress for Google Calendar API
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const response = await fetch('/api/calendar/google-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedEvents(result.events || []);
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Google Calendar sync failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const resetUpload = () => {
    setUploadMethod(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedEvents([]);
    setUploadStatus('idle');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900 border border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Calendar className="w-6 h-6 text-purple-400" />
            <span>Smart Calendar Integration</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Method Selection */}
          {!uploadMethod && uploadStatus === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="bg-slate-800 border-slate-600 cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => setUploadMethod('file')}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-purple-400 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Calendar File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm mb-3">
                    Upload your calendar file directly
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">ICS Format</Badge>
                    <Badge variant="outline" className="text-xs">CSV Format</Badge>
                    <Badge variant="outline" className="text-xs">Outlook Export</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-slate-800 border-slate-600 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => setUploadMethod('google')}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-blue-400 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Google Calendar Sync
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm mb-3">
                    Connect and sync with Google Calendar
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">One-way Sync</Badge>
                    <Badge variant="outline" className="text-xs">Real-time Updates</Badge>
                    <Badge variant="outline" className="text-xs">Event Categories</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* File Upload Interface */}
          {uploadMethod === 'file' && uploadStatus === 'idle' && (
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-purple-400">Upload Calendar File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-4">
                    Drag and drop your calendar file here, or click to browse
                  </p>
                  <p className="text-slate-500 text-sm mb-4">
                    Supported formats: .ics, .csv, .vcf
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ics,.csv,.vcf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Google Calendar Sync Interface */}
          {uploadMethod === 'google' && uploadStatus === 'idle' && (
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-blue-400">Google Calendar Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Globe className="w-16 h-16 text-blue-400 mx-auto" />
                  <p className="text-slate-300">
                    Connect your Google Calendar to sync events and create a 7-day projection
                  </p>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-300 text-sm mb-2">This will:</p>
                    <ul className="text-slate-400 text-sm space-y-1">
                      <li>• Import your upcoming events</li>
                      <li>• Create weekly forecasts</li>
                      <li>• Enable agent filters</li>
                      <li>• Provide meeting analytics</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleGoogleCalendarSync}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing State */}
          {uploadStatus === 'processing' && (
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400">Processing Calendar Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-300">
                      {uploadMethod === 'file' ? 'Parsing calendar file...' : 'Syncing with Google Calendar...'}
                    </p>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-center text-slate-400 text-sm">{uploadProgress}% complete</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {uploadStatus === 'success' && (
            <Card className="bg-slate-800 border-green-400">
              <CardHeader>
                <CardTitle className="text-lg text-green-400 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Calendar Integration Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                    <p className="text-green-400 font-medium mb-2">Import Summary:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-300">Events Imported:</span>
                        <span className="text-green-400 font-bold ml-2">{uploadedEvents.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-300">Integration Type:</span>
                        <span className="text-green-400 font-bold ml-2">
                          {uploadMethod === 'file' ? 'File Upload' : 'Google Sync'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {uploadedEvents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-slate-300 font-medium">7-Day Forecast:</p>
                      <div className="bg-slate-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {uploadedEvents.slice(0, 5).map((event, index) => (
                          <div key={index} className="flex justify-between items-center py-1 text-sm">
                            <span className="text-slate-300">{event.title || 'Untitled Event'}</span>
                            <Badge variant="outline" className="text-xs">
                              {event.date || 'TBD'}
                            </Badge>
                          </div>
                        ))}
                        {uploadedEvents.length > 5 && (
                          <p className="text-slate-400 text-xs text-center mt-2">
                            ...and {uploadedEvents.length - 5} more events
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      onClick={resetUpload}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Import Another Calendar
                    </Button>
                    <Button
                      onClick={onClose}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Complete Setup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <Card className="bg-slate-800 border-red-400">
              <CardHeader>
                <CardTitle className="text-lg text-red-400 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Integration Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">
                      {uploadMethod === 'file' 
                        ? 'Unable to parse the calendar file. Please check the format and try again.'
                        : 'Failed to connect to Google Calendar. Please check your permissions and try again.'
                      }
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={resetUpload}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}