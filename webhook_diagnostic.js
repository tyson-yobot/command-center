const express = require('express');
const app = express();

// Enable all CORS and body parsing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.raw({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// Capture ALL traffic on ALL paths
app.use('*', (req, res) => {
  const timestamp = Date.now();
  const filename = `DIAGNOSTIC_${timestamp}.json`;
  
  console.log('='.repeat(80));
  console.log(`DIAGNOSTIC CAPTURE: ${req.method} ${req.originalUrl}`);
  console.log('TIME:', new Date().toISOString());
  console.log('HEADERS:', JSON.stringify(req.headers, null, 2));
  console.log('BODY:', JSON.stringify(req.body, null, 2));
  console.log('QUERY:', JSON.stringify(req.query, null, 2));
  console.log('PARAMS:', JSON.stringify(req.params, null, 2));
  console.log('='.repeat(80));
  
  const fs = require('fs');
  fs.writeFileSync(filename, JSON.stringify({
    timestamp: new Date().toISOString(),
    method: req.method,
    originalUrl: req.originalUrl,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip
  }, null, 2));
  
  console.log(`SAVED TO: ${filename}`);
  
  // If this contains form data, trigger processing
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('FORM DATA DETECTED - TRIGGERING PROCESSING');
    
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python3', ['live_tally_processor.py'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    pythonProcess.stdin.write(JSON.stringify(req.body));
    pythonProcess.stdin.end();
    
    pythonProcess.stdout.on('data', (data) => {
      console.log('PROCESSING OUTPUT:', data.toString());
    });
  }
  
  res.json({
    success: true,
    message: 'DIAGNOSTIC CAPTURE COMPLETE',
    timestamp: new Date().toISOString(),
    capturedFile: filename,
    method: req.method,
    url: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`DIAGNOSTIC SERVER RUNNING ON PORT ${PORT}`);
  console.log('Ready to capture Tally webhook data');
});