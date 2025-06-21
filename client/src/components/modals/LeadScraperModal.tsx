// components/modals/LeadScraperModal.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";

export function LeadScraperModal() {
  const [tool, setTool] = useState("Google Maps");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const router = useRouter();

  const startScraper = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/lead-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, query })
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Scraper error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="purple">Launch Lead Scraper</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-[#111] border-[#0d82da] text-white">
        <DialogHeader>
          <DialogTitle>🧲 Lead Scraper Tool</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <label className="text-sm">Scraper Tool</label>
          <select
            className="bg-black border border-[#0d82da] p-2 rounded-md text-white"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
          >
            <option>Google Maps</option>
            <option>Yelp</option>
            <option>LinkedIn</option>
            <option>Custom</option>
          </select>

          <label className="text-sm">Search Query</label>
          <Input
            placeholder="e.g. Mortgage brokers in Scottsdale AZ"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Button
            onClick={startScraper}
            disabled={loading}
            variant="blue"
            className="mt-4"
          >
            {loading ? "Scraping..." : "Start Scraper"}
          </Button>

          {results.length > 0 && (
            <div className="mt-4">
              <p className="text-sm mb-2">🔍 {results.length} results found:</p>
              <Textarea readOnly rows={10} value={results.join("\n")}></Textarea>
            </div>
          )}

          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.push("/dashboard")}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}