import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileText, Upload, Mail, MessageSquare, PenTool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SalesOrderProcessorProps {
  onProcessComplete?: (result: any) => void;
}

export function SalesOrderProcessor({ onProcessComplete }: SalesOrderProcessorProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    serviceType: 'Professional AI Bot Package',
    monthlyFee: 2500,
    setupFee: 1500,
    totalFirstMonth: 4000
  });
  
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/process-sales-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: "Sales Order Processed",
          description: `Complete pipeline executed for ${formData.companyName}`,
        });
        onProcessComplete?.(data);
      } else {
        toast({
          title: "Processing Failed", 
          description: data.error || 'Sales order processing failed',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: `Failed to process sales order: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const pipelineSteps = [
    { id: 'pdf', label: 'PDF Generation', icon: FileText, status: result?.pipeline?.pdfGenerated },
    { id: 'drive', label: 'Google Drive Upload', icon: Upload, status: result?.pipeline?.driveUploaded },
    { id: 'email', label: 'Email Notification', icon: Mail, status: result?.pipeline?.emailSent },
    { id: 'slack', label: 'Slack Alert', icon: MessageSquare, status: result?.pipeline?.slackNotified },
    { id: 'docusign', label: 'DocuSign Queue', icon: PenTool, status: result?.pipeline?.docusignQueued },
    { id: 'airtable', label: 'Airtable Sync', icon: CheckCircle, status: result?.pipeline?.airtableSynced }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Complete Sales Order Processing Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Acme Corporation"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
              placeholder="John Smith"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@acme.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="555-123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://acme.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <select
              id="serviceType"
              value={formData.serviceType}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Standard AI Bot Package">Standard AI Bot Package</option>
              <option value="Professional AI Bot Package">Professional AI Bot Package</option>
              <option value="Enterprise AI Bot Package">Enterprise AI Bot Package</option>
              <option value="Custom Integration Package">Custom Integration Package</option>
            </select>
          </div>
          
          <div className="col-span-full">
            <Button
              type="submit"
              disabled={processing}
              className="w-full"
            >
              {processing ? 'Processing Sales Order...' : 'Process Complete Sales Order'}
            </Button>
          </div>
        </form>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pipelineSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{step.label}</span>
                    {step.status === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {step.status === false && <XCircle className="h-4 w-4 text-red-500" />}
                    {step.status === undefined && <Clock className="h-4 w-4 text-gray-400" />}
                  </div>
                );
              })}
            </div>

            {result.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">Sales Order Processed Successfully</h3>
                <p className="text-green-700">Quote ID: {result.quoteId}</p>
                {result.driveLink && (
                  <p className="text-green-700">
                    Drive Link: <a href={result.driveLink} target="_blank" rel="noopener noreferrer" className="underline">View Quote</a>
                  </p>
                )}
              </div>
            )}

            {!result.success && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800">Processing Failed</h3>
                <p className="text-red-700">{result.error}</p>
                {result.partialSuccess && (
                  <div className="mt-2">
                    <Badge variant="secondary">Partial Success: Quote Generated</Badge>
                    <p className="text-sm text-red-600">Quote ID: {result.partialSuccess.quoteId}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}