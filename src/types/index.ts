// ============================================================
// ROLES & ACCESS CONTROL
// ============================================================

export type UserRole =
  | 'PUBLIC_VIEWER'
  | 'ASSET_OWNER'
  | 'RIMAC_SERVICE_ENGINEER'
  | 'ENT_PLATFORM_OPERATOR'
  | 'REGULATOR'
  | 'RECYCLER'
  | 'ADMIN'
  | 'RIMAC_OPERATOR'
  | 'RIMAC_COMPLIANCE_MANAGER'
  | 'RIMAC_SERVICE_USER'
  | 'SUPPLIER_USER';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
}

export interface DemoOrganization {
  id: string;
  name: string;
  type: 'manufacturer' | 'platform_operator' | 'asset_owner' | 'regulator' | 'recycler' | 'admin' | 'supplier';
  country: string;
}

export type Permission =
  | 'view_public_passport'
  | 'view_private_passport'
  | 'view_telemetry'
  | 'view_telemetry_detailed'
  | 'view_compliance'
  | 'view_documents'
  | 'view_audit_trail'
  | 'view_system_status'
  | 'create_tasks'
  | 'upload_documents'
  | 'manage_demo_data'
  | 'export_reports'
  | 'view_esg'
  | 'view_recycling_data'
  | 'create_assets'
  | 'edit_assets'
  | 'import_csv'
  | 'import_mock_api'
  | 'create_lifecycle_events'
  | 'review_compliance'
  | 'approve_evidence'
  | 'reject_evidence'
  | 'request_changes'
  | 'publish_passport'
  | 'view_supplier_obligations'
  | 'submit_declarations'
  | 'view_own_submissions';

export interface RolePermissionMap {
  [role: string]: Permission[];
}

export type AccessLevel =
  | 'PUBLIC'
  | 'ASSET_OWNER_ONLY'
  | 'ASSET_OWNER_AND_REGULATOR'
  | 'REGULATOR_AND_ASSET_OWNER'
  | 'SERVICE_AND_ABOVE'
  | 'PLATFORM_OPERATOR'
  | 'ADMIN_ONLY';

// Re-export all domain types
export * from './asset';
export * from './passport';
export * from './telemetry';
export * from './document';
export * from './audit';
export * from './task';
export * from './esg';
export * from './dataIngestion';
export * from './supplier';
export * from './workflow';
