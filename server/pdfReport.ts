import { spawn } from 'child_process';

export async function generatePDFReport(html: string) {
  // Use your existing Flask PDF system instead of Puppeteer
  const python = spawn('python3', ['server/flaskSalesOrderProcessor.py'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const pdfData = {
    html_content: html,
    report_type: 'general'
  };

  python.stdin.write(JSON.stringify(pdfData));
  python.stdin.end();

  let result = '';
  let error = '';

  python.stdout.on('data', (chunk) => {
    result += chunk.toString();
  });

  python.stderr.on('data', (chunk) => {
    error += chunk.toString();
  });

  return new Promise((resolve, reject) => {
    python.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.from(result, 'base64'));
      } else {
        reject(new Error(error || 'PDF generation failed'));
      }
    });
  });
}