import { useState, useRef } from "react";
import { Camera, Upload, Check, X, Loader2, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ExtractedContact {
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

interface ScanResult {
  success: boolean;
  contact: ExtractedContact & { id: number; rawText: string };
  extractedText: string;
}

export default function BusinessCardScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedContact, setExtractedContact] = useState<ExtractedContact | null>(null);
  const [editableContact, setEditableContact] = useState<ExtractedContact | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const processBusinessCard = async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    setShowPreview(false);

    try {
      const response = await apiRequest("/api/scan-business-card", {
        method: "POST",
        body: JSON.stringify({ imageData: capturedImage }),
        headers: {
          "Content-Type": "application/json",
        },
      }) as ScanResult;

      if (response.success) {
        setExtractedContact(response.contact);
        setEditableContact({...response.contact});
        setRawText(response.extractedText);
        setShowReviewDialog(true);
        toast({
          title: "✅ Business Card Scanned!",
          description: `Successfully extracted contact info for ${response.contact.firstName || 'Unknown'} ${response.contact.lastName || ''}`.trim(),
        });
      }
    } catch (error) {
      toast({
        title: "❌ Scan Failed",
        description: "Failed to process business card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveContact = async () => {
    toast({
      title: "💾 Contact Saved",
      description: "Business card contact added to your CRM pipeline!",
    });
    setShowReviewDialog(false);
    resetScanner();
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setExtractedContact(null);
    setEditableContact(null);
    setRawText("");
    setShowPreview(false);
    setShowReviewDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200">
            📷 Business Card Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scanner Controls */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={triggerCamera}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 flex items-center justify-center gap-2 transform transition hover:scale-105"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Card...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Scan Business Card
                </>
              )}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
          </div>

          {/* Status Information */}
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="font-medium mb-1">📱 How it works:</div>
            <div>1. Tap "Scan Business Card"</div>
            <div>2. Take photo or upload card image</div>
            <div>3. Review & edit extracted info</div>
            <div>4. Save to CRM pipeline</div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>📸 Preview Business Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {capturedImage && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured business card"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Does this look good? We'll extract the contact information automatically.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetScanner}>
              <X className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button onClick={processBusinessCard} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              Process Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Review & Edit Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Review & Edit Contact Information
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Extracted Contact Form */}
            {editableContact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editableContact.firstName || ""}
                    onChange={(e) => setEditableContact({...editableContact, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editableContact.lastName || ""}
                    onChange={(e) => setEditableContact({...editableContact, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={editableContact.company || ""}
                    onChange={(e) => setEditableContact({...editableContact, company: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={editableContact.title || ""}
                    onChange={(e) => setEditableContact({...editableContact, title: e.target.value})}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editableContact.email || ""}
                    onChange={(e) => setEditableContact({...editableContact, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editableContact.phone || ""}
                    onChange={(e) => setEditableContact({...editableContact, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editableContact.website || ""}
                    onChange={(e) => setEditableContact({...editableContact, website: e.target.value})}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
            )}

            {/* Raw OCR Text Preview */}
            {rawText && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <Label>Raw Scanned Text</Label>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono max-h-32 overflow-y-auto">
                  {rawText}
                </div>
              </div>
            )}

            {/* Source Tag */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                📱 Scanned via Business Card
              </Badge>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Save to CRM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}