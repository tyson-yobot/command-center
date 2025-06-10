/**
 * Dashboard Security Module
 * Implements fingerprint validation to prevent unauthorized automation execution
 */

const VALID_DASHBOARD = "COMMAND_CENTER";

export function validateDashboardAccess(): boolean {
  const dashboardId = process.env.DASHBOARD_ID;
  
  if (dashboardId !== VALID_DASHBOARD) {
    console.warn("🚫 Automation blocked: invalid dashboard context.");
    return false;
  }
  
  return true;
}

export function dashboardSecurityMiddleware(req: any, res: any, next: any) {
  if (!validateDashboardAccess()) {
    return res.status(403).json({
      error: "Invalid dashboard",
      message: "Automation blocked: unauthorized dashboard context",
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}

export function secureAutomationEndpoint(handler: Function) {
  return (req: any, res: any) => {
    if (!validateDashboardAccess()) {
      return res.status(403).json({
        error: "Invalid dashboard",
        message: "Automation blocked: unauthorized dashboard context",
        timestamp: new Date().toISOString()
      });
    }
    
    return handler(req, res);
  };
}