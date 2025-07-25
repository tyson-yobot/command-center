const useRagPipeline = () => {
  const queryRag = async (input: string): Promise<string> => {
    // Simulate RAG result
    return `Based on our docs, here's what you should do for: "${input}"`;
  };
  return { queryRag };
};

export default useRagPipeline;
