import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, User, Building, Mail, Phone, Globe, MapPin, Zap, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ExtractedContact {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  website?: string;
  address?: string;
}

interface ProcessingResult {
  success: boolean;
  contact: ExtractedContact;
  hubspotContactId?: string;
  automationsCompleted: {
    ocrExtraction: boolean;
    duplicateCheck: boolean;
    hubspotPush: boolean;
    sourceTagging: boolean;
    followUpTask: boolean;
    dealCreation: boolean;
    workflowEnrollment: boolean;
    googleSheetsBackup: boolean;
    airtableLogging: boolean;
    statusLabeling: boolean;
  };
}

export default function Mobile() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedContact, setExtractedContact] = useState<ExtractedContact | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;
      const base64Data = base64Image.split(',')[1];
      setCapturedImage(base64Image);
      await processBusinessCard(base64Data);
    };
    reader.readAsDataURL(file);
  }, []);

  const processBusinessCard = async (base64Image: string) => {
    setIsProcessing(true);
    setCurrentStep('Extracting text from business card...');
    
    try {
      const response = await apiRequest('POST', '/api/business-card-ocr', {
        imageBase64: base64Image
      });

      if (response.ok) {
        const result: ProcessingResult = await response.json();
        setExtractedContact(result.contact);
        setProcessingResult(result);
        
        toast({
          title: "Business card processed successfully",
          description: `Contact ${result.contact.name} has been added to your CRM`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.details || 'Processing failed');
      }
    } catch (error: any) {
      console.error('Business card processing failed:', error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process business card",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setExtractedContact(null);
    setProcessingResult(null);
    setCurrentStep('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const automationSteps = [
    { key: 'ocrExtraction', label: 'OCR Text Extraction', icon: Camera },
    { key: 'duplicateCheck', label: 'Duplicate Prevention', icon: AlertCircle },
    { key: 'hubspotPush', label: 'HubSpot Contact Creation', icon: User },
    { key: 'sourceTagging', label: 'Source Tagging', icon: Building },
    { key: 'followUpTask', label: 'Follow-up Task Creation', icon: Check },
    { key: 'dealCreation', label: 'Deal Creation', icon: Zap },
    { key: 'workflowEnrollment', label: 'Workflow Enrollment', icon: Mail },
    { key: 'googleSheetsBackup', label: 'Google Sheets Backup', icon: Globe },
    { key: 'airtableLogging', label: 'Airtable Event Logging', icon: MapPin },
    { key: 'statusLabeling', label: 'Status Tracking', icon: Badge }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            YoBot® Mobile Center
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Business Card Scanner
          </p>
        </div>

        {/* Camera/Upload Section */}
        {!capturedImage && (
          <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600">
            <CardContent className="p-8 text-center space-y-4">
              <Camera className="h-16 w-16 text-blue-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Scan Business Card
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Upload a photo of a business card to extract contact information
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">{currentStep}</p>
            </CardContent>
          </Card>
        )}

        {/* Captured Image */}
        {capturedImage && !isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Captured Image
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCapture}
                >
                  New Scan
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={capturedImage}
                alt="Business card"
                className="w-full rounded-lg shadow-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Extracted Contact Information */}
        {extractedContact && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {extractedContact.name && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">{extractedContact.name}</span>
                </div>
              )}
              {extractedContact.title && (
                <div className="flex items-center">
                  <Badge className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{extractedContact.title}</span>
                </div>
              )}
              {extractedContact.company && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{extractedContact.company}</span>
                </div>
              )}
              {extractedContact.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <a href={`mailto:${extractedContact.email}`} className="text-blue-600 hover:underline">
                    {extractedContact.email}
                  </a>
                </div>
              )}
              {extractedContact.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <a href={`tel:${extractedContact.phone}`} className="text-blue-600 hover:underline">
                    {extractedContact.phone}
                  </a>
                </div>
              )}
              {extractedContact.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  <a href={extractedContact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {extractedContact.website}
                  </a>
                </div>
              )}
              {extractedContact.address && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{extractedContact.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Automation Results */}
        {processingResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Automation Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {automationSteps.map(({ key, label, icon: Icon }) => {
                  const completed = processingResult.automationsCompleted[key as keyof typeof processingResult.automationsCompleted];
                  return (
                    <div key={key} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{label}</span>
                      </div>
                      {completed ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Skipped
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {processingResult.hubspotContactId && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Contact successfully added to HubSpot CRM
                    <br />
                    <span className="font-mono text-xs">ID: {processingResult.hubspotContactId}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}