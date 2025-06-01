import express from 'express';
import { auditLogger } from './systemAuditLog';

const router = express.Router();

interface RAGUsageEntry {
  entryId: string;
  title: string;
  lastUsed: string;
  usageCount7d: number;
  triggerSources: string[];
  confidence: number;
  escalationRate: number;
  status: 'active' | 'outdated' | 'high-risk';
}

interface RAGAnalytics {
  entriesUsed: number;
  avgConfidence: number;
  escalationRate: number;
  mostUsedEntry: string;
  totalEntries: number;
  activeEntries: number;
  outdatedEntries: number;
  highRiskEntries: number;
}

// In-memory tracking (in production, this would be stored in database)
const usageTracking = new Map<string, {
  uses: { timestamp: string; source: string; confidence: number; escalated: boolean }[];
  entry: any;
}>();

// Track RAG entry usage
export function trackRAGUsage(entryId: string, source: string, confidence: number, escalated: boolean = false, entryData?: any) {
  const timestamp = new Date().toISOString();
  
  if (!usageTracking.has(entryId)) {
    usageTracking.set(entryId, { uses: [], entry: entryData });
  }
  
  const tracking = usageTracking.get(entryId)!;
  tracking.uses.push({ timestamp, source, confidence, escalated });
  
  // Keep only last 30 days of usage data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  tracking.uses = tracking.uses.filter(use => new Date(use.timestamp) > thirtyDaysAgo);
  
  // Log to audit system
  auditLogger.logEvent({
    type: 'system',
    module: 'RAG Engine',
    action: 'Knowledge Entry Used',
    details: `Entry "${entryData?.title || entryId}" used from ${source} with ${confidence}% confidence`,
    status: escalated ? 'warning' : 'success',
    metadata: { entryId, source, confidence, escalated }
  });
}

// Get RAG usage analytics
router.get('/analytics', (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    let totalUses = 0;
    let totalConfidence = 0;
    let totalEscalations = 0;
    let mostUsedEntry = '';
    let maxUses = 0;
    
    const usageEntries: RAGUsageEntry[] = [];
    
    for (const [entryId, tracking] of usageTracking.entries()) {
      const recentUses = tracking.uses.filter(use => new Date(use.timestamp) > sevenDaysAgo);
      const allUses = tracking.uses.filter(use => new Date(use.timestamp) > thirtyDaysAgo);
      
      if (recentUses.length > 0) {
        totalUses += recentUses.length;
        
        const avgConfidence = recentUses.reduce((sum, use) => sum + use.confidence, 0) / recentUses.length;
        totalConfidence += avgConfidence;
        
        const escalations = recentUses.filter(use => use.escalated).length;
        totalEscalations += escalations;
        
        if (recentUses.length > maxUses) {
          maxUses = recentUses.length;
          mostUsedEntry = tracking.entry?.title || entryId;
        }
        
        // Determine status
        let status: 'active' | 'outdated' | 'high-risk' = 'active';
        if (allUses.length === 0) {
          status = 'outdated';
        } else if (escalations / recentUses.length > 0.3) {
          status = 'high-risk';
        }
        
        // Get unique trigger sources
        const triggerSources = [...new Set(recentUses.map(use => use.source))];
        
        usageEntries.push({
          entryId,
          title: tracking.entry?.title || entryId,
          lastUsed: recentUses[recentUses.length - 1]?.timestamp || 'Never',
          usageCount7d: recentUses.length,
          triggerSources,
          confidence: avgConfidence,
          escalationRate: escalations / recentUses.length,
          status
        });
      }
    }
    
    const analytics: RAGAnalytics = {
      entriesUsed: usageEntries.length,
      avgConfidence: usageEntries.length > 0 ? totalConfidence / usageEntries.length : 0,
      escalationRate: totalUses > 0 ? (totalEscalations / totalUses) * 100 : 0,
      mostUsedEntry,
      totalEntries: usageTracking.size,
      activeEntries: usageEntries.filter(e => e.status === 'active').length,
      outdatedEntries: usageEntries.filter(e => e.status === 'outdated').length,
      highRiskEntries: usageEntries.filter(e => e.status === 'high-risk').length
    };
    
    res.json({
      success: true,
      analytics,
      entries: usageEntries.sort((a, b) => b.usageCount7d - a.usageCount7d),
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve RAG analytics',
      details: error.message
    });
  }
});

// Get specific entry usage details
router.get('/entry/:entryId/usage', (req, res) => {
  try {
    const { entryId } = req.params;
    const tracking = usageTracking.get(entryId);
    
    if (!tracking) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found in usage tracking'
      });
    }
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUses = tracking.uses.filter(use => new Date(use.timestamp) > thirtyDaysAgo);
    
    res.json({
      success: true,
      entryId,
      entry: tracking.entry,
      usageHistory: recentUses,
      summary: {
        totalUses: recentUses.length,
        avgConfidence: recentUses.reduce((sum, use) => sum + use.confidence, 0) / recentUses.length || 0,
        escalationRate: recentUses.filter(use => use.escalated).length / recentUses.length || 0,
        sources: [...new Set(recentUses.map(use => use.source))]
      }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve entry usage details',
      details: error.message
    });
  }
});

// Flag entry for review
router.post('/entry/:entryId/flag', (req, res) => {
  try {
    const { entryId } = req.params;
    const { reason } = req.body;
    
    auditLogger.logEvent({
      type: 'admin_action',
      module: 'RAG Engine',
      action: 'Entry Flagged for Review',
      details: `Entry "${entryId}" flagged: ${reason}`,
      status: 'warning',
      metadata: { entryId, reason }
    });
    
    res.json({
      success: true,
      message: 'Entry flagged for review',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to flag entry',
      details: error.message
    });
  }
});

export default router;