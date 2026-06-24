import type { AccessLevel } from './index';

// ============================================================
// DOCUMENT MODEL
// ============================================================

export interface Document {
  documentId: string;
  assetId: string;
  title: string;
  type: DocumentType;
  version: string;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  uploadedBy: string;
  uploadedAt: string;
  validFrom?: string;
  validUntil?: string;
  linkedAttributes: string[];
  fileSize?: string;
  mimeType?: string;
}

export type DocumentType =
  | 'EU_DECLARATION_OF_CONFORMITY'
  | 'SAFETY_INSTRUCTIONS'
  | 'TRANSPORT_HANDLING_GUIDE'
  | 'RECYCLING_INSTRUCTIONS'
  | 'CARBON_FOOTPRINT_STATEMENT'
  | 'SUPPLIER_DUE_DILIGENCE'
  | 'FACTORY_ACCEPTANCE_TEST'
  | 'COMMISSIONING_REPORT'
  | 'SERVICE_REPORT'
  | 'FIRMWARE_RELEASE_NOTES';

export type DocumentStatus = 'verified' | 'draft' | 'pending_verification' | 'expired';
