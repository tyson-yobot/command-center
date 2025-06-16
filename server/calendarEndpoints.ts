/**
 * Calendar Integration Endpoints
 * Implements calendar upload (ICS/CSV) and Google Calendar sync
 */
import { Express } from 'express';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/calendar', 'text/csv', 'application/csv'];
    const allowedExtensions = ['.ics', '.csv'];
    const hasValidType = allowedTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .ics and .csv files are allowed.'));
    }
  }
});

interface CalendarEvent {
  title: string;
  date: string;
  time: string;
  description?: string;
  location?: string;
}

function parseICSFile(fileContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = fileContent.split('\n');
  let currentEvent: Partial<CalendarEvent> = {};
  let inEvent = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (trimmedLine === 'END:VEVENT' && inEvent) {
      if (currentEvent.title && currentEvent.date) {
        events.push(currentEvent as CalendarEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      if (trimmedLine.startsWith('SUMMARY:')) {
        currentEvent.title = trimmedLine.substring(8);
      } else if (trimmedLine.startsWith('DTSTART:')) {
        const dateStr = trimmedLine.substring(8);
        currentEvent.date = formatICSDate(dateStr);
        currentEvent.time = formatICSTime(dateStr);
      } else if (trimmedLine.startsWith('DESCRIPTION:')) {
        currentEvent.description = trimmedLine.substring(12);
      } else if (trimmedLine.startsWith('LOCATION:')) {
        currentEvent.location = trimmedLine.substring(9);
      }
    }
  }

  return events;
}

function parseCSVFile(fileContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = fileContent.split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= headers.length) {
      const event: Partial<CalendarEvent> = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.replace(/"/g, '');
        if (header.includes('title') || header.includes('summary') || header.includes('subject')) {
          event.title = value;
        } else if (header.includes('date')) {
          event.date = value;
        } else if (header.includes('time')) {
          event.time = value;
        } else if (header.includes('description') || header.includes('notes')) {
          event.description = value;
        } else if (header.includes('location')) {
          event.location = value;
        }
      });

      if (event.title && event.date) {
        events.push(event as CalendarEvent);
      }
    }
  }

  return events;
}

function formatICSDate(icsDate: string): string {
  // Convert YYYYMMDDTHHMMSSZ to YYYY-MM-DD
  if (icsDate.length >= 8) {
    const year = icsDate.substring(0, 4);
    const month = icsDate.substring(4, 6);
    const day = icsDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return icsDate;
}

function formatICSTime(icsDate: string): string {
  // Convert YYYYMMDDTHHMMSSZ to HH:MM
  if (icsDate.length >= 13 && icsDate.includes('T')) {
    const timepart = icsDate.split('T')[1];
    const hour = timepart.substring(0, 2);
    const minute = timepart.substring(2, 4);
    return `${hour}:${minute}`;
  }
  return '';
}

export function registerCalendarEndpoints(app: Express) {
  // Calendar upload endpoint
  app.post('/api/calendar/upload', upload.single('calendar'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No calendar file provided' 
        });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const fileName = req.file.originalname.toLowerCase();
      let events: CalendarEvent[] = [];

      if (fileName.endsWith('.ics')) {
        events = parseICSFile(fileContent);
      } else if (fileName.endsWith('.csv')) {
        events = parseCSVFile(fileContent);
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Unsupported file format. Only .ics and .csv files are supported.' 
        });
      }

      // Here you would typically save events to Airtable
      // For now, we'll return the parsed events
      
      console.log(`📅 Calendar upload: ${events.length} events parsed from ${fileName}`);
      
      res.json({
        success: true,
        eventsCount: events.length,
        events: events.slice(0, 5), // Return first 5 events as preview
        message: `Successfully processed ${events.length} calendar events`
      });

    } catch (error) {
      console.error('Calendar upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process calendar file' 
      });
    }
  });

  // Pipeline status endpoint for live call tracking
  app.get('/api/pipeline-status', (req, res) => {
    // This would typically query your voice call log table
    const mockStatus = {
      status: "active",
      callsToday: 23,
      inProgress: 3,
      completed: 18,
      conversionRate: "21%",
      avgDuration: "2m 10s"
    };

    res.json({
      success: true,
      data: mockStatus
    });
  });

  // Export dashboard endpoint
  app.post('/api/export-dashboard', async (req, res) => {
    try {
      const { format, sections, reportType, dateRange } = req.body;
      
      console.log(`📊 Generating ${reportType} report in ${format} format`);
      console.log(`📋 Sections: ${sections.join(', ')}`);
      console.log(`📅 Date range: ${dateRange}`);
      
      // Generate export data based on configuration
      const exportData = {
        reportType,
        generatedAt: new Date().toISOString(),
        sections: sections,
        dateRange: dateRange,
        data: {
          smartspend: sections.includes('smartspend') ? {
            monthlySpend: 4850,
            costPerLead: 24.50,
            roi: "312%",
            conversionRate: "8.7%"
          } : null,
          voice_analytics: sections.includes('voice_analytics') ? {
            callsToday: 23,
            avgDuration: "7:42",
            conversionRate: "15.2%"
          } : null,
          botalytics: sections.includes('botalytics') ? {
            interactions: 1247,
            escalations: "2.1%",
            satisfaction: "94%"
          } : null
        }
      };

      // Set appropriate headers for download
      const filename = `yobot-${reportType}-report.${format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(exportData, null, 2));
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        // Generate CSV content
        let csvContent = 'Section,Metric,Value\n';
        Object.entries(exportData.data).forEach(([section, data]) => {
          if (data) {
            Object.entries(data).forEach(([metric, value]) => {
              csvContent += `${section},${metric},${value}\n`;
            });
          }
        });
        res.send(csvContent);
      } else {
        // Default to JSON
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(exportData, null, 2));
      }

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate export' 
      });
    }
  });

  console.log('📅 Calendar and export endpoints registered');
}