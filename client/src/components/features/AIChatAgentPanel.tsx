// ✅ AIChatAgentPanel.tsx
// 🔒 Fully Wired YoBot Agent — Chat + Voice + Backend Automation

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Mic, MicOff, Send } from 'lucide-react';

const AIChatAgentPanel = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSubmit(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const handleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const handleSubmit = async (overrideInput?: string) => {
    const prompt = overrideInput || input;
    if (!prompt.trim()) return;

    setLoading(true);
    setMessages([...messages, `🧑‍💼 You: ${prompt}`]);

    try {
      const res = await fetch('/api/yobot-agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, `🤖 YoBot: ${data.reply}`]);
      speakResponse(data.reply);
    } catch (error) {
      console.error('❌ AI Chat Error:', error);
      setMessages((prev) => [...prev, '🚨 Error: AI agent failed.']);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = synth.getVoices().find((v) => v.name.includes('Google') || v.default) || synth.getVoices()[0];
    synth.speak(utter);
  };

  return (
    <Card className="bg-[#111] border-[4px] border-blue-500 text-white rounded-3xl shadow-xl">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-2xl font-bold mb-2">🧠 YoBot® AI Assistant</h3>
        <div className="max-h-[250px] overflow-y-auto space-y-2 text-sm bg-[#222] p-3 rounded-xl">
          {messages.map((msg, i) => (
            <div key={i} className="whitespace-pre-wrap">{msg}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            className="flex-1 text-black"
            placeholder="Ask YoBot anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
          />
          <Button onClick={() => handleSubmit()} disabled={loading || !input.trim()}>
            {loading ? <Loader className="animate-spin w-4 h-4" /> : <Send />}
          </Button>
          <Button onClick={handleMic} variant="outline">
            {listening ? <MicOff /> : <Mic />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatAgentPanel;
