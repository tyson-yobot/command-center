import express from 'express';
import fs from 'fs';
import path from 'path';
import { PDFGenerator, QuoteData } from './pdfGenerator';

const router = express.Router();

const pdfDir = path.resolve('./pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

router.post('/generate', async (req, res) => {
  try {
    const data = req.body as QuoteData;
    const generator = new PDFGenerator();
    const result = await generator.generateQuotePDF(data);
    if (!result.success || !result.filePath) {
      res.status(500).json({ error: result.error || 'Failed to generate quote PDF' });
      return;
    }

    res.download(result.filePath, (err) => {
      if (err) {
        console.error('PDF download error:', err);
      }
      fs.unlink(result.filePath, () => {});
    });
  } catch (err: any) {
    console.error('PDF Quote generation failed:', err);
    res.status(500).json({ error: 'Failed to generate quote PDF', details: err.message });
  }
});

export default router;

