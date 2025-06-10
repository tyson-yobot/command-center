import axios from 'axios';

const PHANTOMBUSTER_API_KEY = process.env.PHANTOMBUSTER_API_KEY || 'wBL9kZGAslPql7P9aYOgELLOvGOGrCKfZY6cQ8z5W40';
const PHANTOMBUSTER_BASE_URL = 'https://api.phantombuster.com/api/v2';

interface PhantomLaunchResult {
  success: boolean;
  containerId?: string;
  message: string;
  error?: string;
}

interface PhantomResult {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

interface LinkedInLeadData {
  name: string;
  profileUrl: string;
  company?: string;
  position?: string;
  location?: string;
  email?: string;
  phone?: string;
}

/**
 * Launch a Phantom (automation script) on Phantombuster
 */
export async function launchPhantom(phantomId: string, input: any = {}): Promise<PhantomLaunchResult> {
  try {
    const response = await axios.post(
      `${PHANTOMBUSTER_BASE_URL}/phantoms/${phantomId}/launchonce`,
      {
        input: JSON.stringify(input)
      },
      {
        headers: {
          'X-Phantombuster-Key': PHANTOMBUSTER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      containerId: response.data.containerId,
      message: 'Phantom launched successfully'
    };
  } catch (error: any) {
    console.error('Phantom launch error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      message: 'Failed to launch Phantom'
    };
  }
}

/**
 * Get Phantom execution results
 */
export async function getPhantomResults(phantomId: string, containerId?: string): Promise<PhantomResult> {
  try {
    const endpoint = containerId 
      ? `${PHANTOMBUSTER_BASE_URL}/containers/${containerId}/output`
      : `${PHANTOMBUSTER_BASE_URL}/phantoms/${phantomId}/output`;

    const response = await axios.get(endpoint, {
      headers: {
        'X-Phantombuster-Key': PHANTOMBUSTER_API_KEY
      }
    });

    return {
      success: true,
      data: response.data,
      message: 'Results retrieved successfully'
    };
  } catch (error: any) {
    console.error('Phantom results error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      message: 'Failed to retrieve results'
    };
  }
}

/**
 * LinkedIn lead extraction automation
 */
export async function extractLinkedInLeads(searchQuery: string, maxResults: number = 50): Promise<{ success: boolean; leads?: LinkedInLeadData[]; error?: string }> {
  try {
    // Launch LinkedIn search phantom
    const launchResult = await launchPhantom('linkedin-search-phantom', {
      searchQuery,
      numberOfResults: maxResults,
      extractEmails: true
    });

    if (!launchResult.success) {
      return { success: false, error: launchResult.error };
    }

    // Wait for execution (in production, you'd use webhooks)
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Get results
    const resultsResponse = await getPhantomResults('linkedin-search-phantom', launchResult.containerId);

    if (!resultsResponse.success) {
      return { success: false, error: resultsResponse.error };
    }

    // Process and format lead data
    const leads: LinkedInLeadData[] = resultsResponse.data?.map((item: any) => ({
      name: item.fullName || item.name,
      profileUrl: item.profileUrl,
      company: item.company,
      position: item.position || item.title,
      location: item.location,
      email: item.email,
      phone: item.phone
    })) || [];

    return {
      success: true,
      leads
    };
  } catch (error: any) {
    console.error('LinkedIn lead extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Company enrichment via Phantombuster
 */
export async function enrichCompanyData(companyName: string): Promise<{ success: boolean; enrichedData?: any; error?: string }> {
  try {
    const launchResult = await launchPhantom('company-enrichment-phantom', {
      companyName,
      includeFinancials: true,
      includeContacts: true
    });

    if (!launchResult.success) {
      return { success: false, error: launchResult.error };
    }

    // Wait for execution
    await new Promise(resolve => setTimeout(resolve, 20000));

    const resultsResponse = await getPhantomResults('company-enrichment-phantom', launchResult.containerId);

    if (!resultsResponse.success) {
      return { success: false, error: resultsResponse.error };
    }

    return {
      success: true,
      enrichedData: resultsResponse.data
    };
  } catch (error: any) {
    console.error('Company enrichment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Instagram lead generation
 */
export async function extractInstagramProfiles(hashtag: string, maxProfiles: number = 30): Promise<{ success: boolean; profiles?: any[]; error?: string }> {
  try {
    const launchResult = await launchPhantom('instagram-hashtag-phantom', {
      hashtag,
      numberOfProfiles: maxProfiles,
      extractBusinessInfo: true
    });

    if (!launchResult.success) {
      return { success: false, error: launchResult.error };
    }

    await new Promise(resolve => setTimeout(resolve, 25000));

    const resultsResponse = await getPhantomResults('instagram-hashtag-phantom', launchResult.containerId);

    if (!resultsResponse.success) {
      return { success: false, error: resultsResponse.error };
    }

    return {
      success: true,
      profiles: resultsResponse.data
    };
  } catch (error: any) {
    console.error('Instagram extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test Phantombuster connection
 */
export async function testPhantombusterConnection(): Promise<{ success: boolean; message: string; phantoms?: any[] }> {
  try {
    const response = await axios.get(`${PHANTOMBUSTER_BASE_URL}/phantoms`, {
      headers: {
        'X-Phantombuster-Key': PHANTOMBUSTER_API_KEY
      }
    });

    return {
      success: true,
      message: `Connected to Phantombuster. Found ${response.data.length} phantoms.`,
      phantoms: response.data
    };
  } catch (error: any) {
    console.error('Phantombuster connection test error:', error.response?.data || error.message);
    return {
      success: false,
      message: `Phantombuster connection failed: ${error.response?.data?.message || error.message}`
    };
  }
}

/**
 * Automated lead scoring based on extracted data
 */
export function scoreLeadData(leadData: LinkedInLeadData): number {
  let score = 50; // Base score

  // Company size indicators
  if (leadData.company) {
    const company = leadData.company.toLowerCase();
    if (company.includes('inc') || company.includes('corp') || company.includes('ltd')) score += 10;
    if (company.includes('startup') || company.includes('founder')) score += 15;
  }

  // Position indicators
  if (leadData.position) {
    const position = leadData.position.toLowerCase();
    if (position.includes('ceo') || position.includes('founder') || position.includes('owner')) score += 20;
    if (position.includes('director') || position.includes('manager') || position.includes('vp')) score += 15;
    if (position.includes('head') || position.includes('lead')) score += 10;
  }

  // Contact info availability
  if (leadData.email) score += 15;
  if (leadData.phone) score += 10;

  // Location preferences (customize based on target markets)
  if (leadData.location) {
    const location = leadData.location.toLowerCase();
    if (location.includes('san francisco') || location.includes('new york') || location.includes('austin')) score += 5;
  }

  return Math.min(score, 100); // Cap at 100
}