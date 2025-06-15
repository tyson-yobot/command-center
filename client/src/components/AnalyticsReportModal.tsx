import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Download, Eye, Printer, BarChart3, TrendingUp, Phone, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AnalyticsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const reportSections: ReportSection[] = [
  {
    id: 'botalytics',
    name: 'Botalytics™',
    description: 'Bot performance, automation metrics, and efficiency tracking',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    id: 'smartspend',
    name: 'SmartSpend™',
    description: 'Budget utilization, cost per lead, ROI analysis',
    icon: <DollarSign className="w-4 h-4" />
  },
  {
    id: 'voice-analytics',
    name: 'Voice Analytics',
    description: 'Call logs, sentiment analysis, voice command performance',
    icon: <Phone className="w-4 h-4" />
  },
  {
    id: 'performance',
    name: 'Performance Metrics',
    description: 'Lead generation, conversion rates, pipeline analytics',
    icon: <TrendingUp className="w-4 h-4" />
  }
];

const reportTypes = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'custom', label: 'Custom Date Range' }
];

const reportFormats = [
  { value: 'pdf', label: 'PDF Report', icon: <FileText className="w-4 h-4" /> },
  { value: 'csv', label: 'CSV Data', icon: <FileText className="w-4 h-4" /> },
  { value: 'xlsx', label: 'Excel Spreadsheet', icon: <FileText className="w-4 h-4" /> }
];

export function AnalyticsReportModal({ isOpen, onClose }: AnalyticsReportModalProps) {
  const [reportType, setReportType] = useState('weekly');
  const [selectedSections, setSelectedSections] = useState<string[]>(['botalytics', 'smartspend']);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    setShowPreview(false);
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    setShowPreview(true);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const reportData = {
        type: reportType,
        sections: selectedSections,
        format: reportFormat,
        dateRange: reportType === 'custom' ? { from: dateFrom, to: dateTo } : null,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/analytics/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.${reportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-blue-400">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Generate Analytics Report
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Report Type */}
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Report Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Custom Date Range */}
            {reportType === 'custom' && (
              <Card className="bg-slate-800/50 border border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 text-xs mb-1 block">From</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white",
                              !dateFrom && "text-slate-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                            className="text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-slate-300 text-xs mb-1 block">To</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white",
                              !dateTo && "text-slate-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                            className="text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Sections */}
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Report Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportSections.map(section => (
                    <div key={section.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={section.id}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                        className="border-slate-600 data-[state=checked]:bg-blue-600"
                      />
                      <div className="flex-1">
                        <label htmlFor={section.id} className="text-white text-sm font-medium flex items-center cursor-pointer">
                          {section.icon}
                          <span className="ml-2">{section.name}</span>
                        </label>
                        <p className="text-slate-400 text-xs mt-1">{section.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Format Selection */}
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Output Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {reportFormats.map(format => (
                    <label key={format.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={reportFormat === format.value}
                        onChange={(e) => setReportFormat(e.target.value)}
                        className="text-blue-600"
                      />
                      <div className="flex items-center">
                        {format.icon}
                        <span className="text-white text-sm ml-2">{format.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {!showPreview ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm mb-4">Generate preview to see report structure</p>
                    <Button
                      onClick={handleGeneratePreview}
                      disabled={isGenerating || selectedSections.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </div>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Generate Preview
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">
                        {reportTypes.find(t => t.value === reportType)?.label}
                      </h3>
                      <p className="text-slate-300 text-sm">
                        {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="mt-3 space-y-2">
                        {selectedSections.map(sectionId => {
                          const section = reportSections.find(s => s.id === sectionId);
                          return section ? (
                            <div key={sectionId} className="flex items-center text-sm text-slate-300">
                              {section.icon}
                              <span className="ml-2">{section.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                      <h4 className="text-white text-sm font-medium mb-2">Report Details</h4>
                      <div className="space-y-1 text-xs text-slate-300">
                        <p>Format: {reportFormats.find(f => f.value === reportFormat)?.label}</p>
                        <p>Date Range: {reportType === 'custom' ? 
                          `${dateFrom ? format(dateFrom, 'MMM dd') : '...'} - ${dateTo ? format(dateTo, 'MMM dd') : '...'}` :
                          reportType.charAt(0).toUpperCase() + reportType.slice(1)
                        }</p>
                        <p>Generated: {format(new Date(), 'PPP p')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-600">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          
          <div className="flex space-x-3">
            {showPreview && (
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            )}
            
            <Button
              onClick={handleDownload}
              disabled={isGenerating || selectedSections.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}