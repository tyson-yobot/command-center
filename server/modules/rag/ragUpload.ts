import express from 'express';
import multer from 'multer';
import { OpenAI } from 'openai';
import { storeVector } from './vectorStore';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({ dest: 'uploads/' });

// Text chunking function
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = await import('fs');
    const path = await import('path');
    
    let content = '';
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === '.txt') {
      content = fs.readFileSync(req.file.path, 'utf-8');
    } else if (fileExtension === '.pdf') {
      // For now, return error for PDF files
      return res.status(400).json({ error: 'PDF files not supported yet' });
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Split content into chunks
    const chunks = chunkText(content);

    // Embed + store
    let count = 0;
    for (const chunk of chunks) {
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      });

      const vector = embeddingRes.data[0].embedding;
      storeVector({ chunk, vector });
      count++;
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log(`✅ Stored ${count} embedded chunks from ${req.file.originalname}`);
    res.json({ status: 'success', chunks: count });

  } catch (error) {
    console.error('RAG Upload Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
