import PDFDocument from 'pdfkit';

export async function generatePDFReport(html: string): Promise<Buffer> {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    doc.on('data', chunk => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.text(html);
    doc.end();
  });
}
