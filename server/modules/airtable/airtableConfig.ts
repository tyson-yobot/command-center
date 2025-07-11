import express, { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import formidable, { Files, Fields } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import {
  createRecord,
  deleteRecord,
  getTable,
  getRecord,
  updateRecord,
} from '@/server/modules/airtable/airtableConfig';

const KNOWLEDGE_TABLE = '📚 Knowledge Sources Table';
const INGEST_LOG_TABLE = '🧾 Ingestion Logs Table';

const parseFileContent = async (filepath: string, mimetype: string): Promise<string> => {
  if (mimetype === 'application/pdf') {
    const dataBuffer = await fs.readFile(filepath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  }
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ path: filepath });
    return result.value;
  }
  return await fs.readFile(filepath, 'utf-8');
};

const router = express.Router();

router.post('/upload', async (req: Request, res: Response) => {
  const form = formidable({ multiples: false, uploadDir: path.join('/tmp') });
  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err) return res.status(400).json({ error: err.message });
    const file = files.file as formidable.File;
    const tempPath = file.filepath;
    const text = await parseFileContent(tempPath, file.mimetype || 'text/plain');
    const recordId = uuid();

    const record = {
      '🧠 Title': file.originalFilename,
      '📄 Content': text,
      '🔗 Source URL': '',
      '📎 File Attachment': [
        {
          url: `https://files.yobot.bot/uploads/${file.newFilename}`,
        },
      ],
      '🏷️ Tags': [],
      '🧩 Vector ID': recordId,
      '⏱️ Last Ingested': new Date().toISOString(),
      '🔁 Needs Reindexing?': false,
    };

    await createRecord(KNOWLEDGE_TABLE, record);

    const log = {
      '🧾 Document Title': file.originalFilename,
      '🔍 Result': 'Success',
      '📅 Run Timestamp': new Date().toISOString(),
      '🔧 Triggered By': 'upload-endpoint',
      '📄 Error Details': '',
    };
    await createRecord(INGEST_LOG_TABLE, log);

    res.sendStatus(201);
  });
});

router.post('/inject', async (req: Request, res: Response) => {
  const { title, body, tags } = req.body;
  const recordId = uuid();
  const record = {
    '🧠 Title': title,
    '📄 Content': body,
    '🔗 Source URL': '',
    '🏷️ Tags': tags || [],
    '🧩 Vector ID': recordId,
    '⏱️ Last Ingested': new Date().toISOString(),
    '🔁 Needs Reindexing?': false,
  };
  await createRecord(KNOWLEDGE_TABLE, record);
  const log = {
    '🧾 Document Title': title,
    '🔍 Result': 'Success',
    '📅 Run Timestamp': new Date().toISOString(),
    '🔧 Triggered By': 'manual-inject',
    '📄 Error Details': '',
  };
  await createRecord(INGEST_LOG_TABLE, log);
  res.sendStatus(201);
});

router.post('/query', async (req: Request, res: Response) => {
  const { userQuery } = req.body;
  const records = await getTable(KNOWLEDGE_TABLE);
  const matching = records.filter((r) =>
    r.fields['📄 Content']?.toLowerCase().includes(userQuery.toLowerCase())
  );
  const matchedText = matching.map((r) => r.fields['📄 Content']).join('\n');
  const response = `Matched documents containing your query:\n${matchedText.slice(0, 500)}...`;
  res.json({ enhancedReply: response, sourcesUsed: matching, confidence: 80 });
});

router.get('/entries', async (_: Request, res: Response) => {
  const records = await getTable(KNOWLEDGE_TABLE);
  const rows = records.map((r) => ({
    id: r.id,
    title: r.fields['🧠 Title'],
    source: r.fields['🔗 Source URL'] ? 'URL' : 'Manual/Upload',
    timestamp: r.fields['⏱️ Last Ingested'],
  }));
  res.json(rows);
});

router.get('/entry/:id', async (req: Request, res: Response) => {
  const record = await getRecord(KNOWLEDGE_TABLE, req.params.id);
  res.json(record);
});

router.delete('/entry/:id', async (req: Request, res: Response) => {
  await deleteRecord(KNOWLEDGE_TABLE, req.params.id);
  res.sendStatus(204);
});

router.delete('/entries', async (_: Request, res: Response) => {
  const records = await getTable(KNOWLEDGE_TABLE);
  await Promise.all(records.map((r) => deleteRecord(KNOWLEDGE_TABLE, r.id)));
  res.sendStatus(204);
});

router.patch('/reindex/:id', async (req: Request, res: Response) => {
  await updateRecord(KNOWLEDGE_TABLE, req.params.id, {
    '🔁 Needs Reindexing?': true,
    '⏱️ Last Ingested': new Date().toISOString(),
  });
  res.sendStatus(204);
});

export default router;
