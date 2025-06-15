import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, User, Building, Mail, MessageSquare, Volume2 } from 'lucide-react';

interface ManualCallStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualCallStartModal({ isOpen, onClose }: ManualCallStartModalProps) {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    company: '',
    email: '',
    call_type: '',
    priority: 'Medium',
    voice_profile: 'Default Voice',
    script: '',
    notes: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callTypes = [
    'Sales Call',
    'Support Call',
    'Follow-up Call',
    'Lead Qualification',
    'Customer Check-in',
    'Appointment Reminder',
    'Survey Call'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  
  const voiceProfiles = [
    'Default Voice',
    'Professional Male',
    'Professional Female',
    'Friendly Assistant',
    'Executive Voice'
  ];

  const defaultScripts = {
    'Sales Call': 'Hello, this is YoBot calling from [Company]. I wanted to follow up on your recent inquiry about our services. Do you have a moment to discuss how we can help your business?',
    'Support Call': 'Hi, this is YoBot from customer support. I\'m calling to follow up on your recent support request. How can I assist you today?',
    'Follow-up Call': 'Hello, this is YoBot calling to follow up on our previous conversation. I wanted to check if you had any questions or if there\'s anything else I can help you with.',
    'Lead Qualification': 'Hi, this is YoBot calling to learn more about your business needs. I\'d like to ask a few quick questions to see how we might be able to help you.',
    'Customer Check-in': 'Hello, this is YoBot calling for a quick customer check-in. How has your experience been with our service so far?',
    'Appointment Reminder': 'Hi, this is YoBot calling to confirm your upcoming appointment. Please let me know if you need to make any changes.',
    'Survey Call': 'Hello, this is YoBot calling to get your feedback on our recent service. Would you have a few minutes for a brief survey?'
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.name.trim()) newErrors.name = 'Contact name is required';
    if (!formData.call_type) newErrors.call_type = 'Call type is required';
    if (!formData.voice_profile) newErrors.voice_profile = 'Voice profile is required';
    if (!formData.script.trim()) newErrors.script = 'Script is required';
    
    // Phone validation
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCallTypeChange = (callType: string) => {
    setFormData(prev => ({
      ...prev,
      call_type: callType,
      script: defaultScripts[callType as keyof typeof defaultScripts] || prev.script
    }));
  };

  const handleUseSuggestedScript = () => {
    if (formData.call_type && defaultScripts[formData.call_type as keyof typeof defaultScripts]) {
      setFormData(prev => ({
        ...prev,
        script: defaultScripts[formData.call_type as keyof typeof defaultScripts]
      }));
    }
  };

  const handleCreateCall = async () => {
    if (!validateForm()) return;
    
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/create-manual-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Call created successfully! Call ID: ${result.callId}\n\nStatus: ${result.message}`);
        setFormData({
          phone: '',
          name: '',
          company: '',
          email: '',
          call_type: '',
          priority: 'Medium',
          voice_profile: 'Default Voice',
          script: '',
          notes: ''
        });
        onClose();
      } else {
        alert(`Failed to create call: ${result.error}`);
      }
    } catch (error) {
      console.error('Call creation error:', error);
      alert('Failed to create call. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Manual Call Start
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <Label htmlFor="name" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Contact Name *
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                Company
              </Label>
              <Input
                id="company"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@acme.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Call Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="call_type">Call Type *</Label>
              <Select value={formData.call_type} onValueChange={handleCallTypeChange}>
                <SelectTrigger className={errors.call_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select call type" />
                </SelectTrigger>
                <SelectContent>
                  {callTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.call_type && <p className="text-red-500 text-xs mt-1">{errors.call_type}</p>}
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="voice_profile" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              Voice Profile *
            </Label>
            <Select value={formData.voice_profile} onValueChange={(value) => handleInputChange('voice_profile', value)}>
              <SelectTrigger className={errors.voice_profile ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voiceProfiles.map((profile) => (
                  <SelectItem key={profile} value={profile}>
                    {profile}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.voice_profile && <p className="text-red-500 text-xs mt-1">{errors.voice_profile}</p>}
          </div>

          {/* Script Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="script" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Call Script *
              </Label>
              {formData.call_type && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseSuggestedScript}
                >
                  Use Suggested Script
                </Button>
              )}
            </div>
            <Textarea
              id="script"
              placeholder="Enter the script for the voice call..."
              value={formData.script}
              onChange={(e) => handleInputChange('script', e.target.value)}
              rows={4}
              className={errors.script ? 'border-red-500' : ''}
            />
            {errors.script && <p className="text-red-500 text-xs mt-1">{errors.script}</p>}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes for internal logging..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateCall} disabled={isCreating}>
            {isCreating ? 'Creating Call...' : 'Create Call'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}