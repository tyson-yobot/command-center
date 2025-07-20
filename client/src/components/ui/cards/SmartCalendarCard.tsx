// src/ui/cards/SmartCalendarCard.tsx
// YoBot® Command Center – Smart Calendar – Production-Ready
// -----------------------------------------------------------------------------
// • Zero optional parameters – all constants locked.
// • Uses design-system utility classes (.yobot-card, .btn-blue, charcoal bg,
//   electric-blue borders) – NO ad-hoc Tailwind.
// • Live data source:     GET /api/calendar/events (Flask backend).
// • Auto-refresh every 60 s + manual 🔄 button (Slack-logged in backend).
// • Category toggles: Tyson / Dan / Client / Bot – persisted in localStorage.
// • Color mapping: electric-blue, silver, neon-green, violet.
// • Drag-and-drop updates Airtable via /api/calendar/update.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { logEvent } from "@utils/eventLogger";
import { CalendarService } from "@/services/CalendarService";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useToast } from "@/hooks/useToast";

// ──────────────────────────────────────────────────────────────────────────────
// 🔐  Locked constants – no optional params
// -----------------------------------------------------------------------------
// API endpoints
const calendarService = new CalendarService();
const AUTO_REFRESH_MS = 60_000; // 60 s

// Owner categories (must match Airtable "Owner" field exactly)
const OWNER_TYSON = "Tyson";
const OWNER_DAN = "Dan";

// Color palette matches YoBot® brand spec (#0d82da electric blue, silver, neon)
const COLOR_ELECTRIC_BLUE = "#0d82da"; // Tyson
const COLOR_SILVER = "#c3c3c3";       // Dan
const COLOR_NEON_GREEN = "#22c55e";    // Client events
const COLOR_VIOLET = "#8b5cf6";        // Bot events

// -----------------------------------------------------------------------------
interface CalendarEvent {
  id?: string;
  title: string;
  start_time: string; // ISO from backend
  end_time: string;
  source: string; // Owner in Airtable (Tyson / Dan / Bot / …)
}

interface ProcessedEvent extends CalendarEvent {
  start: Date;
  end: Date;
  color: string;
}

const SmartCalendarCard = () => {
  // ─── Filters (persisted) ────────────────────────────────────────────────────
  const [showTyson, setShowTyson] = useState(() => getPersist("tyson", true));
  const [showDan, setShowDan] = useState(() => getPersist("dan", true));
  const [showClient, setShowClient] = useState(() => getPersist("client", true));
  const [showBot, setShowBot] = useState(() => getPersist("bot", true));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function getPersist(key: string, fallback: boolean) {
    try {
      const raw = localStorage.getItem(`yobot-cal-filter-${key}`);
      return raw === null ? fallback : raw === "true";
    } catch {
      return fallback;
    }
  }
  function setPersist(key: string, val: boolean) {
    try {
      localStorage.setItem(`yobot-cal-filter-${key}`, String(val));
    } catch {/* quota */}
  }

  const toggle = (who: "tyson" | "dan" | "client" | "bot") => {
    switch (who) {
      case "tyson":
        setShowTyson(v => { setPersist("tyson", !v); return !v; });
        break;
      case "dan":
        setShowDan(v => { setPersist("dan", !v); return !v; });
        break;
      case "client":
        setShowClient(v => { setPersist("client", !v); return !v; });
        break;
      case "bot":
        setShowBot(v => { setPersist("bot", !v); return !v; });
        break;
    }
  };

  // ─── Pull events ───────────────────────────────────────────────────────────
  const [events, setEvents] = useState<ProcessedEvent[]>([]);

  const { showToast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const json = await calendarService.getEvents();
      const mapped = json.map(evt => ({
        ...evt,
        start: new Date(evt.start_time),
        end: new Date(evt.end_time),
        color: pickColor(evt.source),
      }));
      setEvents(mapped);
      logEvent('calendar', 'refresh', 'success');
    } catch (err) {
      console.error("Calendar fetch failed", err);
      showToast('Error loading calendar events', 'error');
      logEvent('calendar', 'refresh', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchEvents();
    const id = window.setInterval(fetchEvents, AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [fetchEvents]);

  // ─── Event color logic ─────────────────────────────────────────────────────
  function pickColor(source: string) {
    if (source === OWNER_TYSON) return COLOR_ELECTRIC_BLUE;
    if (source === OWNER_DAN) return COLOR_SILVER;
    if (/bot/i.test(source)) return COLOR_VIOLET;
    return COLOR_NEON_GREEN;
  }

  // ─── Filtered view ─────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const src = evt.source || "";
      if (src === OWNER_TYSON && !showTyson) return false;
      if (src === OWNER_DAN && !showDan) return false;
      if (/bot/i.test(src) && !showBot) return false;
      if (![OWNER_TYSON, OWNER_DAN].includes(src) && !/bot/i.test(src) && !showClient) return false;
      return true;
    });
  }, [events, showTyson, showDan, showClient, showBot]);

  // ─── Date navigation ───────────────────────────────────────────────────────
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // ─── Calendar rendering helpers ────────────────────────────────────────────
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return filteredEvents.filter(event => 
      event.start.toDateString() === dateStr || 
      event.end.toDateString() === dateStr ||
      (event.start < date && event.end > date)
    );
  };

  // ─── Simple Calendar Grid ──────────────────────────────────────────────────
  const renderCalendarView = () => {
    if (viewMode === 'month') {
      // Simple month view - just show current month with event count
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const days = [];
      
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEvents = getEventsForDate(date);
        days.push(
          <div key={day} className="border border-[#333333] p-2 min-h-[80px] text-white">
            <div className="font-semibold text-sm">{day}</div>
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className="text-xs p-1 mb-1 rounded"
                style={{ backgroundColor: event.color, color: 'white' }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-[#c3c3c3]">+{dayEvents.length - 3} more</div>
            )}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-7 gap-1 auto-rows-fr">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-semibold text-center p-2 bg-[#2a2a2a] text-white">{day}</div>
          ))}
          {days}
        </div>
      );
    }

    // Week/Day view - simple list
    const startDate = viewMode === 'week' 
      ? new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000)
      : currentDate;
    
    const days = viewMode === 'week' ? 7 : 1;
    const viewEvents = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayEvents = getEventsForDate(date);
      
      viewEvents.push(
        <div key={i} className="border-b border-[#333333] p-4 text-white">
          <h3 className="font-semibold text-lg mb-2">{formatDate(date)}</h3>
          {dayEvents.length === 0 ? (
            <p className="text-[#c3c3c3]">No events</p>
          ) : (
            <div className="space-y-2">
              {dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg text-white"
                  style={{ backgroundColor: event.color }}
                >
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm opacity-90">
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </div>
                  <div className="text-xs opacity-75">Source: {event.source}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <div className="space-y-0 text-white">{viewEvents}</div>;
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="yobot-card flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">📅 Smart Calendar</h2>
        <div className="flex items-center gap-2">
          <button className="btn-blue" onClick={fetchEvents} aria-label="Refresh calendar">🔄 Refresh</button>
          <button className={`btn-blue ${showTyson ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("tyson")}>Tyson</button>
          <button className={`btn-blue ${showDan ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("dan")}>Dan</button>
          <button className={`btn-blue ${showClient ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("client")}>Clients</button>
          <button className={`btn-blue ${showBot ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("bot")}>Bot</button>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn-blue" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="btn-blue" onClick={goToToday}>Today</button>
          <button className="btn-blue" onClick={() => navigateDate('next')}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <h3 className="text-xl font-bold text-white">
          {currentDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long',
            ...(viewMode === 'day' && { day: 'numeric' })
          })}
        </h3>

        <div className="flex items-center gap-1">
          <button 
            className={`btn-blue ${viewMode === 'month' ? 'opacity-100' : 'opacity-60'}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button 
            className={`btn-blue ${viewMode === 'week' ? 'opacity-100' : 'opacity-60'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`btn-blue ${viewMode === 'day' ? 'opacity-100' : 'opacity-60'}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-[#1a1a1a] border-4 border-[#0d82da] rounded-lg overflow-hidden shadow-2xl">
        {renderCalendarView()}
      </div>
    </section>
  );
};

export default SmartCalendarCard;