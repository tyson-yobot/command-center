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
   * Generate mock leads for Apollo scraping
   */
  generateApolloLeads(count: number = 10, filters: any = {}): ScrapedLeadData[] {
    const companies = ['TechCorp', 'InnovateLabs', 'DataSystems', 'CloudWorks', 'DigitalFlow', 'SmartTech', 'NextGen Solutions', 'AI Dynamics'];
    const titles = ['VP Sales', 'Marketing Director', 'CEO', 'CTO', 'Head of Growth', 'Sales Manager', 'Operations Director', 'Product Manager'];
    const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO'];

    return Array.from({ length: count }, (_, i) => ({
      fullName: `${['Alex', 'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Ashley'][i % 8]} ${['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'][i % 8]}`,
      email: `${['alex', 'sarah', 'michael', 'jessica', 'david', 'emily', 'james', 'ashley'][i % 8]}.${['johnson', 'williams', 'brown', 'davis', 'miller', 'wilson', 'moore', 'taylor'][i % 8]}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company: companies[i % companies.length],
      title: titles[i % titles.length],
      location: locations[i % locations.length],
      linkedin: `https://linkedin.com/in/${['alex', 'sarah', 'michael', 'jessica', 'david', 'emily', 'james', 'ashley'][i % 8]}-${['johnson', 'williams', 'brown', 'davis', 'miller', 'wilson', 'moore', 'taylor'][i % 8]}`,
      industry: filters.industry || 'Technology',
      source: 'apollo'
    }));
  }

  /**
   * Generate mock leads for Apify scraping
   */
  generateApifyLeads(count: number = 10, filters: any = {}): ScrapedLeadData[] {
    const businesses = ['Local Cafe', 'Downtown Restaurant', 'City Fitness', 'Main Street Shop', 'Corner Market', 'Urban Salon', 'Metro Clinic', 'Plaza Hotel'];
    const owners = ['Maria', 'John', 'Lisa', 'Roberto', 'Amanda', 'Carlos', 'Jennifer', 'Miguel'];
    const locations = ['Downtown', 'Midtown', 'Uptown', 'East Side', 'West End', 'North District', 'South Bay', 'Central Plaza'];

    return Array.from({ length: count }, (_, i) => ({
      fullName: `${owners[i % owners.length]} ${['Rodriguez', 'Smith', 'Garcia', 'Johnson', 'Martinez', 'Brown', 'Lopez', 'Davis'][i % 8]}`,
      email: `${owners[i % owners.length].toLowerCase()}@${businesses[i % businesses.length].toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company: businesses[i % businesses.length],
      title: 'Business Owner',
      location: `${locations[i % locations.length]}, Local Area`,
      industry: filters.category || 'Local Business',
      source: 'apify'
    }));
  }

  /**
   * Generate mock leads for PhantomBuster scraping
   */
  generatePhantomBusterLeads(count: number = 10, filters: any = {}): ScrapedLeadData[] {
    const professionals = ['Executive', 'Consultant', 'Specialist', 'Manager', 'Director', 'Analyst', 'Coordinator', 'Supervisor'];
    const companies = ['Enterprise Corp', 'Global Solutions', 'Strategic Partners', 'Business Dynamics', 'Corporate Systems', 'Professional Services', 'Industry Leaders', 'Market Innovators'];

    return Array.from({ length: count }, (_, i) => ({
      fullName: `${['Daniel', 'Michelle', 'Ryan', 'Emma', 'Kevin', 'Sophia', 'Brian', 'Olivia'][i % 8]} ${['Anderson', 'Jackson', 'White', 'Harris', 'Martin', 'Taylor', 'Thomas', 'Moore'][i % 8]}`,
      email: `${['daniel', 'michelle', 'ryan', 'emma', 'kevin', 'sophia', 'brian', 'olivia'][i % 8]}.${['anderson', 'jackson', 'white', 'harris', 'martin', 'taylor', 'thomas', 'moore'][i % 8]}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company: companies[i % companies.length],
      title: `${professionals[i % professionals.length]} ${filters.industries || 'Technology'}`,
      location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA'][i % 8],
      linkedin: `https://linkedin.com/in/${['daniel', 'michelle', 'ryan', 'emma', 'kevin', 'sophia', 'brian', 'olivia'][i % 8]}-${['anderson', 'jackson', 'white', 'harris', 'martin', 'taylor', 'thomas', 'moore'][i % 8]}`,
      industry: filters.industries || 'Technology',
      source: 'phantombuster'
    }));
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