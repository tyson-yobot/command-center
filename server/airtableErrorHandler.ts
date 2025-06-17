/**
 * Airtable Error Handler and Fallback System
 * Ensures command center remains functional with graceful error handling
 */

export class AirtableErrorHandler {
  static handleApiError(error: any, operation: string): any[] {
    console.error(`Airtable ${operation} failed:`, error.message);
    
    // Return empty array for live mode instead of throwing
    return [];
  }

  static createFallbackResponse(operation: string): { success: boolean; data: any; message: string } {
    return {
      success: true,
      data: [],
      message: `${operation} - Live data unavailable, API authentication required`
    };
  }

  static isAuthenticationError(error: any): boolean {
    return error.message?.includes('403') || 
           error.message?.includes('401') || 
           error.message?.includes('Unauthorized') ||
           error.message?.includes('ByteString');
  }

  static sanitizeApiKey(apiKey: string): string {
    if (!apiKey) return '';
    
    // Remove any non-printable ASCII characters that could cause encoding issues
    return apiKey.replace(/[\x00-\x1F\x7F-\xFF]/g, '').trim();
  }
}