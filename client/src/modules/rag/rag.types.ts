export type ApiResponse = {
  success: boolean;
  message?: string;
  [key: string]: any;
};

export type RAGMatch = {
  id: string;
  score: number;
  text: string;
};

export interface RAGDocMeta {
  id: string;
  name: string;
  uploadedAt: string;
}
