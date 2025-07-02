import type { RAGMatch } from "./rag.types";

export async function queryRagMemory(query: string): Promise<RAGMatch[]> {
  const res = await fetch("/api/rag/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }

  return res.json();
}
