import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Printer, Eye, Calendar, TrendingUp, DollarSign, Mic, Settings } from 'lucide-react';

interface AnalyticsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsReportModal({ isOpen, onClose }: AnalyticsReportModalProps) {
  const [reportType, setReportType] = useState('daily');
  const [selectedSections, setSelectedSections] = useState({
    botalytics: true,
    smartspend: true,
    voiceAnalytics: true,
    systemHealth: false,
    clientMetrics: false
  });
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { value: 'daily', label: 'Daily Report', icon: Calendar },
    { value: 'weekly', label: 'Weekly Summary', icon: TrendingUp },
    { value: 'monthly', label: 'Monthly Analysis', icon: TrendingUp },
    { value: 'custom', label: 'Custom Range', icon: Settings }
  ];

  const sections = [
    { key: 'botalytics', label: 'Botalytics™ Metrics', icon: TrendingUp, color: 'cyan' },
    { key: 'smartspend', label: 'SmartSpend™ Analytics', icon: DollarSign, color: 'green' },
    { key: 'voiceAnalytics', label: 'Voice Analytics', icon: Mic, color: 'purple' },
    { key: 'systemHealth', label: 'System Health', icon: Settings, color: 'blue' },
    { key: 'clientMetrics', label: 'Client Metrics', icon: FileText, color: 'orange' }
  ];

  const handleSectionToggle = (sectionKey: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey as keyof typeof prev]
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-analytics-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          sections: selectedSections,
          format,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yobot_analytics_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Save preferences
        localStorage.setItem('lastReportPreferences', JSON.stringify({
          reportType,
          selectedSections,
          format
        }));
      }
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    // Generate preview logic here
  };

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('lastReportPreferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      setReportType(preferences.reportType || 'daily');
      setSelectedSections(preferences.selectedSections || selectedSections);
      setFormat(preferences.format || 'pdf');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Generate Analytics Report</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Configuration */}
          <div className="space-y-6">
            {/* Report Type */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400">Report Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Sections */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-green-400">Report Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sections.map(section => (
                    <div key={section.key} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                      <Checkbox
                        checked={selectedSections[section.key as keyof typeof selectedSections]}
                        onCheckedChange={() => handleSectionToggle(section.key)}
                        className="border-slate-500"
                      />
                      <section.icon className={`w-5 h-5 text-${section.color}-400`} />
                      <span className="text-slate-200">{section.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Format */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-purple-400">Output Format</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="pdf" className="text-white hover:bg-slate-700">PDF Document</SelectItem>
                    <SelectItem value="csv" className="text-white hover:bg-slate-700">CSV Spreadsheet</SelectItem>
                    <SelectItem value="xlsx" className="text-white hover:bg-slate-700">Excel Workbook</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Actions */}
          <div className="space-y-6">
            {/* Report Preview */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-orange-400">Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-700 rounded-lg p-4 min-h-[200px]">
                  {showPreview ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Report Type:</span>
                        <Badge className="bg-cyan-600">{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Sections:</span>
                        <span className="text-green-400">{Object.values(selectedSections).filter(Boolean).length} selected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Format:</span>
                        <Badge className="bg-purple-600">{format.toUpperCase()}</Badge>
                      </div>
                      <div className="mt-4 p-3 bg-slate-600 rounded text-sm text-slate-300">
                        Preview: YoBot Analytics Report - {new Date().toLocaleDateString()}
                        <br />
                        Contains: {Object.entries(selectedSections).filter(([_, selected]) => selected).map(([key]) => key).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      Click "Generate Preview" to see report summary
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handlePreview}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isGenerating}
              >
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
              
              <Button
                onClick={handlePrint}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isGenerating}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              
              <Button
                onClick={handleGenerateReport}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isGenerating}
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download Report'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}