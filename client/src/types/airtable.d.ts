declare module 'server/modules/airtable/airtable' {
  export const createRecord: (
    baseId: string,
    tableId: string,
    fields: Record<string, any>
  ) => Promise<any>;
}
