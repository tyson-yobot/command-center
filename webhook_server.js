const express = require('express');
const app = express();
const { exec } = require('child_process');

app.use(express.json());

app.post('/webhook', (req, res) => {
  const ticket = req.body;
  console.log("🔥 Webhook received:", ticket);

  require('fs').writeFileSync('ticket.json', JSON.stringify(ticket));

  exec('python run_yobot_support.py', (err, stdout, stderr) => {
    if (err) {
      console.error("Dispatch error:", stderr);
      return res.status(500).send("❌ Error");
    }
    console.log(stdout);
    res.send("✅ Dispatched");
  });
});

app.listen(3000, () => console.log("🎧 Listening on port 3000"));