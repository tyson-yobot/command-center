import { Express, Request, Response } from 'express';
import { requireAuth } from './auth';

// Store active scraping jobs in memory (in production, use Redis or database)
const activeJobs = new Map<string, { status: 'pending' | 'running' | 'completed' | 'failed'; results?: any[]; platform: string; config: any }>();

export function registerScraperEndpoints(app: Express) {
  // Launch scraper endpoint
  app.post('/api/scrape', requireAuth, async (req: Request, res: Response) => {
    try {
      const { platform, config } = req.body;
      
      if (!platform || !['apollo', 'apify', 'phantombuster'].includes(platform)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid platform specified'
        });
      }

      // Generate unique job ID
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store job info
      activeJobs.set(jobId, {
        status: 'pending',
        platform,
        config
      });

      // Simulate launching scraper (in production, trigger actual scraper APIs)
      setTimeout(() => {
        const job = activeJobs.get(jobId);
        if (job) {
          job.status = 'running';
          activeJobs.set(jobId, job);
        }
      }, 1000);

      // Simulate completion after 10-30 seconds (in production, webhook handles this)
      setTimeout(() => {
        const job = activeJobs.get(jobId);
        if (job) {
          job.status = 'completed';
          job.results = generateMockResults(platform); // In production, real results from scraper
          activeJobs.set(jobId, job);
        }
      }, Math.random() * 20000 + 10000);

      res.json({
        success: true,
        jobId,
        message: `${platform} scraper launched successfully`,
        estimatedCompletion: '15-30 seconds'
      });

    } catch (error) {
      console.error('Scraper launch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to launch scraper'
      });
    }
  });

  // Check scraper status endpoint
  app.get('/api/scrape/status/:jobId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const job = activeJobs.get(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      res.json({
        success: true,
        jobId,
        status: job.status,
        platform: job.platform,
        results: job.results || [],
        resultCount: job.results?.length || 0
      });

    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check job status'
      });
    }
  });

  // Webhook endpoint for external scrapers (Apollo, Apify, PhantomBuster)
  app.post('/api/scrape/webhook/:platform', async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const { jobId, status, results, error } = req.body;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          error: 'Job ID required'
        });
      }

      const job = activeJobs.get(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Update job status
      job.status = status;
      if (results) {
        job.results = results;
      }
      if (error) {
        job.status = 'failed';
      }

      activeJobs.set(jobId, job);

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });

    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        error: 'Webhook processing failed'
      });
    }
  });

  // Get all active jobs (admin endpoint)
  app.get('/api/scrape/jobs', requireAuth, async (req: Request, res: Response) => {
    try {
      const jobs = Array.from(activeJobs.entries()).map(([jobId, job]) => ({
        jobId,
        ...job
      }));

      res.json({
        success: true,
        jobs,
        totalJobs: jobs.length
      });

    } catch (error) {
      console.error('Jobs list error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve jobs'
      });
    }
  });
}

// Generate mock results for testing (remove in production when using real APIs)
function generateMockResults(platform: string) {
  const results = [];
  const count = Math.floor(Math.random() * 20) + 5; // 5-25 results

  for (let i = 0; i < count; i++) {
    results.push({
      id: `lead_${Date.now()}_${i}`,
      firstName: `FirstName${i + 1}`,
      lastName: `LastName${i + 1}`,
      email: `contact${i + 1}@company${i + 1}.com`,
      company: `Company ${i + 1}`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      position: `Position ${i + 1}`,
      source: platform
    });
  }

  return results;
}