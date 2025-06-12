import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Ticket, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const CreateTicketPopup: React.FC<CreateTicketPopupProps> = ({ isOpen, onClose, position }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        id: Date.now().toString(),
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ticketId = `TKT-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      toast({
        id: Date.now().toString(),
        title: 'Ticket Created Successfully',
        description: `Your support ticket ${ticketId} has been created and assigned to our team.`
      });

      // Reset form
      setSubject('');
      setDescription('');
      setPriority('medium');
      setCategory('');
      setAttachments([]);
      onClose();
    } catch (error) {
      toast({
        id: Date.now().toString(),
        title: 'Error',
        description: 'Failed to create ticket. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center space-x-2">
              <Ticket className="w-6 h-6 text-blue-600" />
              <span>Create New Support Ticket</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Subject *
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="feature">Feature Request</option>
                  <option value="integration">Integration</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Priority
              </label>
              <div className="flex space-x-2">
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      priority === p
                        ? getPriorityColor(p)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Description *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about your issue, including steps to reproduce if applicable..."
                required
                rows={6}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload files or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, PDF, DOC up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Our team typically responds within 2-4 hours</span>
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Ticket
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTicketPopup;