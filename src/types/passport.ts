import type { AccessLevel } from './index';

// ============================================================
// PASSPORT MODEL
// ============================================================

export interface PassportAttribute {
  attributeId: string;
  passportId: string;
  section: PassportSection;
  name: string;
  value: string | number | boolean | null;
  unit?: string;
  status: AttributeStatus;
  verificationStatus: VerificationStatus;
  source: DataSource;
  confidence: ConfidenceLevel;
  accessLevel: AccessLevel;
  lastUpdated: string;
  verifier?: string;
  verifiedAt?: string;
  referenceDocumentId?: string;
}

export type PassportSection =
  | 'Identity'
  | 'Manufacturer'
  | 'Technical'
  | 'Chemistry'
  | 'Carbon Footprint'
  | 'Recycled Content'
  | 'Performance'
  | 'State of Health'
  | 'Due Diligence'
  | 'Safety'
  | 'End of Life'
  | 'Documents'
  | 'Audit';

export type AttributeStatus = 'missing' | 'draft' | 'provided' | 'verified' | 'expired' | 'not_applicable';
export type VerificationStatus = 'not_started' | 'pending_internal' | 'pending_external_verification' | 'verified' | 'rejected';
export type DataSource = 'manual' | 'BMS' | 'ERP' | 'MES' | 'supplier_declaration' | 'document_upload' | 'calculated' | 'simulated' | 'platform' | 'public_spec';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
