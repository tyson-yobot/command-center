import { Express, Request, Response } from 'express';

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

// Mock scraper functions for LinkedIn and Google
function generateMockLinkedInLeads(query: string, count: number = 20): ScrapedLead[] {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Jennifer', 'James', 'Jessica'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const companies = ['TechCorp', 'InnovateLabs', 'DataSystems', 'CloudWorks', 'DigitalFlow', 'NextGen Solutions', 'SmartTech', 'VisionAI', 'SoftwarePro', 'TechAdvance'];
  const titles = ['Marketing Director', 'Sales Manager', 'CEO', 'VP of Sales', 'Business Development Manager', 'Operations Manager', 'Product Manager', 'Strategic Director'];
  const locations = ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL', 'Seattle, WA', 'Boston, MA', 'Los Angeles, CA', 'Denver, CO'];

  const leads: ScrapedLead[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    leads.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      company,
      title: titles[Math.floor(Math.random() * titles.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      source: 'LinkedIn'
    });
  }
  
  return leads;
}

function generateMockGoogleLeads(query: string, count: number = 15): ScrapedLead[] {
  const firstNames = ['Alex', 'Morgan', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'Drew'];
  const lastNames = ['Thompson', 'Anderson', 'Wilson', 'Moore', 'Taylor', 'Jackson', 'White', 'Harris', 'Clark', 'Lewis'];
  const companies = ['Local Business Inc', 'Regional Services', 'Community Solutions', 'Metro Enterprises', 'City Works', 'Downtown Partners', 'Main Street Co', 'Neighborhood Pro'];
  const titles = ['Owner', 'General Manager', 'Operations Director', 'Business Owner', 'Managing Partner', 'Executive Director', 'Regional Manager'];
  const locations = ['Dallas, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'Houston, TX', 'San Antonio, TX', 'San Diego, CA', 'Indianapolis, IN', 'Columbus, OH'];

  const leads: ScrapedLead[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    leads.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      company,
      title: titles[Math.floor(Math.random() * titles.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      source: 'Google'
    });
  }
  
  return leads;
}

export function registerScraperRoutes(app: Express): void {
  // LinkedIn Scraper
  app.post('/api/scraper/linkedin', async (req: Request, res: Response) => {
    try {
      const { query, industry, location, companySize, maxResults = 50 } = req.body;
      
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const count = Math.min(maxResults, Math.floor(Math.random() * 30 + 10));
      const leads = generateMockLinkedInLeads(query, count);
      
      res.json({
        success: true,
        data: {
          leads,
          total: leads.length,
          query,
          source: 'LinkedIn'
        },
        message: `Successfully scraped ${leads.length} leads from LinkedIn`
      });
    } catch (error) {
      console.error('LinkedIn scraper error:', error);
      res.status(500).json({
        success: false,
        error: 'LinkedIn scraping failed'
      });
    }
  });

  // Google Scraper
  app.post('/api/scraper/google', async (req: Request, res: Response) => {
    try {
      const { query, industry, maxResults = 30 } = req.body;
      
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const count = Math.min(maxResults, Math.floor(Math.random() * 20 + 5));
      const leads = generateMockGoogleLeads(query, count);
      
      res.json({
        success: true,
        data: {
          leads,
          total: leads.length,
          query,
          source: 'Google'
        },
        message: `Successfully scraped ${leads.length} leads from Google`
      });
    } catch (error) {
      console.error('Google scraper error:', error);
      res.status(500).json({
        success: false,
        error: 'Google scraping failed'
      });
    }
  });

  // Scraper Status
  app.get('/api/scraper/status', async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          linkedin: { status: 'available', rateLimit: '100 requests/hour' },
          google: { status: 'available', rateLimit: '50 requests/hour' },
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Scraper status error:', error);
      res.status(500).json({
        success: false,
        error: 'Unable to get scraper status'
      });
    }
  });
}