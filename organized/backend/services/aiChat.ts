import express from 'express';
import { OpenAI } from 'openai';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const limiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1,
  message: 'Too many requests. Please wait a moment.',
});

router.post('/chat', limiter, async (req, res) => {
  try {
    const { message, context = '', userRole = 'User' } = req.body;

    if (!message) return res.status(400).json({ error: 'Message required' });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `You are YoBot®, an intelligent AI assistant inside the Command Center. Always respond helpfully and concisely.` },
        { role: 'user', content: `${context ? `[${userRole}] ${context}\n\n` : ''}${message}` },
      ],
    });

    const reply = response.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: 'No reply from AI' });

    // Log query for transparency
    console.log(`YoBot AI Reply: ${reply}`);

    res.json({ reply });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

export default router;