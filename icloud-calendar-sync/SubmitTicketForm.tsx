// ---------------------------------------------------------------------------
// File: client/src/components/SubmitTicketForm.tsx (TAILWIND, TYPED)
// ---------------------------------------------------------------------------

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { submitTicket } from './submitTicket';

interface Props {
  onSuccess: () => void;
}

const SubmitTicketForm: React.FC<Props> = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    attachment: null as File | null,
  });
  const [status, setStatus] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('Submitting…');
    try {
      await submitTicket(form);
      setStatus('✅ Ticket submitted successfully!');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg space-y-4 rounded-2xl border-2 border-[#0d82da] bg-[#1e1e1e] p-6 text-white shadow-[0_0_15px_#0d82da]"
    >
      <h3 className="border-b border-[#0d82da] pb-2 text-lg font-semibold">🛠 Submit Support Ticket</h3>

      <input
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        className="w-full rounded-md border border-[#0d82da] bg-[#2b2b2b] p-2"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full rounded-md border border-[#0d82da] bg-[#2b2b2b] p-2"
        required
      />
      <input
        name="subject"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange}
        className="w-full rounded-md border border-[#0d82da] bg-[#2b2b2b] p-2"
        required
      />
      <textarea
        name="description"
        placeholder="Describe your issue"
        value={form.description}
        onChange={handleChange}
        rows={5}
        className="w-full resize-y rounded-md border border-[#0d82da] bg-[#2b2b2b] p-2"
        required
      />
      <input
        name="attachment"
        type="file"
        onChange={handleChange}
        className="text-white"
      />

      <button
        type="submit"
        className="w-full rounded-md bg-[#0d82da] px-4 py-2 font-bold text-white transition hover:bg-[#0b6db5]"
      >
        Submit Ticket
      </button>

      {status && <p className="pt-2 text-sm">{status}</p>}
    </form>
  );
};

export default SubmitTicketForm;
