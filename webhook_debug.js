const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Capture ALL POST requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    const timestamp = new Date().toISOString();
    const data = {
      timestamp,
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query
    };
    
    console.log('🔥 CAPTURED POST REQUEST:', JSON.stringify(data, null, 2));
    
    // Save to file
    const filename = `captured_post_${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`💾 Saved to: ${filename}`);
  }
  next();
});

// Wildcard endpoints
app.post('*', (req, res) => {
  res.json({ success: true, message: 'Data captured', timestamp: new Date().toISOString() });
});

app.listen(5001, () => {
  console.log('🕵️ Webhook debug server running on port 5001');
});