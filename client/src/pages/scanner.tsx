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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            📷 Business Card Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                📋 Recent Scanned Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : scannedContacts && scannedContacts.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {scannedContacts.slice(0, 10).map((contact) => (
                    <div 
                      key={contact.id} 
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          {contact.title && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.title}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={contact.status === "processed" ? "default" : "secondary"}
                          className={contact.status === "processed" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }
                        >
                          {contact.status === "processed" ? "✅ Processed" : "⏳ Pending"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {contact.company && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Building2 className="h-3 w-3" />
                            <span>{contact.company}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span className="text-blue-600 dark:text-blue-400">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.website && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Globe className="h-3 w-3" />
                            <span className="text-blue-600 dark:text-blue-400">{contact.website}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          Scanned {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Scanned Contacts Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Use the scanner to start capturing business card contacts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Smart OCR Extraction</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Advanced AI automatically detects and extracts names, companies, emails, phones, and more
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">CRM Integration</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Contacts automatically sync to your CRM pipeline and Make automation workflows
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-3">✏️</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Review & Edit</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Review extracted data before saving, with easy editing for accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}