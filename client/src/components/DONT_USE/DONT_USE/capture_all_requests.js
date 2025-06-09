const express = require('express');
const fs = require('fs');

const app = express();

// Enable all parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.raw({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// Global request logger - captures everything
app.use((req, res, next) => {
  const timestamp = Date.now();
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip
  };
  
  console.log('='.repeat(80));
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Time:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('='.repeat(80));
  
  // Save all requests
  const filename = `request_capture_${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(logData, null, 2));
  
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    console.log('TALLY FORM DATA DETECTED!');
    console.log('Processing with webhook handler...');
    
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python3', ['webhook_handler.py'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    pythonProcess.stdin.write(JSON.stringify(req.body));
    pythonProcess.stdin.end();
    
    pythonProcess.stdout.on('data', (data) => {
      console.log('Webhook Output:', data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.log('Webhook Error:', data.toString());
    });
  }
  
  next();
});

// Catch all routes
app.all('*', (req, res) => {
  res.json({
    success: true,
    message: 'Request captured',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Request capture server running on port ${PORT}`);
  console.log('Monitoring all incoming requests...');
});