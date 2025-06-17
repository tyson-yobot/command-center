const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send("✅ YoBot Voice Server is live");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
