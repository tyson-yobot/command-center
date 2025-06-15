import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Sheet, Database } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExportDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDashboardModal({ isOpen, onClose }: ExportDashboardModalProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>(['smartspend', 'botalytics']);
  const [exportFormat, setExportFormat] = useState<string>('xlsx');
  const [dateRange, setDateRange] = useState<string>('last_7_days');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const sections = [
    { id: 'smartspend', label: 'SmartSpend™ Analytics', description: 'Cost optimization and budget efficiency' },
    { id: 'botalytics', label: 'Botalytics™ Metrics', description: 'Lead quality and conversion analytics' },
    { id: 'voice_analytics', label: 'Voice Analytics', description: 'Call performance and success rates' },
    { id: 'client_metrics', label: 'Client Metrics', description: 'Customer engagement and satisfaction' },
    { id: 'automation_performance', label: 'Automation Performance', description: 'Bot efficiency and response times' },
    { id: 'pipeline_status', label: 'Pipeline Status', description: 'Lead progression and conversion funnel' }
  ];

  const formats = [
    { value: 'xlsx', label: 'Excel (.xlsx)', icon: Sheet },
    { value: 'csv', label: 'CSV (.csv)', icon: Database },
    { value: 'pdf', label: 'PDF Report (.pdf)', icon: FileText },
    { value: 'json', label: 'JSON Data (.json)', icon: Database }
  ];

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one section to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = {
        format: exportFormat,
        sections: selectedSections,
        date_range: dateRange === 'custom' ? {
          start: customStartDate?.toISOString(),
          end: customEndDate?.toISOString()
        } : { preset: dateRange }
      };

      const response = await fetch('/api/export-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Create download link for the exported data
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: exportFormat === 'json' ? 'application/json' : 'application/octet-stream'
        });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = result.filename || `yobot_dashboard_export.${exportFormat}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        onClose();
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Dashboard Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {format.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Select Sections</label>
            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
              {sections.map((section) => (
                <div key={section.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={section.id}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {section.label}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === 'custom' && (
              <div className="flex gap-4 mt-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedSections.length === 0}>
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}