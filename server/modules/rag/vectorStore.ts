type VectorEntry = {
  chunk: string;
  vector: number[];
};

const vectorDB: VectorEntry[] = [];

export const storeVector = (entry: VectorEntry) => {
  vectorDB.push(entry);
};

export const getVectors = () => vectorDB;

export const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
};
