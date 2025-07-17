// RAGKnowledgeCenter.tsx — Fetch and display chunks from /api/rag/chunks
import React, { useEffect, useState } from "react";
import axios from "axios";
interface Chunk {
  id: string;
  fields: {
    "📄 Chunk"?: string;
    "📁 Source"?: string;
    "🧠 EmbeddingStatus"?: string;
  };
}



export const RAGKnowledgeCenter: React.FC = () => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChunks = async () => {
      try {
        const res = await axios.get("/api/rag/chunks");
        setChunks(res.data.chunks);
      } catch (err: any) {
        console.error("RAG fetch failed", err);
        setError("Failed to load knowledge chunks");
      }
    };

     fetchChunks();
  }, []);

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      {chunks.length === 0 ? (
        <div className="text-gray-400">No knowledge chunks loaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="bg-gray-800 rounded-lg p-4 border border-blue-400"
            >
              <p className="text-white font-semibold mb-2">
                {chunk.fields["📁 Source"] || "📄 Unknown Source"}
              </p>
              <p className="text-gray-300 whitespace-pre-wrap text-sm">
                {chunk.fields["📄 Chunk"] || "No content"}
              </p>
              <p className="text-xs text-yellow-400 mt-2">
                Status: {chunk.fields["🧠 EmbeddingStatus"] || "Pending"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
