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
        id: Date.now().toString(),
        title: "Missing Information",
        description: "Phone number and script are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Log to Command Center Metrics first
      await fetch('/api/command-center/manual-call-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: 'User',
          callData: {
            phoneNumber: formData.phoneNumber,
            contactName: formData.contactName,
            company: formData.company,
            callType: formData.callType,
            priority: formData.priority
          }
        })
      });

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
          id: Date.now().toString(),
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
        id: Date.now().toString(),
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-900/85 backdrop-blur-xl border border-blue-400/30 shadow-2xl shadow-blue-500/20" style={{ backdropFilter: 'blur(10px)' }}>
        <DialogHeader className="pb-6 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            Manual Call · Voice Ops
          </DialogTitle>
          <p className="text-slate-300 mt-2 text-sm">Configure and launch a new voice call with advanced targeting options</p>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* 📞 Contact Info Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold flex items-center gap-3 text-white mb-5">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              📞 Contact Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <Phone className="w-4 h-4 text-blue-400" />
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="bg-slate-700/50 border border-white/10 text-white text-base p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="contactName" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <User className="w-4 h-4 text-blue-400" />
                  Contact Name
                </Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="bg-slate-700/50 border border-white/10 text-white text-base p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <Mail className="w-4 h-4 text-blue-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@acme.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-slate-700/50 border border-white/10 text-white text-base p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="company" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <Building className="w-4 h-4 text-blue-400" />
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="bg-slate-700/50 border border-white/10 text-white text-base p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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