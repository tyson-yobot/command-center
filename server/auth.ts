import { Request, Response, NextFunction } from 'express';
import { User } from '@/shared/schema';

// Role hierarchy for access control
export const ROLES = {
  // YoBot Internal Team
  ADMIN: 'admin',        // Tyson & Daniel - Full system access
  DEV: 'dev',           // Engineers - Admin console only
  SUPPORT: 'support',   // Support reps - View + trigger actions
  
  // Client-Side Roles
  OWNER: 'owner',       // Business owner - Full client portal
  MANAGER: 'manager',   // Sales manager - Performance view
  AGENT: 'agent',       // Frontline - Read-only metrics
  EDITOR: 'editor'      // Bot content editor - Limited editing
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Permission levels for granular access control
export const PERMISSIONS = {
  // Admin Console Permissions
  FULL_SYSTEM_ACCESS: 'full_system_access',
  BOT_CONFIG: 'bot_config',
  SCENARIO_MANAGEMENT: 'scenario_management',
  CLIENT_MANAGEMENT: 'client_management',
  WEBHOOK_OVERRIDE: 'webhook_override',
  CROSS_TENANT_VIEW: 'cross_tenant_view',
  
  // Client Portal Permissions
  VIEW_ROI: 'view_roi',
  VIEW_PERFORMANCE: 'view_performance',
  VIEW_BILLING: 'view_billing',
  EDIT_BOT_CONTENT: 'edit_bot_content',
  CONTACT_SUPPORT: 'contact_support'
} as const;

// Role-to-permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.FULL_SYSTEM_ACCESS,
    PERMISSIONS.BOT_CONFIG,
    PERMISSIONS.SCENARIO_MANAGEMENT,
    PERMISSIONS.CLIENT_MANAGEMENT,
    PERMISSIONS.WEBHOOK_OVERRIDE,
    PERMISSIONS.CROSS_TENANT_VIEW
  ],
  [ROLES.DEV]: [
    PERMISSIONS.BOT_CONFIG,
    PERMISSIONS.SCENARIO_MANAGEMENT,
    PERMISSIONS.WEBHOOK_OVERRIDE,
    PERMISSIONS.CROSS_TENANT_VIEW
  ],
  [ROLES.SUPPORT]: [
    PERMISSIONS.WEBHOOK_OVERRIDE,
    PERMISSIONS.CROSS_TENANT_VIEW
  ],
  [ROLES.OWNER]: [
    PERMISSIONS.VIEW_ROI,
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.CONTACT_SUPPORT
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_ROI,
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.CONTACT_SUPPORT
  ],
  [ROLES.AGENT]: [
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.CONTACT_SUPPORT
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.EDIT_BOT_CONTENT,
    PERMISSIONS.CONTACT_SUPPORT
  ]
};

// Interface for authenticated request
export interface AuthRequest extends Request {
  user?: User;
}

// Check if user has specific permission
export function hasPermission(user: User, permission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
  return userPermissions.includes(permission);
}

// Check if user is YoBot internal team member
export function isYoBotTeam(user: User): boolean {
  return [ROLES.ADMIN, ROLES.DEV, ROLES.SUPPORT].includes(user.role as UserRole);
}

// Check if user is client-side user
export function isClientUser(user: User): boolean {
  return [ROLES.OWNER, ROLES.MANAGER, ROLES.AGENT, ROLES.EDITOR].includes(user.role as UserRole);
}

// Middleware to require authentication
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Middleware to require specific role
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Middleware to require specific permission
export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Middleware to require YoBot team access
export function requireYoBotTeam(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!isYoBotTeam(req.user)) {
    return res.status(403).json({ error: 'YoBot team access required' });
  }
  
  next();
}

// Middleware to enforce client data scoping
export function requireClientScope(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // YoBot team can access all client data
  if (isYoBotTeam(req.user)) {
    return next();
  }
  
  // Client users can only access their own data
  if (!req.user.clientId) {
    return res.status(403).json({ error: 'Client access required' });
  }
  
  next();
}

// Get user's access level for frontend routing
export function getUserAccessLevel(user: User): 'admin' | 'client' {
  return isYoBotTeam(user) ? 'admin' : 'client';
}

// Get redirect URL based on user role
export function getPostLoginRedirect(user: User): string {
  if (isYoBotTeam(user)) {
    return '/admin';
  } else {
    return '/dashboard';
  }
}