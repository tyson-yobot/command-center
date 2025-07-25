import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { type DateSelectArg, type EventClickArg as FCEventClickArg, type EventDropArg } from "@fullcalendar/interaction";
// @ts-ignore: no type declarations for '@fullcalendar/rrule'
import rrulePlugin from "@fullcalendar/rrule";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
// @ts-ignore: no type declarations for 'react-modal'
import Modal from "react-modal";
import axios from "axios";
import dayjs from "dayjs";
import "../../../styles/calendar.css";

const BASE_ID = "appRt8V3tH4g5Z5if";
const TABLE_ID = "tblhxA9YOTf4ynJi2";
const CALENDAR_ENDPOINT = `/api/airtable/${BASE_ID}/${TABLE_ID}/list`;
const CREATE_ENDPOINT = `/api/airtable/${BASE_ID}/${TABLE_ID}/create`;
const UPDATE_ENDPOINT = `/api/airtable/${BASE_ID}/${TABLE_ID}/update`;
const DELETE_ENDPOINT = `/api/airtable/${BASE_ID}/${TABLE_ID}/delete`;
const UPLOAD_ENDPOINT = `/api/calendar/upload`;
const SUGGEST_ENDPOINT = `/api/calendar/suggest`;
const EXPORT_ENDPOINT = `/api/calendar/export`;
const SYNC_GOOGLE_ENDPOINT = `/api/calendar/sync/google`;
const AUTO_REFRESH_MS = 60_000;
const OWNER_OPTIONS = ["Tyson", "Dan", "Client", "Bot"];
const ADMIN_ROLE = "Admin";

type CalendarEvent = {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  extendedProps?: {
    owner?: string;
  };
};

type EventClickArg = {
  event: CalendarEvent;
};

type DateSelectArg = {
  startStr: string;
  endStr: string;
};

type EventDropArg = {
  event: {
    id: string;
    start: Date;
    end: Date;
  };
};

type FileEvent = React.ChangeEvent<HTMLInputElement>;

const SmartCalendarCard = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", owner: OWNER_OPTIONS[0], start: "", end: "" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [conflictWarning, setConflictWarning] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [minTime, setMinTime] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REFRESH_MS / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? AUTO_REFRESH_MS / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    const res = await axios.get(CALENDAR_ENDPOINT);
    setEvents(res.data);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.owner || !newEvent.start || !newEvent.end) return;

    const conflict = events.find(
      (evt) =>
        dayjs(evt.start).isBefore(newEvent.end) &&
        dayjs(evt.end).isAfter(newEvent.start) &&
        evt.extendedProps?.owner === newEvent.owner
    );

    if (conflict) {
      setConflictWarning("⛔ Conflict detected with another event");
      return;
    }

    const payload = {
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      extendedProps: { owner: newEvent.owner },
      rrule: isRecurring ? {
        freq: "weekly",
        interval: 1,
        byweekday: ["mo"],
        dtstart: newEvent.start,
      } : null,
    };

    const res = await axios.post(CREATE_ENDPOINT, payload);
    setEvents((prev) => [...prev, res.data]);
    setModalIsOpen(false);
    setNewEvent({ title: "", owner: OWNER_OPTIONS[0], start: "", end: "" });
    setConflictWarning("");
  };

  const handleDateSelect = (info: DateSelectArg) => {
    setNewEvent((prev) => ({ ...prev, start: info.startStr, end: info.endStr }));
    setModalIsOpen(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info.event);
    setEditModalIsOpen(true);
  };

  const updateEvent = async () => {
    const payload = {
      id: selectedEvent.id,
      title: selectedEvent.title,
      start: selectedEvent.start,
      end: selectedEvent.end
    };
    await axios.post(UPDATE_ENDPOINT, payload);
    setEditModalIsOpen(false);
    fetchEvents();
  };

  const deleteEvent = async () => {
    await axios.post(DELETE_ENDPOINT, { id: selectedEvent.id });
    setEditModalIsOpen(false);
    fetchEvents();
  };

  const onEventDrop = async (info: EventDropArg) => {
    const event = info.event;
    const payload = {
      id: event.id,
      start: event.start.toISOString(),
      end: event.end.toISOString()
    };
    await axios.post(UPDATE_ENDPOINT, payload);
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append("file", uploadFile);
    await axios.post(UPLOAD_ENDPOINT, formData);
    setUploadFile(null);
    alert("📎 File attached");
  };

  const suggestTime = async () => {
    const res = await axios.get(SUGGEST_ENDPOINT);
    alert(`🧠 Suggested: ${res.data.start} to ${res.data.end}`);
  };

  const autoSchedule = async () => {
    try {
      const res = await axios.get(SUGGEST_ENDPOINT);
      const { start, end } = res.data;

      const payload = {
        title: "📅 Auto-Scheduled by AI",
        start,
        end,
        extendedProps: { owner: "Bot" }
      };

      const createRes = await axios.post(CREATE_ENDPOINT, payload);
    setEvents((prev) => [...prev, createRes.data]);
    alert(`✅ Auto-scheduled: ${start} to ${end}`);
  } catch (err) {
    console.error("❌ Auto-schedule failed", err);
    alert("❌ AI failed to find a good time.");
  }
};


  const exportCalendar = async () => {
    const res = await axios.get(EXPORT_ENDPOINT, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "calendar.csv");
    document.body.appendChild(link);
    link.click();
  };

  const syncGoogleCalendar = async () => {
    const res = await axios.post(SYNC_GOOGLE_ENDPOINT);
    alert(res.data.message || "✅ Google Calendar sync complete");
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <section className="yobot-card">
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="btn-blue" onClick={suggestTime}>🧠 Suggest Time</button>
        <button className="btn-blue" onClick={() => navigator.clipboard.writeText(window.location.href)}>🔗 Share Calendar</button>
        <button className="btn-blue" onClick={exportCalendar}>📤 Export</button>
        <button className="btn-blue" onClick={syncGoogleCalendar}>🌐 Sync with Google Calendar</button>
        <button className="btn-blue" onClick={autoSchedule}>🤖 Auto-Schedule</button>
      </div>

      <p className="text-xs text-gray-400 mt-[-10px] mb-2 ml-1">
  🔄 Refreshing in {secondsLeft}s
</p>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
        height="auto"
        selectable={true}
        selectMirror={false}
        select={handleDateSelect}
        events={events.filter(evt => userRole === ADMIN_ROLE || evt.extendedProps?.owner === userRole)}
        eventClick={handleEventClick}
        eventDrop={onEventDrop}
        eventContent={(arg) => {
  const owner = arg.event.extendedProps?.owner;
  const color = {
    "Tyson": "#0ff",     // Neon cyan
    "Dan": "#f0f",       // Neon magenta
    "Client": "#ff0",    // Neon yellow
    "Bot": "#0f0"        // Neon green
  }[owner] || "#fff";

  return (
    <div style={{ color }}>
      {arg.event.title}
    </div>
  );
}}

        nowIndicator
        slotMinTime={minTime}
        slotMaxTime={maxTime}
        dayMaxEvents={3}
        stickyHeaderDates
      />

      <div className="mt-4">
        <label className="text-sm font-semibold text-white block mb-1">📎 Attach File to Event</label>
        <input
          type="file"
          onChange={(e: FileEvent) => setUploadFile(e.target.files?.[0])}
          className="text-white bg-slate-800 rounded p-2 w-full"
        />
        <button onClick={handleFileUpload} className="btn-blue mt-2">Upload</button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Add Event"
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-xl mb-4">📅 Create New Event</h2>
        <input
          type="text"
          placeholder="Title"
          value={newEvent.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, title: e.target.value })}
          className="input"
        />
        <select
          value={newEvent.owner}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewEvent({ ...newEvent, owner: e.target.value })}
          className="input mt-2"
        >
          {OWNER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="text-sm mt-2">Start: {newEvent.start}</div>
        <div className="text-sm mb-2">End: {newEvent.end}</div>
        <label className="block mt-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsRecurring(e.target.checked)}
          />
          <span className="ml-2">🔁 Repeat Weekly</span>
        </label>
        {conflictWarning && <div className="text-red-500 mb-2">{conflictWarning}</div>}
        <button className="btn-blue mt-2" onClick={createEvent}>✅ Save Event</button>
        <button className="btn-blue mt-2 ml-2" onClick={() => setModalIsOpen(false)}>❌ Cancel</button>
      </Modal>

      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={() => setEditModalIsOpen(false)}
        contentLabel="Edit Event"
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-xl mb-4">✏️ Edit Event</h2>
        {selectedEvent && (
          <>
            <input
              type="text"
              value={selectedEvent.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => selectedEvent && setSelectedEvent({ ...selectedEvent, title: e.target.value })}
              className="input"
            />
            <div className="text-sm mt-2">Start: {dayjs(selectedEvent.start).format("YYYY-MM-DD HH:mm")}</div>
            <div className="text-sm mb-2">End: {dayjs(selectedEvent.end).format("YYYY-MM-DD HH:mm")}</div>
            <button className="btn-blue mt-2" onClick={updateEvent}>✅ Update Event</button>
            <button className="btn-blue mt-2 ml-2" onClick={deleteEvent}>🗑️ Delete Event</button>
          </>
        )}
      </Modal>
    </section>
  );
};

export default SmartCalendarCard;
