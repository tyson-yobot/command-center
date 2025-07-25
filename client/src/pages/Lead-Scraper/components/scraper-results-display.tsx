import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default function ScraperResultsDisplay() {
  const [results, setResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/airtable/scraper-leads").then((res) => {
      setResults(res.data.slice(0, 10));
      setLoading(false);
    });
  }, []);

  const deleteRecord = async (id: string) => {
    await axios.delete(`/api/airtable/scraper-leads/${id}`);
    setResults((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to clear all results?")) return;
    await axios.delete("/api/airtable/scraper-leads/clear");
    setResults([]);
  };

  return (
    <div className="w-full px-4 py-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-wide text-silver">📥 Scraper Results (First 10)</h2>
        <Button variant="destructive" onClick={clearAll} className="hover:shadow-glow hover:bg-red-700">🧹 Clear All</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          results.map((result, index) => (
            <Card
              key={result.id}
              className="bg-gradient-to-br from-[#1f1f1f] to-[#303030] p-5 border border-blue-500 rounded-2xl shadow-md hover:shadow-blue-500/30 transition-all"
            >
              <h3 className="text-lg font-semibold mb-2 text-blue-400">
                {result.name || `Lead ${index + 1}`}
              </h3>
              <p className="text-sm text-gray-300">📧 {result.email || "No email provided"}</p>
              <p className="text-sm text-gray-300">📱 {result.phone || "No phone provided"}</p>
              <div className="mt-4 text-right">
                <Button
                  variant="outline"
                  className="text-red-400 hover:text-red-600 border-red-400 hover:border-red-600"
                  onClick={() => deleteRecord(result.id)}
                >
                  ❌ Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="text-sm text-right text-gray-400 mt-6 italic">
        Displaying {results.length} of 10 max
      </div>
    </div>
  );
}
