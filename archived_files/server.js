const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/webhook", async (req, res) => {
  const ticket = req.body;
  console.log("🎟 Incoming Ticket:", ticket);

  try {
    const text = await runPython("ai_support_agent_refactored.py", ticket);
    if (!text) throw new Error("No AI reply");

    ticket.aiReply = text;
    ticket.escalationFlag = text.includes("escalate") ? true : false;
    ticket.sentiment = text.includes("sorry") ? "negative" : "neutral";

    await runPython("elevenlabs_voice_generator_refactored.py", { text });

    await runPython("support_dispatcher.py", ticket);

    res.status(200).send("✅ Ticket processed successfully");
  } catch (err) {
    console.error("❌ Processing failed:", err);
    res.status(500).send("Error processing ticket");
  }
});

function runPython(file, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload).replace(/"/g, '\\"');
    const command = `python3 ${file} "${data}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(stderr || error);
      resolve(stdout.trim());
    });
  });
}

app.listen(port, () => {
  console.log(`🎧 Listening on port ${port}`);
});