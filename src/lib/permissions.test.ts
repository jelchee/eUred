import { describe, it, expect } from 'vitest';
import {
  ROLE_ACCESS_MAP,
  ROUTE_PERMISSIONS,
  filterByRole,
  canAccessRoute,
  hasPermission,
} from './permissions';
import type { AccessLevel } from '@/types';

describe('ROLE_ACCESS_MAP', () => {
  it('PUBLIC_VIEWER can only see PUBLIC access level', () => {
    expect(ROLE_ACCESS_MAP.PUBLIC_VIEWER).toEqual(['PUBLIC']);
  });

  it('ADMIN has access to all access levels', () => {
    const allLevels: AccessLevel[] = [
      'PUBLIC',
      'ASSET_OWNER_ONLY',
      'ASSET_OWNER_AND_REGULATOR',
      'REGULATOR_AND_ASSET_OWNER',
      'SERVICE_AND_ABOVE',
      'PLATFORM_OPERATOR',
      'ADMIN_ONLY',
    ];
    for (const level of allLevels) {
      expect(ROLE_ACCESS_MAP.ADMIN).toContain(level);
    }
  });

  it('REGULATOR can see PUBLIC and regulator-shared levels', () => {
    expect(ROLE_ACCESS_MAP.REGULATOR).toContain('PUBLIC');
    expect(ROLE_ACCESS_MAP.REGULATOR).toContain('ASSET_OWNER_AND_REGULATOR');
    expect(ROLE_ACCESS_MAP.REGULATOR).toContain('REGULATOR_AND_ASSET_OWNER');
    expect(ROLE_ACCESS_MAP.REGULATOR).not.toContain('ASSET_OWNER_ONLY');
    expect(ROLE_ACCESS_MAP.REGULATOR).not.toContain('ADMIN_ONLY');
  });
});

describe('filterByRole', () => {
  const items = [
    { id: '1', accessLevel: 'PUBLIC' as AccessLevel, name: 'Public Item' },
    { id: '2', accessLevel: 'ASSET_OWNER_ONLY' as AccessLevel, name: 'Owner Item' },
    { id: '3', accessLevel: 'SERVICE_AND_ABOVE' as AccessLevel, name: 'Service Item' },
    { id: '4', accessLevel: 'ADMIN_ONLY' as AccessLevel, name: 'Admin Item' },
    { id: '5', accessLevel: 'ASSET_OWNER_AND_REGULATOR' as AccessLevel, name: 'Owner+Regulator Item' },
  ];

  it('PUBLIC_VIEWER only sees PUBLIC items', () => {
    const result = filterByRole(items, 'PUBLIC_VIEWER');
    expect(result.visible).toHaveLength(1);
    expect(result.visible[0].id).toBe('1');
    expect(result.restricted).toHaveLength(4);
  });

  it('ADMIN sees all items', () => {
    const result = filterByRole(items, 'ADMIN');
    expect(result.visible).toHaveLength(5);
    expect(result.restricted).toHaveLength(0);
  });

  it('ASSET_OWNER sees PUBLIC, ASSET_OWNER_ONLY, and shared levels', () => {
    const result = filterByRole(items, 'ASSET_OWNER');
    expect(result.visible.map((i) => i.id)).toContain('1');
    expect(result.visible.map((i) => i.id)).toContain('2');
    expect(result.visible.map((i) => i.id)).toContain('5');
    expect(result.visible.map((i) => i.id)).not.toContain('3');
    expect(result.visible.map((i) => i.id)).not.toContain('4');
  });

  it('preserves order within visible and restricted groups', () => {
    const result = filterByRole(items, 'ASSET_OWNER');
    const visibleIds = result.visible.map((i) => i.id);
    // Should preserve original relative order
    expect(visibleIds.indexOf('1')).toBeLessThan(visibleIds.indexOf('2'));
  });

  it('restricted items include a reason string', () => {
    const result = filterByRole(items, 'PUBLIC_VIEWER');
    for (const entry of result.restricted) {
      expect(entry.reason).toMatch(/Restricted:/);
    }
  });

  it('handles empty input array', () => {
    const result = filterByRole([], 'ADMIN');
    expect(result.visible).toHaveLength(0);
    expect(result.restricted).toHaveLength(0);
  });
});

describe('canAccessRoute', () => {
  it('allows PUBLIC_VIEWER to access public routes', () => {
    expect(canAccessRoute('/', 'PUBLIC_VIEWER').allowed).toBe(true);
    expect(canAccessRoute('/login', 'PUBLIC_VIEWER').allowed).toBe(true);
  });

  it('allows PUBLIC_VIEWER to access public passport with params', () => {
    expect(canAccessRoute('/public/passport/BP-001', 'PUBLIC_VIEWER').allowed).toBe(true);
  });

  it('denies PUBLIC_VIEWER access to dashboard and redirects to /login', () => {
    const result = canAccessRoute('/dashboard', 'PUBLIC_VIEWER');
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe('/login');
  });

  it('allows ADMIN to access all routes except supplier-only routes', () => {
    const routes = Object.keys(ROUTE_PERMISSIONS);
    for (const route of routes) {
      if (route === '/supplier') continue; // supplier-only route
      expect(canAccessRoute(route, 'ADMIN').allowed).toBe(true);
    }
  });

  it('denies ADMIN access to /supplier route', () => {
    const result = canAccessRoute('/supplier', 'ADMIN');
    expect(result.allowed).toBe(false);
  });

  it('denies RECYCLER access to telemetry', () => {
    const result = canAccessRoute('/assets/ASSET-001/telemetry', 'RECYCLER');
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe('/dashboard');
  });

  it('allows ASSET_OWNER access to telemetry', () => {
    const result = canAccessRoute('/assets/ASSET-001/telemetry', 'ASSET_OWNER');
    expect(result.allowed).toBe(true);
  });

  it('denies REGULATOR access to /system', () => {
    const result = canAccessRoute('/system', 'REGULATOR');
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe('/dashboard');
  });

  it('returns not found for unknown routes', () => {
    const result = canAccessRoute('/nonexistent', 'ADMIN');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Route not found');
  });

  it('matches parameterized routes correctly', () => {
    expect(canAccessRoute('/assets/ASSET-SEST-ZG-0001', 'ASSET_OWNER').allowed).toBe(true);
    expect(canAccessRoute('/assets/ASSET-SEST-ZG-0001/passport', 'ASSET_OWNER').allowed).toBe(true);
  });
});

describe('hasPermission', () => {
  it('ADMIN has manage_demo_data permission', () => {
    expect(hasPermission('ADMIN', 'manage_demo_data')).toBe(true);
  });

  it('PUBLIC_VIEWER only has view_public_passport', () => {
    expect(hasPermission('PUBLIC_VIEWER', 'view_public_passport')).toBe(true);
    expect(hasPermission('PUBLIC_VIEWER', 'view_private_passport')).toBe(false);
  });

  it('REGULATOR has view_audit_trail but not manage_demo_data', () => {
    expect(hasPermission('REGULATOR', 'view_audit_trail')).toBe(true);
    expect(hasPermission('REGULATOR', 'manage_demo_data')).toBe(false);
  });
});

describe('ROUTE_PERMISSIONS', () => {
  it('has all 20 routes defined', () => {
    expect(Object.keys(ROUTE_PERMISSIONS)).toHaveLength(20);
  });

  it('/admin/demo-data is restricted to ADMIN only', () => {
    expect(ROUTE_PERMISSIONS['/admin/demo-data']).toEqual(['ADMIN']);
  });

  it('/audit allows ENT_PLATFORM_OPERATOR, REGULATOR, ADMIN, RIMAC_COMPLIANCE_MANAGER', () => {
    expect(ROUTE_PERMISSIONS['/audit']).toEqual([
      'ENT_PLATFORM_OPERATOR',
      'REGULATOR',
      'ADMIN',
      'RIMAC_COMPLIANCE_MANAGER',
    ]);
  });

  it('/assets/new is restricted to RIMAC_OPERATOR and ADMIN', () => {
    expect(ROUTE_PERMISSIONS['/assets/new']).toEqual(['RIMAC_OPERATOR', 'ADMIN']);
  });

  it('/import is restricted to RIMAC_OPERATOR and ADMIN', () => {
    expect(ROUTE_PERMISSIONS['/import']).toEqual(['RIMAC_OPERATOR', 'ADMIN']);
  });

  it('/integrations allows RIMAC_OPERATOR, ENT_PLATFORM_OPERATOR, ADMIN', () => {
    expect(ROUTE_PERMISSIONS['/integrations']).toEqual([
      'RIMAC_OPERATOR',
      'ENT_PLATFORM_OPERATOR',
      'ADMIN',
    ]);
  });

  it('/supplier is restricted to SUPPLIER_USER', () => {
    expect(ROUTE_PERMISSIONS['/supplier']).toEqual(['SUPPLIER_USER']);
  });

  it('/assets/:assetId/passport/publish allows RIMAC_COMPLIANCE_MANAGER and ADMIN', () => {
    expect(ROUTE_PERMISSIONS['/assets/:assetId/passport/publish']).toEqual([
      'RIMAC_COMPLIANCE_MANAGER',
      'ADMIN',
    ]);
  });
});
