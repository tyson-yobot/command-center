import express, { json } from "express";

const app = express();

// Parse JSON request bodies
app.use(json());
const PORT = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.send("YoBot API is alive 🧠🤖");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
