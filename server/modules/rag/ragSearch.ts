import express from 'express';
import { OpenAI } from 'openai';
import { getVectors, cosineSimilarity } from './vectorStore';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/search', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });

    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question,
    });

    const queryVector = embeddingRes.data[0].embedding;
    const allVectors = getVectors();

    if (allVectors.length === 0) {
      return res.json({ answer: 'No documents have been uploaded to the knowledge base yet. Please upload some documents first.' });
    }

    const ranked = allVectors
      .map(entry => ({
        ...entry,
        score: cosineSimilarity(queryVector, entry.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const context = ranked.map(r => r.chunk).join('\n---\n');

    const aiRes = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are YoBot®, an intelligent assistant answering based on the YoBot knowledge base. Always respond helpfully and cite relevant information from the documents.`,
        },
        {
          role: 'user',
          content: `Context from knowledge base:\n${context}\n\nQuestion:\n${question}`,
        },
      ],
    });

    const answer = aiRes.choices?.[0]?.message?.content || 'No answer available.';
    
    console.log(`RAG Query: "${question}" - Found ${ranked.length} relevant chunks`);
    res.json({ answer, sources: ranked.length });
  } catch (err) {
    console.error('RAG Search Error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
