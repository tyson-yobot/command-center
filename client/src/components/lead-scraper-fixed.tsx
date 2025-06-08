import React, { useState } from 'react';

interface LeadScraperProps {
  onResults?: (results: any[]) => void;
}

interface Lead {
  name: string;
  title: string;
  company: string;
  email: string | null;
  phone: string | null;
  location: string;
  industry: string;
  employees: string;
  website: string | null;
  linkedinUrl: string | null;
  revenue: string | null;
}

export default function LeadScraperFixed({ onResults }: LeadScraperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [activeEngine, setActiveEngine] = useState('apollo');
  
  // Form states
  const [keywords, setKeywords] = useState('');
  const [locations, setLocations] = useState('');
  const [industries, setIndustries] = useState('');
  const [maxResults, setMaxResults] = useState(100);

  const handleScrape = async () => {
    setIsLoading(true);
    setLeads([]);
    
    try {
      let endpoint = '';
      let payload = {};
      
      if (activeEngine === 'apollo') {
        endpoint = '/api/scraping/apollo';
        payload = { keywords, locations, industries, maxResults };
      } else if (activeEngine === 'apify') {
        endpoint = '/api/scraping/apify';
        payload = { searchTerms: keywords, regions: locations, maxPages: Math.ceil(maxResults / 20) };
      } else if (activeEngine === 'phantom') {
        endpoint = '/api/scraping/phantom';
        payload = { linkedinUrls: keywords, searchQueries: locations, maxProfiles: maxResults };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success && data.leads) {
        setLeads(data.leads);
        onResults?.(data.leads);
      } else {
        console.error('Scraping failed:', data.error);
      }
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLead = (index: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedLeads(newSelected);
  };

  const selectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map((_, index) => index)));
    }
  };

  const exportToCsv = () => {
    const selectedData = leads.filter((_, index) => selectedLeads.has(index));
    const csvContent = [
      'Name,Title,Company,Email,Phone,Location,Industry,Employees,Website,LinkedIn',
      ...selectedData.map(lead => 
        `"${lead.name}","${lead.title}","${lead.company}","${lead.email || ''}","${lead.phone || ''}","${lead.location}","${lead.industry}","${lead.employees}","${lead.website || ''}","${lead.linkedinUrl || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Lead Scraper</h1>
          <p className="text-blue-200">Professional lead generation with Apollo, Apify, and PhantomBuster</p>
        </div>

        {/* Engine Selection */}
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Scraping Engine</h3>
          <div className="flex gap-4">
            {['apollo', 'apify', 'phantom'].map(engine => (
              <button
                key={engine}
                onClick={() => setActiveEngine(engine)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeEngine === engine
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {engine === 'apollo' ? 'Apollo.io' : engine === 'apify' ? 'Apify Maps' : 'PhantomBuster'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Search Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {activeEngine === 'apollo' ? 'Keywords' : activeEngine === 'apify' ? 'Search Terms' : 'LinkedIn URLs'}
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={activeEngine === 'apollo' ? 'CEO, founder, marketing' : activeEngine === 'apify' ? 'restaurants, dentists, lawyers' : 'LinkedIn profile URLs'}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {activeEngine === 'phantom' ? 'Search Queries' : 'Locations'}
              </label>
              <input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder={activeEngine === 'phantom' ? 'Additional search terms' : 'New York, California, Texas'}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>
            {activeEngine === 'apollo' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Industries</label>
                <input
                  type="text"
                  value={industries}
                  onChange={(e) => setIndustries(e.target.value)}
                  placeholder="Technology, Healthcare, Finance"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Results</label>
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 100)}
                min="1"
                max="1000"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>
          <button
            onClick={handleScrape}
            disabled={isLoading || !keywords}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Scraping...' : 'Start Scraping'}
          </button>
        </div>

        {/* Results */}
        {leads.length > 0 && (
          <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Results ({leads.length} leads found)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  {selectedLeads.size === leads.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={exportToCsv}
                  disabled={selectedLeads.size === 0}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Export Selected ({selectedLeads.size})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                  <tr>
                    <th className="px-4 py-3">Select</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Industry</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr key={index} className="bg-slate-800/30 border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(index)}
                          onChange={() => toggleLead(index)}
                          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                      <td className="px-4 py-3">{lead.title}</td>
                      <td className="px-4 py-3">{lead.company}</td>
                      <td className="px-4 py-3">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-blue-400 hover:text-blue-300">
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-slate-500">No email</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="text-blue-400 hover:text-blue-300">
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-slate-500">No phone</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{lead.location}</td>
                      <td className="px-4 py-3">{lead.industry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Scraping leads using {activeEngine}...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && leads.length === 0 && (
          <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6 text-center">
            <p className="text-slate-400">Enter search parameters and click "Start Scraping" to find leads.</p>
          </div>
        )}
      </div>
    </div>
  );
}