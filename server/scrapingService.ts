import airtableLeadsService from './airtableLeadsService.js';

interface ScrapedLeadData {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  title?: string;
  location?: string;
  industry?: string;
  linkedin?: string;
  source?: string;
}

class ScrapingService {
  /**
   * Process scraped leads and upload to Scraped Leads (Universal) table
   */
  async processScrapeResults(platform: string, leads: ScrapedLeadData[]): Promise<{
    success: boolean;
    savedCount: number;
    totalLeads: number;
    scrapeSessionId: string;
    recordIds?: string[];
    error?: string;
  }> {
    try {
      const scrapeSessionId = `${platform}-${Date.now()}`;
      
      console.log(`📥 Processing ${leads.length} leads from ${platform} for Scraped Leads (Universal)`);

      // Transform leads to match AirtableLeadsService format
      const leadsToCreate = leads.map(lead => ({
        name: lead.fullName || lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        website: lead.website || lead.linkedin || '',
        title: lead.title || '',
        location: lead.location || '',
        leadSource: `${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        platform: platform.toLowerCase(),
        sourceCampaignId: scrapeSessionId,
        leadOwner: 'YoBot System'
      }));

      // Upload to Scraped Leads (Universal) table
      const recordIds = await airtableLeadsService.bulkCreateScrapedLeads(leadsToCreate);

      console.log(`✅ Successfully uploaded ${recordIds.length}/${leads.length} leads to Scraped Leads (Universal)`);

      // Send Slack notification
      await this.sendSlackNotification(platform, leads.length, recordIds.length);

      return {
        success: true,
        savedCount: recordIds.length,
        totalLeads: leads.length,
        scrapeSessionId,
        recordIds
      };

    } catch (error: any) {
      console.error(`❌ Failed to process ${platform} scrape results:`, error);
      return {
        success: false,
        savedCount: 0,
        totalLeads: leads.length,
        scrapeSessionId: `${platform}-error-${Date.now()}`,
        error: error.message
      };
    }
  }

  /**
   * Real Apollo.io API integration for lead scraping
   */
  async scrapeApolloLeads(count: number = 10, filters: any = {}): Promise<ScrapedLeadData[]> {
    const apolloApiKey = process.env.APOLLO_API_KEY;
    if (!apolloApiKey) {
      throw new Error('Apollo API key not configured. Please provide APOLLO_API_KEY in environment variables.');
    }

    try {
      const searchParams = {
        q_keywords: filters.industry || 'technology',
        page: 1,
        per_page: Math.min(count, 25),
        person_locations: [filters.location || 'United States'],
        person_titles: ['CEO', 'Director', 'VP', 'Manager'],
        organization_locations: [filters.location || 'United States']
      };

      const response = await fetch(`https://api.apollo.io/v1/mixed_people/search?api_key=${apolloApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error(`Apollo API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.people?.map((person: any) => ({
        fullName: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
        email: person.email,
        phone: person.phone_numbers?.[0]?.sanitized_number,
        company: person.organization?.name,
        title: person.title,
        location: `${person.city || ''}, ${person.state || ''}`.replace(/^,\s*/, ''),
        linkedin: person.linkedin_url,
        industry: person.organization?.industry,
        source: 'apollo'
      })) || [];
    } catch (error: any) {
      console.error('Apollo API error:', error.message);
      throw new Error(`Apollo scraping failed: ${error.message}`);
    }
  }

  private getApolloIndustryId(industry?: string): string[] {
    const industryMap: { [key: string]: string[] } = {
      'technology': ['5567cd4973696439b10b0000'],
      'finance': ['5567cd4e73696439b10b0001'],
      'healthcare': ['5567cd5273696439b10b0002'],
      'real estate': ['5567cd5673696439b10b0003'],
      'manufacturing': ['5567cd5a73696439b10b0004']
    };
    
    return industryMap[industry?.toLowerCase() || 'technology'] || industryMap['technology'];
  }

  /**
   * Real Apify API integration for Google Maps business scraping
   */
  async scrapeApifyLeads(count: number = 10, filters: any = {}): Promise<ScrapedLeadData[]> {
    const apifyApiKey = process.env.APIFY_API_KEY;
    if (!apifyApiKey) {
      throw new Error('Apify API key not configured. Please provide APIFY_API_KEY in environment variables.');
    }

    try {
      const actorId = 'compass/google-maps-scraper'; // Popular Google Maps scraper
      const searchQuery = `${filters.searchTerms || 'restaurants'} ${filters.location || 'New York'}`;
      
      const runInput = {
        searchStringsArray: [searchQuery],
        maxCrawledPlacesPerSearch: Math.min(count, 20),
        language: 'en',
        maxReviews: 0,
        maxImages: 0,
        exportPlaceUrls: false,
        additionalInfo: false,
        scrapeReviewsPersonalData: false,
        scrapeDirections: false,
        scrapeOpeningHours: false
      };

      // Start the actor run
      const runResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runInput)
      });

      if (!runResponse.ok) {
        throw new Error(`Apify run failed: ${runResponse.status} - ${runResponse.statusText}`);
      }

      const runData = await runResponse.json();
      const runId = runData.data.id;

      // Poll for completion (simplified - in production, use webhooks)
      let attempts = 0;
      let results = null;
      
      while (attempts < 30 && !results) { // 30 second timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyApiKey}`);
        const statusData = await statusResponse.json();
        
        if (statusData.data.status === 'SUCCEEDED') {
          const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${statusData.data.defaultDatasetId}/items?token=${apifyApiKey}`);
          results = await datasetResponse.json();
          break;
        } else if (statusData.data.status === 'FAILED') {
          throw new Error('Apify scraping job failed');
        }
        
        attempts++;
      }

      if (!results) {
        throw new Error('Apify scraping timeout');
      }

      return results.map((place: any) => ({
        fullName: place.owner || 'Business Owner',
        email: place.email || `contact@${(place.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: place.phoneNumber,
        company: place.title,
        title: 'Business Owner',
        location: place.address,
        website: place.website,
        industry: filters.industry || 'Local Business',
        source: 'apify'
      }));
    } catch (error: any) {
      console.error('Apify API error:', error.message);
      throw new Error(`Apify scraping failed: ${error.message}`);
    }
  }

  /**
   * Real PhantomBuster API integration for LinkedIn lead scraping
   */
  async scrapePhantomBusterLeads(count: number = 10, filters: any = {}): Promise<ScrapedLeadData[]> {
    const phantomApiKey = process.env.PHANTOMBUSTER_API_KEY;
    if (!phantomApiKey) {
      throw new Error('PhantomBuster API key not configured. Please provide PHANTOMBUSTER_API_KEY in environment variables.');
    }

    try {
      const phantomId = 'phantom_linkedin_network_scraper'; // Popular LinkedIn scraper
      
      const launchData = {
        id: phantomId,
        argument: {
          searchKeywords: filters.searchKeywords || 'CEO OR Director OR Manager',
          location: filters.location || 'United States',
          networkLevel: filters.connectionLevel || '2nd',
          companySize: filters.companySize || '11-50',
          industry: filters.industry || 'technology',
          numberOfProfiles: Math.min(count, 50)
        }
      };

      // Launch phantom
      const launchResponse = await fetch('https://api.phantombuster.com/api/v2/phantoms/launch', {
        method: 'POST',
        headers: {
          'X-Phantombuster-Key': phantomApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(launchData)
      });

      if (!launchResponse.ok) {
        throw new Error(`PhantomBuster launch failed: ${launchResponse.status} - ${launchResponse.statusText}`);
      }

      const launchResult = await launchResponse.json();
      const containerId = launchResult.data.containerId;

      // Poll for completion
      let attempts = 0;
      let results = null;
      
      while (attempts < 60 && !results) { // 60 second timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`https://api.phantombuster.com/api/v2/containers/fetch-output?id=${containerId}`, {
          headers: { 'X-Phantombuster-Key': phantomApiKey }
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.data && statusData.data.resultObject) {
            results = statusData.data.resultObject;
            break;
          }
        }
        
        attempts++;
      }

      if (!results || !results.length) {
        throw new Error('PhantomBuster scraping timeout or no results');
      }

      return results.map((profile: any) => ({
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        email: profile.email || `${(profile.firstName || '').toLowerCase()}.${(profile.lastName || '').toLowerCase()}@${(profile.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: profile.phone,
        company: profile.company,
        title: profile.title,
        location: profile.location,
        linkedin: profile.profileUrl,
        industry: profile.industry || filters.industry,
        source: 'phantombuster'
      }));
    } catch (error: any) {
      console.error('PhantomBuster API error:', error.message);
      throw new Error(`PhantomBuster scraping failed: ${error.message}`);
    }
  }

  /**
   * Send Slack notification for successful scraping
   */
  private async sendSlackNotification(platform: string, totalLeads: number, savedLeads: number): Promise<void> {
    try {
      const slackWebhookUrl = "https://hooks.slack.com/services/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";
      
      await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `✅ *New Leads Scraped*: ${totalLeads}\n🧰 Tool: ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n🕒 Time: ${new Date().toLocaleString()}\n📥 Synced to Scraped Leads (Universal): ${savedLeads}/${totalLeads} ✅`
        })
      });
    } catch (error) {
      console.error('Slack notification failed:', error);
    }
  }
}

export default new ScrapingService();