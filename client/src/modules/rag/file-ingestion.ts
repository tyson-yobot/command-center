import type { ApiResponse } from "./rag.types";

export async function ingestFileToRAG(file: File): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/rag/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  return res.json();
}
