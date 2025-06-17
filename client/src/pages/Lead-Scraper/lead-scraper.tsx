import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Download, 
  Users, 
  Globe, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScrapedLead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  location: string;
  source: string;
}

export default function LeadScraper() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [isScrapingLinkedIn, setIsScrapingLinkedIn] = useState(false);
  const [isScrapingGoogle, setIsScrapingGoogle] = useState(false);
  const [isSavingToAirtable, setIsSavingToAirtable] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([]);
  const [progress, setProgress] = useState(0);
  const [totalFound, setTotalFound] = useState(0);
  const { toast } = useToast();

  const handleLinkedInScrape = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query to begin scraping",
        variant: "destructive"
      });
      return;
    }

    setIsScrapingLinkedIn(true);
    setProgress(0);
    setScrapedLeads([]);

    try {
      const response = await fetch('/api/scraper/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          industry,
          location,
          companySize,
          maxResults: 100
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setScrapedLeads(data.data.leads);
        setTotalFound(data.data.leads.length);
        setProgress(100);
        
        toast({
          title: "LinkedIn Scraping Complete",
          description: `Found ${data.data.leads.length} potential leads`
        });
      } else {
        throw new Error(data.error || 'LinkedIn scraping failed');
      }
    } catch (error) {
      console.error('LinkedIn scraping error:', error);
      toast({
        title: "LinkedIn Scraping Failed",
        description: error.message || "Unable to complete LinkedIn search",
        variant: "destructive"
      });
    } finally {
      setIsScrapingLinkedIn(false);
    }
  };

  const handleGoogleScrape = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query to begin scraping",
        variant: "destructive"
      });
      return;
    }

    setIsScrapingGoogle(true);
    setProgress(0);

    try {
      const response = await fetch('/api/scraper/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery + (location ? ` ${location}` : ''),
          industry,
          maxResults: 50
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const combinedLeads = [...scrapedLeads, ...data.data.leads];
        setScrapedLeads(combinedLeads);
        setTotalFound(combinedLeads.length);
        setProgress(100);
        
        toast({
          title: "Google Scraping Complete",
          description: `Added ${data.data.leads.length} more leads from Google`
        });
      } else {
        throw new Error(data.error || 'Google scraping failed');
      }
    } catch (error) {
      console.error('Google scraping error:', error);
      toast({
        title: "Google Scraping Failed",
        description: error.message || "Unable to complete Google search",
        variant: "destructive"
      });
    } finally {
      setIsScrapingGoogle(false);
    }
  };

  const handleSaveToAirtable = async () => {
    if (scrapedLeads.length === 0) {
      toast({
        title: "No Leads to Save",
        description: "Please scrape some leads first",
        variant: "destructive"
      });
      return;
    }

    setIsSavingToAirtable(true);

    try {
      const response = await fetch('/api/airtable/scrape-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Lead Scraper Tool',
          leads: scrapedLeads
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Leads Saved Successfully",
          description: `${data.data.leadsCreated} leads saved to Scraped Leads (Universal) table`
        });
        
        // Clear the scraped leads after successful save
        setScrapedLeads([]);
        setTotalFound(0);
        setProgress(0);
      } else {
        throw new Error(data.error || 'Failed to save leads to Airtable');
      }
    } catch (error) {
      console.error('Save to Airtable error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Unable to save leads to Airtable",
        variant: "destructive"
      });
    } finally {
      setIsSavingToAirtable(false);
    }
  };

  const handleExportCSV = () => {
    if (scrapedLeads.length === 0) {
      toast({
        title: "No Leads to Export",
        description: "Please scrape some leads first",
        variant: "destructive"
      });
      return;
    }

    const csvHeader = 'First Name,Last Name,Email,Phone,Company,Title,Location,Source\n';
    const csvData = scrapedLeads.map(lead => 
      `"${lead.firstName}","${lead.lastName}","${lead.email}","${lead.phone}","${lead.company}","${lead.title}","${lead.location}","${lead.source}"`
    ).join('\n');

    const blob = new Blob([csvHeader + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "CSV Export Complete",
      description: `Exported ${scrapedLeads.length} leads to CSV file`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Lead Scraper</h1>
          <p className="text-slate-300 mt-2">Search and collect leads from LinkedIn, Google, and other sources</p>
        </div>
        <Badge className="bg-cyan-600 text-white px-4 py-2 text-sm">
          <Database className="w-4 h-4 mr-2" />
          Saves to Scraped Leads (Universal)
        </Badge>
      </div>

      {/* Search Configuration */}
      <Card className="bg-slate-800/50 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search Query *</label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Marketing Director, Software Engineer, CEO"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, California, Remote"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Size</label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="startup">Startup (1-10)</SelectItem>
                  <SelectItem value="small">Small (11-50)</SelectItem>
                  <SelectItem value="medium">Medium (51-200)</SelectItem>
                  <SelectItem value="large">Large (201-1000)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Actions */}
      <Card className="bg-slate-800/50 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Scraping Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleLinkedInScrape}
              disabled={isScrapingLinkedIn || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white h-16"
            >
              {isScrapingLinkedIn ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Globe className="w-5 h-5 mr-2" />
              )}
              {isScrapingLinkedIn ? 'Scraping LinkedIn...' : 'Scrape LinkedIn'}
            </Button>
            
            <Button
              onClick={handleGoogleScrape}
              disabled={isScrapingGoogle || !searchQuery.trim()}
              className="bg-green-600 hover:bg-green-700 text-white h-16"
            >
              {isScrapingGoogle ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              {isScrapingGoogle ? 'Scraping Google...' : 'Scrape Google'}
            </Button>
          </div>

          {(isScrapingLinkedIn || isScrapingGoogle) && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Scraping Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {scrapedLeads.length > 0 && (
        <Card className="bg-slate-800/50 border border-slate-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Scraped Leads ({totalFound})
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={handleSaveToAirtable}
                  disabled={isSavingToAirtable}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSavingToAirtable ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  {isSavingToAirtable ? 'Saving...' : 'Save to Airtable'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scrapedLeads.map((lead, index) => (
                <div key={index} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="font-medium text-white">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-slate-300">{lead.title}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-slate-300 mb-1">
                        <Building className="w-3 h-3 mr-1" />
                        {lead.company}
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <MapPin className="w-3 h-3 mr-1" />
                        {lead.location}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-slate-300 mb-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {lead.email}
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Phone className="w-3 h-3 mr-1" />
                        {lead.phone}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-slate-800/50 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Usage Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <p>• Enter a specific search query (job titles, industries, or keywords)</p>
          <p>• Use filters to narrow down your search by industry, location, and company size</p>
          <p>• Scrape from LinkedIn for professional profiles and Google for business contacts</p>
          <p>• All scraped leads are automatically saved to the "Scraped Leads (Universal)" Airtable</p>
          <p>• Pipeline calls will pull leads from this same Airtable for maximum efficiency</p>
        </CardContent>
      </Card>
    </div>
  );
}