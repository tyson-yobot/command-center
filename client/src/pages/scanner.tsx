import BusinessCardScanner from "@/components/business-card-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building2, Mail, Phone, Globe } from "lucide-react";
import type { ScannedContact } from "@shared/schema";

export default function Scanner() {
  const { data: scannedContacts, isLoading } = useQuery<ScannedContact[]>({
    queryKey: ["/api/scanned-contacts"],
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-black text-white">
            📷 Business Card Scanner
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
            Instantly capture and digitize business cards with AI-powered OCR. 
            Automatically populate your CRM with contact information from networking events.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Scanner Component */}
          <div>
            <BusinessCardScanner />
          </div>

          {/* Recent Scanned Contacts */}
          <Card className="bg-slate-800 border-slate-600 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                📋 Recent Scanned Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : scannedContacts && scannedContacts.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {scannedContacts.slice(0, 10).map((contact) => (
                    <div 
                      key={contact.id} 
                      className="border border-slate-600 bg-slate-700 rounded-lg p-4 hover:shadow-md hover:bg-slate-600 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          {contact.title && (
                            <p className="text-sm text-slate-300">
                              {contact.title}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={contact.status === "processed" ? "default" : "secondary"}
                          className={contact.status === "processed" 
                            ? "bg-green-600 text-white" 
                            : "bg-yellow-600 text-white"
                          }
                        >
                          {contact.status === "processed" ? "✅ Processed" : "⏳ Pending"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {contact.company && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Building2 className="h-3 w-3" />
                            <span>{contact.company}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail className="h-3 w-3" />
                            <span className="text-blue-400">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.website && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Globe className="h-3 w-3" />
                            <span className="text-blue-400">{contact.website}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          Scanned {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">
                    No Scanned Contacts Yet
                  </h3>
                  <p className="text-sm text-slate-400">
                    Use the scanner to start capturing business card contacts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-blue-900/30 border-blue-500/50 shadow-xl">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-blue-200 mb-2">Smart OCR Extraction</h3>
              <p className="text-sm text-blue-300">
                Advanced AI automatically detects and extracts names, companies, emails, phones, and more
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-900/30 border-green-500/50 shadow-xl">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-green-200 mb-2">CRM Integration</h3>
              <p className="text-sm text-green-300">
                Contacts automatically sync to your CRM pipeline and Make automation workflows
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-900/30 border-purple-500/50 shadow-xl">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-3">✏️</div>
              <h3 className="font-semibold text-purple-200 mb-2">Review & Edit</h3>
              <p className="text-sm text-purple-300">
                Review extracted data before saving, with easy editing for accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}