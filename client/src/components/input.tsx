import React from "react";

export function Input({ placeholder, value, onChange }: { placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type="text"
      className="bg-black border border-[#0d82da] p-2 rounded-md text-white"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}