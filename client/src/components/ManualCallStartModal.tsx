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
    'Sales Call': 'Hi [Name], this is [Your Name] from [Company]. I wanted to reach out because we have a solution that could help your business...',
    'Support Call': 'Hello [Name], this is [Your Name] from [Company] support. I\'m calling regarding your recent inquiry...',
    'Follow-up Call': 'Hi [Name], this is [Your Name] following up on our previous conversation about...',
    'Lead Qualification': 'Hello [Name], I\'m [Your Name] from [Company]. I understand you\'re interested in...',
    'Customer Check-in': 'Hi [Name], this is [Your Name] from [Company]. I wanted to check in and see how everything is going...',
    'Appointment Reminder': 'Hello [Name], this is [Your Name] calling to remind you about your appointment...',
    'Survey Call': 'Hi [Name], this is [Your Name] from [Company]. We\'d appreciate a few minutes of your time for a brief survey...'
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Contact name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.call_type) {
      newErrors.call_type = 'Call type is required';
    }

    if (!formData.voice_profile) {
      newErrors.voice_profile = 'Voice profile is required';
    }

    if (!formData.script.trim()) {
      newErrors.script = 'Call script is required';
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-900/85 backdrop-blur-xl border border-blue-400/30 shadow-2xl shadow-blue-500/20 px-6 py-5" style={{ backdropFilter: 'blur(10px)' }}>
        <DialogHeader className="pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            Manual Call · Voice Ops
          </DialogTitle>
          <p className="text-slate-300 mt-2 text-sm">Configure and launch a new voice call with advanced targeting options</p>
        </DialogHeader>

        <div className="space-y-5 mt-5">
          {/* Contact Info Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 mb-5">
            <h3 className="text-lg font-semibold flex items-center gap-3 text-white mb-4">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
              📞 Contact Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 px-4 py-3">
                <Label htmlFor="phone" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <Phone className="h-4 w-4 text-blue-400" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`bg-slate-700/50 border border-white/10 text-white text-base px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2 px-4 py-3">
                <Label htmlFor="name" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <User className="h-4 w-4 text-blue-400" />
                  Contact Name *
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`bg-slate-700/50 border border-white/10 text-white text-base px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div className="space-y-2 px-4 py-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <Mail className="h-4 w-4 text-blue-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@acme.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`bg-slate-700/50 border border-white/10 text-white text-base px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-2 px-4 py-3">
                <Label htmlFor="company" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <Building className="h-4 w-4 text-blue-400" />
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="bg-slate-700/50 border border-white/10 text-white text-base px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Call Details Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 mb-5 mt-5">
            <h3 className="text-lg font-semibold flex items-center gap-3 text-white mb-4">
              <div className="p-1.5 bg-orange-500/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-orange-400" />
              </div>
              🗣️ Call Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 px-4 py-3">
                <Label htmlFor="call_type" className="text-slate-200 font-medium text-base">Call Type *</Label>
                <Select value={formData.call_type} onValueChange={handleCallTypeChange}>
                  <SelectTrigger className={`bg-slate-700/50 border border-white/10 text-white px-4 py-3 ${errors.call_type ? 'border-red-500' : ''}`}>
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
                {errors.call_type && <p className="text-red-400 text-sm mt-1">{errors.call_type}</p>}
              </div>
              
              <div className="space-y-2 px-4 py-3">
                <Label htmlFor="priority" className="text-slate-200 font-medium text-base">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="bg-slate-700/50 border border-white/10 text-white px-4 py-3">
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
              
              <div className="space-y-2 px-4 py-3">
                <Label htmlFor="voice_profile" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <Volume2 className="h-4 w-4 text-orange-400" />
                  Voice Profile *
                </Label>
                <Select value={formData.voice_profile} onValueChange={(value) => handleInputChange('voice_profile', value)}>
                  <SelectTrigger className={`bg-slate-700/50 border border-white/10 text-white px-4 py-3 ${errors.voice_profile ? 'border-red-500' : ''}`}>
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
                {errors.voice_profile && <p className="text-red-400 text-sm mt-1">{errors.voice_profile}</p>}
              </div>
            </div>
            
            <div className="mt-5 space-y-2 px-4 py-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="script" className="flex items-center gap-2 text-slate-200 font-medium text-base">
                  <MessageSquare className="h-4 w-4 text-orange-400" />
                  Call Script *
                </Label>
                {formData.call_type && defaultScripts[formData.call_type as keyof typeof defaultScripts] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseSuggestedScript}
                    className="bg-slate-700/50 border border-white/10 text-white hover:bg-slate-600/50 px-4 py-2"
                  >
                    Use Suggested Script
                  </Button>
                )}
              </div>
              <Textarea
                id="script"
                placeholder="Enter the call script or talking points..."
                value={formData.script}
                onChange={(e) => handleInputChange('script', e.target.value)}
                className={`bg-slate-700/50 border border-white/10 text-white min-h-[100px] resize-y px-4 py-3 ${errors.script ? 'border-red-500' : ''}`}
              />
              {errors.script && <p className="text-red-400 text-sm mt-1">{errors.script}</p>}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 mb-5 mt-5">
            <h3 className="text-lg font-semibold flex items-center gap-3 text-white mb-4">
              <div className="p-1.5 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              📝 Notes
            </h3>
            
            <div className="space-y-2 px-4 py-3">
              <Label htmlFor="notes" className="text-slate-200 font-medium text-base">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or context for this call..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="bg-slate-700/50 border border-white/10 text-white min-h-[80px] resize-y px-4 py-3"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="py-4 px-6 border-t border-white/10">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-slate-700/50 border border-white/10 text-white hover:bg-slate-600/50 min-w-[120px] px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCall} 
            disabled={isCreating}
            className="btn-yobot-green min-w-[120px] px-8 py-2.5"
          >
            {isCreating ? 'Creating Call...' : 'Create Call'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}