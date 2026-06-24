import type { UserRole, AccessLevel, Permission } from '@/types';

// ============================================================
// ROLE ACCESS MAP
// Maps each role to the AccessLevel values they can view
// ============================================================

export const ROLE_ACCESS_MAP: Record<UserRole, AccessLevel[]> = {
  PUBLIC_VIEWER: ['PUBLIC'],
  ASSET_OWNER: [
    'PUBLIC',
    'ASSET_OWNER_ONLY',
    'ASSET_OWNER_AND_REGULATOR',
    'REGULATOR_AND_ASSET_OWNER',
  ],
  RIMAC_SERVICE_ENGINEER: [
    'PUBLIC',
    'ASSET_OWNER_ONLY',
    'ASSET_OWNER_AND_REGULATOR',
    'SERVICE_AND_ABOVE',
  ],
  ENT_PLATFORM_OPERATOR: [
    'PUBLIC',
    'ASSET_OWNER_ONLY',
    'ASSET_OWNER_AND_REGULATOR',
    'SERVICE_AND_ABOVE',
    'PLATFORM_OPERATOR',
  ],
  REGULATOR: ['PUBLIC', 'ASSET_OWNER_AND_REGULATOR', 'REGULATOR_AND_ASSET_OWNER'],
  RECYCLER: ['PUBLIC'],
  ADMIN: [
    'PUBLIC',
    'ASSET_OWNER_ONLY',
    'ASSET_OWNER_AND_REGULATOR',
    'REGULATOR_AND_ASSET_OWNER',
    'SERVICE_AND_ABOVE',
    'PLATFORM_OPERATOR',
    'ADMIN_ONLY',
  ],
  RIMAC_OPERATOR: [
    'PUBLIC',
    'ASSET_OWNER_ONLY',
    'ASSET_OWNER_AND_REGULATOR',
    'SERVICE_AND_ABOVE',
  ],
  RIMAC_COMPLIANCE_MANAGER: [
    'PUBLIC',
    'ASSET_OWNER_ONLY',
    'ASSET_OWNER_AND_REGULATOR',
    'REGULATOR_AND_ASSET_OWNER',
    'SERVICE_AND_ABOVE',
    'PLATFORM_OPERATOR',
  ],
  RIMAC_SERVICE_USER: [
    'PUBLIC',
    'ASSET_OWNER_ONLY',
    'ASSET_OWNER_AND_REGULATOR',
    'SERVICE_AND_ABOVE',
  ],
  SUPPLIER_USER: ['PUBLIC'],
};

// ============================================================
// ROLE PERMISSION MAP
// Maps each role to the permissions they have
// ============================================================

export const ROLE_PERMISSION_MAP: Record<UserRole, Permission[]> = {
  PUBLIC_VIEWER: ['view_public_passport'],
  ASSET_OWNER: [
    'view_public_passport',
    'view_private_passport',
    'view_telemetry',
    'view_compliance',
    'view_documents',
    'view_esg',
    'create_tasks',
    'export_reports',
  ],
  RIMAC_SERVICE_ENGINEER: [
    'view_public_passport',
    'view_private_passport',
    'view_telemetry',
    'view_telemetry_detailed',
    'view_compliance',
    'view_documents',
    'create_tasks',
    'upload_documents',
    'export_reports',
  ],
  ENT_PLATFORM_OPERATOR: [
    'view_public_passport',
    'view_private_passport',
    'view_telemetry',
    'view_telemetry_detailed',
    'view_compliance',
    'view_documents',
    'view_audit_trail',
    'view_system_status',
    'create_tasks',
    'upload_documents',
    'export_reports',
  ],
  REGULATOR: [
    'view_public_passport',
    'view_private_passport',
    'view_compliance',
    'view_documents',
    'view_audit_trail',
    'view_esg',
    'export_reports',
  ],
  RECYCLER: [
    'view_public_passport',
    'view_private_passport',
    'view_documents',
    'view_recycling_data',
  ],
  ADMIN: [
    'view_public_passport',
    'view_private_passport',
    'view_telemetry',
    'view_telemetry_detailed',
    'view_compliance',
    'view_documents',
    'view_audit_trail',
    'view_system_status',
    'create_tasks',
    'upload_documents',
    'manage_demo_data',
    'export_reports',
    'view_esg',
    'view_recycling_data',
  ],
  RIMAC_OPERATOR: [
    'view_public_passport',
    'view_private_passport',
    'view_telemetry',
    'view_compliance',
    'view_documents',
    'create_assets',
    'edit_assets',
    'import_csv',
    'import_mock_api',
    'create_lifecycle_events',
    'upload_documents',
    'create_tasks',
    'export_reports',
  ],
  RIMAC_COMPLIANCE_MANAGER: [
    'view_public_passport',
    'view_private_passport',
    'view_telemetry',
    'view_compliance',
    'view_documents',
    'view_audit_trail',
    'review_compliance',
    'approve_evidence',
    'reject_evidence',
    'request_changes',
    'publish_passport',
    'upload_documents',
    'create_tasks',
    'export_reports',
  ],
  RIMAC_SERVICE_USER: [
    'view_public_passport',
    'view_private_passport',
    'view_telemetry',
    'view_telemetry_detailed',
    'view_documents',
    'create_lifecycle_events',
    'upload_documents',
    'create_tasks',
  ],
  SUPPLIER_USER: [
    'view_public_passport',
    'view_supplier_obligations',
    'submit_declarations',
    'upload_documents',
    'view_own_submissions',
  ],
};

// ============================================================
// ROUTE PERMISSIONS
// Maps route patterns to roles that can access them
// ============================================================

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/': [
    'PUBLIC_VIEWER',
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
    'SUPPLIER_USER',
  ],
  '/public/passport/:passportId': [
    'PUBLIC_VIEWER',
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
    'SUPPLIER_USER',
  ],
  '/login': [
    'PUBLIC_VIEWER',
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
    'SUPPLIER_USER',
  ],
  '/dashboard': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
    'SUPPLIER_USER',
  ],
  '/assets': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
  ],
  '/assets/new': ['RIMAC_OPERATOR', 'ADMIN'],
  '/assets/:assetId': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
  ],
  '/assets/:assetId/passport': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
  ],
  '/assets/:assetId/passport/publish': ['RIMAC_COMPLIANCE_MANAGER', 'ADMIN'],
  '/assets/:assetId/telemetry': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
  ],
  '/assets/:assetId/timeline': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
  ],
  '/compliance': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
  ],
  '/documents': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'REGULATOR',
    'RECYCLER',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
    'RIMAC_SERVICE_USER',
    'SUPPLIER_USER',
  ],
  '/audit': ['ENT_PLATFORM_OPERATOR', 'REGULATOR', 'ADMIN', 'RIMAC_COMPLIANCE_MANAGER'],
  '/tasks': [
    'ASSET_OWNER',
    'RIMAC_SERVICE_ENGINEER',
    'ENT_PLATFORM_OPERATOR',
    'ADMIN',
    'RIMAC_OPERATOR',
    'RIMAC_COMPLIANCE_MANAGER',
  ],
  '/import': ['RIMAC_OPERATOR', 'ADMIN'],
  '/integrations': ['RIMAC_OPERATOR', 'ENT_PLATFORM_OPERATOR', 'ADMIN'],
  '/supplier': ['SUPPLIER_USER'],
  '/system': ['ENT_PLATFORM_OPERATOR', 'ADMIN'],
  '/admin/demo-data': ['ADMIN'],
};

// ============================================================
// PUBLIC ROUTES — do not require authentication
// ============================================================

const PUBLIC_ROUTES = ['/', '/public/passport/:passportId', '/login'];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Returns a human-readable description of an access level
 */
function getAccessLevelDescription(accessLevel: AccessLevel): string {
  const descriptions: Record<AccessLevel, string> = {
    PUBLIC: 'all users',
    ASSET_OWNER_ONLY: 'asset owners and above',
    ASSET_OWNER_AND_REGULATOR: 'asset owners and regulators',
    REGULATOR_AND_ASSET_OWNER: 'regulators and asset owners',
    SERVICE_AND_ABOVE: 'service engineers and platform operators',
    PLATFORM_OPERATOR: 'platform operators',
    ADMIN_ONLY: 'administrators',
  };
  return descriptions[accessLevel];
}

/**
 * Matches a concrete route path against the parameterized route patterns.
 * Returns the matched pattern or null if no match found.
 */
function matchRoute(
  path: string,
  routePatterns: string[]
): string | null {
  // Try exact match first
  if (routePatterns.includes(path)) {
    return path;
  }

  // Try parameterized pattern match
  for (const pattern of routePatterns) {
    const regexStr = pattern
      .replace(/:[^/]+/g, '[^/]+')
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexStr}$`);
    if (regex.test(path)) {
      return pattern;
    }
  }

  return null;
}

// ============================================================
// CORE RBAC FUNCTIONS
// ============================================================

export interface FilteredResult<T> {
  visible: T[];
  restricted: Array<{ item: T; reason: string }>;
}

/**
 * Filters items by the current user's role, splitting them into
 * visible (accessible) and restricted (not accessible) arrays.
 *
 * Items whose accessLevel is in ROLE_ACCESS_MAP[role] go to visible,
 * others go to restricted with a reason string.
 *
 * Preserves item order within each group.
 */
export function filterByRole<T extends { accessLevel: AccessLevel }>(
  items: T[],
  currentRole: UserRole
): FilteredResult<T> {
  const allowedLevels = ROLE_ACCESS_MAP[currentRole];

  const visible: T[] = [];
  const restricted: Array<{ item: T; reason: string }> = [];

  for (const item of items) {
    if (allowedLevels.includes(item.accessLevel)) {
      visible.push(item);
    } else {
      restricted.push({
        item,
        reason: `Restricted: available to ${getAccessLevelDescription(item.accessLevel)}`,
      });
    }
  }

  return { visible, restricted };
}

export interface RouteAccessResult {
  allowed: boolean;
  redirect?: string;
  reason?: string;
}

/**
 * Determines whether a given role can access a specific route.
 *
 * Returns { allowed: true } if the role is in the route's allowed list.
 * Returns { allowed: false, redirect, reason } if denied:
 *   - Redirects to '/login' for PUBLIC_VIEWER trying to access auth-required routes
 *   - Redirects to '/dashboard' for authenticated users without proper role
 *   - Redirects to '/dashboard' for unknown routes
 */
export function canAccessRoute(
  path: string,
  currentRole: UserRole
): RouteAccessResult {
  const matchedRoute = matchRoute(path, Object.keys(ROUTE_PERMISSIONS));

  if (!matchedRoute) {
    return {
      allowed: false,
      redirect: '/dashboard',
      reason: 'Route not found',
    };
  }

  const allowedRoles = ROUTE_PERMISSIONS[matchedRoute];

  if (allowedRoles.includes(currentRole)) {
    return { allowed: true };
  }

  // Determine redirect destination
  const isPublicRoute = PUBLIC_ROUTES.includes(matchedRoute);
  const isAuthenticated = currentRole !== 'PUBLIC_VIEWER';

  const redirect = isAuthenticated ? '/dashboard' : '/login';

  return {
    allowed: false,
    redirect,
    reason: `Access restricted for role: ${currentRole}`,
  };
}

/**
 * Checks if a role has a specific permission.
 */
export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSION_MAP[role].includes(permission);
}
