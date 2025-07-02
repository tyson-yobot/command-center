import React, { useEffect, useState } from "react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
}

const ZendeskChatWidget: React.FC = () => {
  const [ticketData, setTicketData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/tickets");
        if (!res.ok) throw new Error(res.statusText);
        const data: Ticket[] = await res.json();
        setTicketData(data);
      } catch (e) {
        console.error("❌ Ticket fetch failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="bg-[#1a1a1a] border-4 border-[#0d82da] rounded-2xl p-8 shadow-xl" style={{ boxShadow: "0 0 25px #0d82da" }}>
      <h2 className="text-2xl font-bold mb-4 text-white">🎫 Zendesk Tickets</h2>
      {loading ? (
        <p className="text-sm italic text-[#c3c3c3]">Loading…</p>
      ) : ticketData.length ? (
        <ul className="space-y-3">
          {ticketData.map((t) => (
            <li
              key={t.id}
              className="bg-[#000000] p-4 rounded-xl border border-[#0d82da] shadow"
              style={{ boxShadow: "0 0 12px #0d82da" }}
            >
              <div className="text-sm text-white">
                <strong className="text-[#0d82da]">#{t.id}</strong> – {t.subject}
              </div>
              <div className="text-xs text-[#c3c3c3]">
                Status: {t.status} | Priority: {t.priority}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#c3c3c3]">No tickets found.</p>
      )}
    </div>
  );
};

export { ZendeskChatWidget };
