import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Database, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  source: string;
  timestamp: string;
  synced: boolean;
  isDuplicate: boolean;
}

export default function LeadScrapingPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [apolloEnriching, setApolloEnriching] = useState(false);
  const { toast } = useToast();

  // Single lead processing form
  const [singleLead, setSingleLead] = useState({
    first_name: '',
    last_name: '',
    company: '',
    domain: '',
    email: '',
    phone: '',
    source: 'Manual Entry'
  });

  // Batch processing
  const [batchLeads, setBatchLeads] = useState('');

  // Apollo enrichment
  const [apolloData, setApolloData] = useState({
    firstName: '',
    lastName: '',
    domain: ''
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/scraping/leads');
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads);
      } else {
        toast({
          title: "Failed to load leads",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading leads",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const processSingleLead = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/scraping/process-lead', singleLead);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Lead processed successfully",
          description: data.message
        });
        setSingleLead({
          first_name: '',
          last_name: '',
          company: '',
          domain: '',
          email: '',
          phone: '',
          source: 'Manual Entry'
        });
        await loadLeads();
      } else {
        toast({
          title: "Processing failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error processing lead",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processBatchLeads = async () => {
    try {
      setBatchProcessing(true);
      
      // Parse batch leads from textarea
      const leadsArray = batchLeads.split('\n').map(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 4) {
          return {
            first_name: parts[0],
            last_name: parts[1],
            company: parts[2],
            domain: parts[3],
            email: parts[4] || '',
            phone: parts[5] || '',
            source: 'Batch Import'
          };
        }
        return null;
      }).filter(Boolean);

      const response = await apiRequest('POST', '/api/scraping/batch-process', { leads: leadsArray });
      const data = await response.json();
      
      toast({
        title: "Batch processing completed",
        description: `Processed: ${data.processed}, Failed: ${data.failed}`
      });
      
      setBatchLeads('');
      await loadLeads();
    } catch (error: any) {
      toast({
        title: "Batch processing failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setBatchProcessing(false);
    }
  };

  const enrichWithApollo = async () => {
    try {
      setApolloEnriching(true);
      const response = await apiRequest('POST', '/api/apollo/enrich', apolloData);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Apollo enrichment successful",
          description: `Found: ${data.data.email || 'No email'}, ${data.data.phone || 'No phone'}`
        });
        
        // Auto-populate single lead form with enriched data
        setSingleLead(prev => ({
          ...prev,
          first_name: apolloData.firstName,
          last_name: apolloData.lastName,
          domain: apolloData.domain,
          email: data.data.email || prev.email,
          phone: data.data.phone || prev.phone
        }));
      } else {
        toast({
          title: "Enrichment failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Apollo enrichment error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setApolloEnriching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Single Lead Processing */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-lime-500" />
            Single Lead Processing
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Process individual leads through the complete automation pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-black dark:text-white">First Name</Label>
              <Input
                value={singleLead.first_name}
                onChange={(e) => setSingleLead(prev => ({ ...prev, first_name: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Last Name</Label>
              <Input
                value={singleLead.last_name}
                onChange={(e) => setSingleLead(prev => ({ ...prev, last_name: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Company</Label>
              <Input
                value={singleLead.company}
                onChange={(e) => setSingleLead(prev => ({ ...prev, company: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Domain</Label>
              <Input
                value={singleLead.domain}
                onChange={(e) => setSingleLead(prev => ({ ...prev, domain: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Email (Optional)</Label>
              <Input
                value={singleLead.email}
                onChange={(e) => setSingleLead(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Phone (Optional)</Label>
              <Input
                value={singleLead.phone}
                onChange={(e) => setSingleLead(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          <div>
            <Label className="text-black dark:text-white">Source</Label>
            <Select value={singleLead.source} onValueChange={(value) => setSingleLead(prev => ({ ...prev, source: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                <SelectItem value="Apollo">Apollo</SelectItem>
                <SelectItem value="PhantomBuster">PhantomBuster</SelectItem>
                <SelectItem value="Apify">Apify</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={processSingleLead} 
            disabled={loading || !singleLead.first_name || !singleLead.last_name}
            className="w-full bg-lime-500 hover:bg-lime-600 text-white"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Process Lead
          </Button>
        </CardContent>
      </Card>

      {/* Apollo Enrichment */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-lime-500" />
            Apollo Enrichment
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enrich lead data using Apollo API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-black dark:text-white">First Name</Label>
              <Input
                value={apolloData.firstName}
                onChange={(e) => setApolloData(prev => ({ ...prev, firstName: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Last Name</Label>
              <Input
                value={apolloData.lastName}
                onChange={(e) => setApolloData(prev => ({ ...prev, lastName: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Domain</Label>
              <Input
                value={apolloData.domain}
                onChange={(e) => setApolloData(prev => ({ ...prev, domain: e.target.value }))}
                className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          <Button 
            onClick={enrichWithApollo} 
            disabled={apolloEnriching || !apolloData.firstName || !apolloData.lastName || !apolloData.domain}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {apolloEnriching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Enrich with Apollo
          </Button>
        </CardContent>
      </Card>

      {/* Batch Processing */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-lime-500" />
            Batch Lead Processing
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Process multiple leads at once (CSV format: FirstName, LastName, Company, Domain, Email, Phone)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-black dark:text-white">Batch Leads (One per line)</Label>
            <Textarea
              value={batchLeads}
              onChange={(e) => setBatchLeads(e.target.value)}
              placeholder="John, Doe, Acme Corp, acme.com, john@acme.com, +1234567890&#10;Jane, Smith, Tech Inc, tech.com, jane@tech.com"
              rows={6}
              className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>
          <Button 
            onClick={processBatchLeads} 
            disabled={batchProcessing || !batchLeads.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            {batchProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
            Process Batch
          </Button>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-lime-500" />
            Recent Leads ({leads.length})
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Latest processed leads from the automation pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading leads...</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No leads found. Process your first lead above.
              </div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-black dark:text-white">{lead.name}</span>
                      {lead.isDuplicate && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Duplicate
                        </Badge>
                      )}
                      {lead.synced ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Synced
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {lead.source}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Email:</span> {lead.email || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {lead.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span> {lead.company}
                    </div>
                    <div>
                      <span className="font-medium">Website:</span> {lead.website}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Processed: {new Date(lead.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Button 
              onClick={loadLeads} 
              variant="outline" 
              className="w-full text-black dark:text-white border-gray-300 dark:border-gray-600"
            >
              Refresh Leads
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}