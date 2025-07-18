// ✅ FINAL PRODUCTION FILE — SubmitTicketModal.tsx
// 🔒 Fully Wired | YoBot Command Center | AI Assistant + Automation | No Placeholders

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitTicketModal = ({ isOpen, onClose }: ModalProps) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitTicket = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/submit-support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'command-center',
          ticket: message,
          priority: 'high',
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setResponse(`✅ Ticket submitted successfully: ${data.result}`);
        // 🔁 Optional Slack or Zendesk Webhook Trigger
        await fetch('https://hooks.slack.com/services/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', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🎫 New Ticket via Command Center:\n\n${message}\n\nSource: YoBot`,
          }),
        });
      } else {
        setResponse(`❌ Submission failed: ${data.message}`);
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      setResponse('🚨 Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>🎫 Submit a Ticket to YoBot Support</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-gray-300">
              This sends your message to an AI support agent for real-time triage. If it cannot be resolved automatically, it will escalate to Slack + Zendesk.
            </p>
            <Textarea
              placeholder="Describe your issue, command, or request..."
              rows={4}
              className="w-full text-black"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSubmitTicket} disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin w-4 h-4" /> Submitting...
                </div>
              ) : (
                'Submit Ticket'
              )}
            </Button>
            {response && <div className="text-sm text-green-400 pt-2">{response}</div>}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitTicketModal;
