import Airtable from 'airtable';

/**
 * Shared Airtable base – uses env vars injected by Vite.
 * You must expose these as VITE_… in your .env file.
 */
const globalBase = new Airtable({
  apiKey: import.meta.env.VITE_AIRTABLE_KEY
}).base('appRt8V3tH4g5Z51f');

/**
 * Fetch **all** rows from a single table in the default base.
 * @param tableName Airtable table name (emoji label OK)
 */
export const fetchRecords = async (tableName: string) => {
  const records: any[] = [];

  return new Promise<any[]>((resolve, reject) => {
    globalBase(tableName)
      .select()
      .eachPage(
        (partial, next) => {
          records.push(...partial.map(r => r.fields));
          next(); // get next batch
        },
        err => {
          if (err) {
            console.error('[Airtable] fetch error', err);
            reject(err);
          } else {
            resolve(records);
          }
        }
      );
  });
};

/**
 * Fetch rows from any base + table (overrides the global one).
 * @param baseId   Airtable base ID
 * @param tableId  Airtable table ID / name
 */
export const fetchRecords2 = async (baseId: string, tableId: string) => {
  const tmpBase = new Airtable({
    apiKey: import.meta.env.VITE_AIRTABLE_KEY
  }).base(baseId);

  const records = await tmpBase(tableId).select().all();
  return records.map(r => r.fields);
};
