import type { DataSource, PassportSection } from './passport';
import type { AuditEvent, AuditAction, LifecycleEventType, EventCategory } from './audit';
import type { DocumentType } from './document';
import type { VisibilityLevel } from './dataIngestion';

// ============================================================
// WORKFLOW & REVIEW TYPES
// ============================================================

export type ReviewStatus = 'pending_review' | 'approved' | 'rejected' | 'changes_requested';

export interface ReviewAction {
  action: 'approve' | 'reject' | 'request_changes';
  reviewer: string;
  timestamp: string;
  comment: string;
}

export interface ReviewableItem {
  itemId: string;
  type: 'supplier_declaration' | 'document' | 'passport_attribute';
  title: string;
  submittedBy: string;
  submittedAt: string;
  source: DataSource;
  status: ReviewStatus;
  content: Record<string, unknown>;
  linkedDocumentId?: string;
  reviewHistory: ReviewAction[];
}

export interface ReviewResult {
  success: boolean;
  newStatus: ReviewStatus;
  scoreChange?: number;
}

export interface SectionScore {
  section: PassportSection;
  score: number;
  completedCount: number;
  totalCount: number;
  blockers: string[];
}

export interface ScoreSnapshot {
  timestamp: string;
  score: number;
  trigger: string;
}

export interface PassportCompletenessScore {
  assetId: string;
  overallScore: number;
  sectionScores: SectionScore[];
  completedFields: number;
  totalRequiredFields: number;
  verifiedFields: number;
  pendingReviewFields: number;
  lastUpdated: string;
  trend: 'improving' | 'stable' | 'declining';
  scoreHistory: ScoreSnapshot[];
}

export type PublishStep = 'readiness_check' | 'preview' | 'confirm' | 'published';

export interface PublishReadinessCheck {
  isReady: boolean;
  score: number;
  requiredFieldsComplete: boolean;
  publicFieldsPopulated: boolean;
  blockers: string[];
  warnings: string[];
}

export interface PublicPassportData {
  passportId: string;
  model: string;
  manufacturer: string;
  batteryCategory: string;
  capacity: string;
  chemistry: string;
  productionYear: number;
  publicSafetySummary: string;
  recyclingSummary: string;
  complianceBadge: string;
  publishedAt: string;
  publishedBy: string;
}

export interface PublishResult {
  success: boolean;
  publicPassport: PublicPassportData;
  auditEventId: string;
  publishedAt: string;
}

export interface DocumentUpload {
  uploadId: string;
  documentType: DocumentType | ExtendedDocumentType;
  title: string;
  description: string;
  linkedAssetId: string;
  linkedPassportAttributes: string[];
  visibility: VisibilityLevel;
  status: DocumentUploadStatus;
  uploadedBy: string;
  uploadedAt: string;
  fileSimulation: {
    fileName: string;
    fileSize: string;
    mimeType: string;
  };
  reviewStatus: ReviewStatus;
  reviewComment?: string;
}

export type DocumentUploadStatus = 'uploading' | 'uploaded' | 'linked' | 'verified' | 'rejected';

export type ExtendedDocumentType =
  | 'RECYCLED_CONTENT_DECLARATION'
  | 'SUPPLIER_DUE_DILIGENCE_STATEMENT'
  | 'ORIGIN_DECLARATION'
  | 'ROHS_REACH_DECLARATION'
  | 'MATERIAL_COMPOSITION_DECLARATION'
  | 'BATTERY_CHEMISTRY_DECLARATION'
  | 'QUALITY_GATE_REPORT'
  | 'PERFORMANCE_TEST_REPORT';

export type ExtendedAuditAction =
  | AuditAction
  | 'ASSET_DRAFT_SAVED'
  | 'CSV_IMPORT_COMPLETED'
  | 'MOCK_API_IMPORT'
  | 'TELEMETRY_SIMULATOR_STARTED'
  | 'TELEMETRY_SIMULATOR_STOPPED'
  | 'TELEMETRY_SCENARIO_CHANGED'
  | 'SUPPLIER_DECLARATION_SUBMITTED'
  | 'COMPLIANCE_REVIEW_APPROVED'
  | 'COMPLIANCE_REVIEW_REJECTED'
  | 'COMPLIANCE_CHANGES_REQUESTED'
  | 'PASSPORT_PUBLISHED'
  | 'PASSPORT_UNPUBLISHED'
  | 'LIFECYCLE_EVENT_ADDED'
  | 'DOCUMENT_LINKED'
  | 'VISIBILITY_CHANGED'
  | 'COMPLETENESS_RECALCULATED';

export interface EnhancedAuditEvent extends Omit<AuditEvent, 'action'> {
  action: ExtendedAuditAction;
  dataSource: DataSource;
  affectedFields?: string[];
  scoreImpact?: number;
  visibility?: VisibilityLevel;
}

export type ExtendedLifecycleEventType =
  | LifecycleEventType
  | 'maintenance_performed'
  | 'capacity_test'
  | 'software_update'
  | 'site_relocation'
  | 'ownership_transfer'
  | 'insurance_assessment'
  | 'performance_certification';

export interface NewLifecycleEvent {
  type: ExtendedLifecycleEventType;
  category: EventCategory;
  description: string;
  actor: string;
  timestamp: string;
  source: 'manual';
  documentId?: string;
  metadata?: Record<string, string>;
}
