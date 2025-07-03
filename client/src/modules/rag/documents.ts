export interface RAGDocMeta {
  id: string;
  name: string;
  uploadedAt: string;
}

export async function listRAGDocuments(): Promise<RAGDocMeta[]> {
  const res = await fetch("/api/rag/list");
  if (!res.ok) throw new Error("Failed to list docs");
  return res.json();
}

export async function deleteRAGDocument(id: string): Promise<void> {
  const res = await fetch(`/api/rag/delete/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export async function deleteAllRAGDocuments(): Promise<void> {
  const res = await fetch("/api/rag/delete_all", { method: "DELETE" });
  if (!res.ok) throw new Error("Bulk delete failed");
}
