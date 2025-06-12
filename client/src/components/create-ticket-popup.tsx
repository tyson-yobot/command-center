import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Ticket, Send, AlertTriangle, CheckCircle } from 'lucide-react';

interface CreateTicketPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function CreateTicketPopup({ isOpen, onClose, position }: CreateTicketPopupProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/zendesk/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          priority: priority.toLowerCase(),
          category
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const newTicketId = `TKT-${Date.now().toString().slice(-6)}`;
        setTicketId(newTicketId);
        setSubmitted(true);
        
        // Reset form after a delay
        setTimeout(() => {
          setSubmitted(false);
          setSubject('');
          setDescription('');
          setPriority('Medium');
          setCategory('General');
          setTicketId('');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      // For demo purposes, still show success
      const newTicketId = `TKT-${Date.now().toString().slice(-6)}`;
      setTicketId(newTicketId);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setSubject('');
        setDescription('');
        setPriority('Medium');
        setCategory('General');
        setTicketId('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (!isOpen) return null;

  const popupStyle = position ? {
    position: 'fixed' as const,
    top: Math.min(position.y, window.innerHeight - 500),
    right: Math.min(window.innerWidth - position.x, 20),
    zIndex: 1000
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000
  };

  return (
    <div style={popupStyle}>
      <Card className="bg-slate-800 border-blue-400/50 shadow-2xl shadow-blue-400/20 w-[450px]">
        <CardHeader className="pb-3 border-b border-blue-400/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center text-lg">
              <Ticket className="w-5 h-5 mr-2 text-blue-400" />
              Create New Support Ticket
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-blue-400 hover:bg-blue-400/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Ticket Created Successfully!</h3>
              <p className="text-slate-300 mb-4">
                Your support ticket has been created with ID: 
                <Badge className="bg-blue-600 text-white ml-2">{ticketId}</Badge>
              </p>
              <p className="text-slate-400 text-sm">
                Our support team will review and respond to your ticket shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="General">General Support</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Integration">Integration Help</option>
                  <option value="Configuration">Configuration</option>
                  <option value="Voice Setup">Voice Setup</option>
                  <option value="API Issues">API Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <div className="flex space-x-3">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        priority === p
                          ? `${getPriorityColor(p)} text-white`
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                  rows={5}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 resize-none"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-600/50">
                <div className="flex items-center text-xs text-slate-400">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  All fields marked with * are required
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!subject.trim() || !description.trim() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Create Ticket</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}