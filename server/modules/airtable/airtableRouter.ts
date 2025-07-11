// File: server/modules/airtable/airtableRouter.ts
// =============================================================================
//  YoBot® Command Center – Airtable Router (Production Build – FINAL)
// =============================================================================
//  • CRUD + custom endpoints mapped directly to Python function library
//  • Correct relative imports (Node 16 ESM/TS → use .js extensions)
//  • Context‑rich payloads and full Airtable logging
// =============================================================================

import express, { Request, Response } from "express";
import { runPythonFunction } from "../../utils/functionRunner";
import { logInfo, logError } from "../../utils/logger";


const DEFAULT_BASE: string = process.env.AIRTABLE_DEFAULT_BASE ?? "";
const DEFAULT_TABLE: string = process.env.AIRTABLE_DEFAULT_TABLE ?? "";

const router = express.Router();
router.use(express.json({ limit: "1mb" }));

//------------------------------------------------------------------
// Resolve Airtable IDs
//------------------------------------------------------------------
function ids(req: Request) {
  const baseId = req.params.baseId || DEFAULT_BASE;
  const tableName = req.params.tableName || DEFAULT_TABLE;
  if (!baseId || !tableName) throw new Error("Missing baseId or tableName");
  return { baseId, tableName };
}

//------------------------------------------------------------------
// GET – List records
//------------------------------------------------------------------
router.get("/:baseId/:tableName", async (req: Request, res: Response) => {
  try {
    const { baseId, tableName } = ids(req);
    const result = await runPythonFunction("fetch_records", {
      base_id: baseId,
      table_name: tableName,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    logError("airtable", `GET → ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

//------------------------------------------------------------------
// POST – Create record
//------------------------------------------------------------------
router.post("/:baseId/:tableName", async (req: Request, res: Response) => {
  try {
    const { baseId, tableName } = ids(req);
    const fields = req.body;
    const result = await runPythonFunction("create_record", {
      base_id: baseId,
      table_name: tableName,
      fields,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    logError("airtable", `POST → ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

//------------------------------------------------------------------
// PATCH – Update record
//------------------------------------------------------------------
router.patch("/:baseId/:tableName/:recordId", async (req: Request, res: Response) => {
  try {
    const { baseId, tableName, recordId } = req.params;
    const fields = req.body;
    const result = await runPythonFunction("update_record", {
      base_id: baseId,
      table_name: tableName,
      record_id: recordId,
      fields,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    logError("airtable", `PATCH → ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

//------------------------------------------------------------------
// DELETE – Remove record
//------------------------------------------------------------------
router.delete("/:baseId/:tableName/:recordId", async (req: Request, res: Response) => {
  try {
    const { baseId, tableName, recordId } = req.params;
    const result = await runPythonFunction("delete_record", {
      base_id: baseId,
      table_name: tableName,
      record_id: recordId,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    logError("airtable", `DELETE → ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

//------------------------------------------------------------------
// POST – Generate Quote PDF
//------------------------------------------------------------------
router.post("/generate/quote", async (req: Request, res: Response) => {
  try {
    const result = await runPythonFunction("generate_quote_pdf", req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logError("airtable", `Quote → ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

//------------------------------------------------------------------
// POST – Log External Event (Command Center Logging)
//------------------------------------------------------------------
router.post("/log", async (req: Request, res: Response) => {
  try {
    const result = await runPythonFunction("external_logger", req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logError("airtable", `Log → ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

//------------------------------------------------------------------
// Health
//------------------------------------------------------------------
router.get("/healthz", (_req: Request, res: Response) => res.json({ status: "ok" }));

export default router;



