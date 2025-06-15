import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, User, Building, Mail, MapPin, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CreateVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateVoiceCallModal({ isOpen, onClose }: CreateVoiceCallModalProps) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    contactName: '',
    company: '',
    email: '',
    script: '',
    voiceId: 'default',
    priority: 'medium',
    callType: 'sales',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.phoneNumber || !formData.script) {
      toast({
        title: "Missing Information",
        description: "Phone number and script are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('/api/voice-call/create', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          contactName: formData.contactName,
          company: formData.company,
          email: formData.email,
          script: formData.script,
          voiceId: formData.voiceId,
          priority: formData.priority,
          callType: formData.callType,
          notes: formData.notes
        })
      });

      if (response.success) {
        toast({
          title: "Voice Call Created",
          description: `Call ${response.callId} has been queued successfully`
        });
        onClose();
        setFormData({
          phoneNumber: '',
          contactName: '',
          company: '',
          email: '',
          script: '',
          voiceId: 'default',
          priority: 'medium',
          callType: 'sales',
          notes: ''
        });
      } else {
        throw new Error(response.error || 'Call creation failed');
      }
    } catch (error: any) {
      toast({
        title: "Call Creation Failed",
        description: error.message || "Unable to create voice call",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Create Voice Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Name
                </Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@acme.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Call Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Call Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="callType">Call Type</Label>
                <Select value={formData.callType} onValueChange={(value) => handleInputChange('callType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Call</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voiceId">Voice</Label>
                <Select value={formData.voiceId} onValueChange={(value) => handleInputChange('voiceId', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Voice</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Script and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="script">Call Script *</Label>
              <Textarea
                id="script"
                placeholder="Enter the script for the voice call..."
                value={formData.script}
                onChange={(e) => handleInputChange('script', e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or context for this call..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.phoneNumber || !formData.script}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Creating Call...' : 'Create Voice Call'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}