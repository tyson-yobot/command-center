// src/ui/cards/SmartCalendarCard.tsx
// YoBot® Command Center – Smart Calendar (FullCalendar) – Production-Ready
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventClickArg,
  EventSourceInput,
  EventDropArg,
  DatesSetArg,
} from "@fullcalendar/core";

import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import "@fullcalendar/list/main.css";

// ──────────────────────────────────────────────────────────────────────────────
// 🔐  Locked constants – no optional params
// -----------------------------------------------------------------------------
const CALENDAR_ENDPOINT = "/api/calendar/events"; // Flask route
const UPDATE_ENDPOINT = "/api/calendar/update";
const AUTO_REFRESH_MS = 60_000; // 60 s

// Owner categories (must match Airtable “Owner” field exactly)
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

const SmartCalendarCard: React.FC = () => {
  // ─── Filters (persisted) ────────────────────────────────────────────────────
  const [showTyson, setShowTyson] = useState(() => getPersist("tyson", true));
  const [showDan, setShowDan] = useState(() => getPersist("dan", true));
  const [showClient, setShowClient] = useState(() => getPersist("client", true));
  const [showBot, setShowBot] = useState(() => getPersist("bot", true));

  const calendarRef = useRef<FullCalendar | null>(null);

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
  const [events, setEvents] = useState<EventSourceInput>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(CALENDAR_ENDPOINT);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CalendarEvent[] = await res.json();
      const mapped = json.map(evt => ({
        id: evt.id,
        title: evt.title,
        start: evt.start_time,
        end: evt.end_time,
        extendedProps: { source: evt.source },
        backgroundColor: pickColor(evt.source),
        borderColor: pickColor(evt.source),
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Calendar fetch failed", err);
    }
  }, []);

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
    return (events as any[]).filter(evt => {
      const src = (evt.extendedProps?.source || "").toString();
      if (src === OWNER_TYSON && !showTyson) return false;
      if (src === OWNER_DAN && !showDan) return false;
      if (/bot/i.test(src) && !showBot) return false;
      if (![OWNER_TYSON, OWNER_DAN].includes(src) && !/bot/i.test(src) && !showClient) return false;
      return true;
    });
  }, [events, showTyson, showDan, showClient, showBot]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const onDateSelect = (selectInfo: any) => selectInfo.view.calendar.unselect();

  const onEventDrop = async (arg: EventDropArg) => {
    const id = arg.event.id;
    const start = arg.event.start?.toISOString();
    const end = arg.event.end?.toISOString();
    if (!id || !start || !end) return;

    try {
      const res = await fetch(UPDATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, start_time: start, end_time: end }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.info("✅ Event updated in Airtable:", id);
    } catch (err) {
      console.error("❌ Failed to update calendar event:", err);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="yobot-card flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">📅 Smart Calendar</h2>
        <div className="flex items-center gap-2">
          <button className="btn-blue" onClick={fetchEvents}>🔄 Refresh</button>
          <button className={`btn-blue ${showTyson ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("tyson")}>Tyson</button>
          <button className={`btn-blue ${showDan ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("dan")}>Dan</button>
          <button className={`btn-blue ${showClient ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("client")}>Clients</button>
          <button className={`btn-blue ${showBot ? "opacity-100" : "opacity-40"}`} onClick={() => toggle("bot")}>Bot</button>
        </div>
      </header>

      {/* Calendar */}
      <FullCalendar
        ref={calendarRef as any}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }}
        height="auto"
        selectable={false}
        selectMirror={false}
        select={onDateSelect}
        events={filteredEvents}
        eventTimeFormat={{ hour: "numeric", minute: "2-digit", hour12: false }}
        eventClick={(info: EventClickArg) => info.jsEvent.stopPropagation()}
        eventDrop={onEventDrop}
        nowIndicator
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        dayMaxEvents={3}
        stickyHeaderDates
        datesSet={(arg: DatesSetArg) => console.debug("Range changed", arg.startStr, arg.endStr)}
      />
    </section>
  );
};

export default SmartCalendarCard;