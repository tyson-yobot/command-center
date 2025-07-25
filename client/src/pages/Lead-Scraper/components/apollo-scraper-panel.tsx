// ✅ apollo-scraper-panel.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ApolloScraperPanel = () => {
  const [apiKey, setApiKey] = useState("");

  const handleSave = async () => {
    await fetch("/api/store/apollo-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: apiKey })
    });
    location.reload();
  };

  return (
    <Card className="bg-gradient-to-br from-[#0d82da] to-silver border-2 border-[#0d82da] rounded-2xl shadow-xl mb-6">
      <CardContent className="p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Apollo Scraper Credentials</h2>
        <p className="text-sm mb-4 text-[#c3c3c3]">Store your Apollo API key to enable lead scraping.</p>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 rounded bg-[#1e1e1e] border border-[#0d82da] text-white placeholder:text-[#888] mb-4"
          placeholder="Apollo API Key"
        />
        <Button onClick={handleSave} className="bg-[#0d82da] hover:brightness-125 text-white w-full">Save & Return</Button>
      </CardContent>
    </Card>
  );
};

export default ApolloScraperPanel;