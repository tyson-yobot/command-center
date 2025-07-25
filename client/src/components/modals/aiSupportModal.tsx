// AiSupportModal.tsx - YoBot® AI Avatar Live Support Modal with RAG-Powered Conversational Routing

import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Loader2 } from 'lucide-react';
import { useWhisper } from '@yobot/voice/hooks/useWhisper';
import useTextToSpeech from '@/lib/hooks/useTextToSpeech';
import AiAvatar from '@/components/ui/ai-avatar';
import useRagPipeline from '@/lib/hooks/useRagPipeline';

const AiSupportModal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { speak } = useTextToSpeech();
  const { queryRag } = useRagPipeline();

  const { startRecording, stopRecording, transcript, recording } = useWhisper({
    onTranscription: async (text: string) => {
      const lowerText = text.toLowerCase();
      let reply = '';
      if (lowerText.includes('how long')) {
        reply = 'Support usually responds in under 1 business day.';
      } else if (lowerText.includes('what now') || lowerText.includes('next')) {
        reply = 'Once you submit your ticket, our AI will analyze and route it for fastest resolution.';
      } else {
        try {
          reply = await queryRag(text);
        } catch (error) {
          reply = `Got it. You said: ${text}`;
        }
      }
      speak(reply);
      setMessage(prev => prev + ' ' + text);
    }
  });

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/zendesk-ticket', {
        name,
        email,
        subject,
        message,
        phone,
        source: 'AI Support Modal'
      });
      if (response.status === 200) {
        setSubmitted(true);
        speak("Thanks, I’ve logged your issue and will notify support. Our agents typically respond within 1 business day. You’ll receive an email confirmation shortly. If you'd like help while waiting, just ask!");
      } else {
        speak("There was an error submitting your request. Please try again.");
      }
    } catch (err) {
      console.error('Ticket submission error', err);
      speak("There was an error submitting your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-4">
      {submitted ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold">🎉 Ticket Submitted!</h2>
          <p className="mt-2 text-muted-foreground">Our AI Avatar logged your issue.</p>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-gray-800 to-black text-white border border-blue-400 shadow-xl rounded-2xl p-6">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4">🤖 Talk to the YoBot® AI Avatar</h2>
            <AiAvatar speaking={recording || loading} />
            <div className="space-y-3 mt-4">
              <Input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
              <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
              <Textarea rows={4} placeholder="Describe your issue..." value={message} onChange={e => setMessage(e.target.value)} />
              <div className="flex gap-4 items-center">
                <Button variant="secondary" onClick={recording ? stopRecording : startRecording}>
                  <Mic className="w-4 h-4 mr-2" /> {recording ? 'Stop' : 'Speak'}
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-[#0d82da] text-white">
                  {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : '🎫 Submit Ticket'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default AiSupportModal;
