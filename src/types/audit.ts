import type { UserRole } from './index';

// ============================================================
// AUDIT & LIFECYCLE MODELS
// ============================================================

export interface AuditEvent {
  auditEventId: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValueHash?: string;
  newValueHash?: string;
  reason: string;
  sourceDevice?: string;
  traceId: string;
  verificationReference?: string;
}

export type AuditAction =
  | 'ATTRIBUTE_CREATED'
  | 'ATTRIBUTE_UPDATED'
  | 'ATTRIBUTE_STATUS_CHANGED'
  | 'ATTRIBUTE_VERIFIED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_EXPIRED'
  | 'ROLE_ACCESS_GRANTED'
  | 'TELEMETRY_INGESTED'
  | 'TASK_CREATED'
  | 'TASK_RESOLVED'
  | 'PASSPORT_CREATED'
  | 'EXPORT_GENERATED';

export type EntityType = 'ASSET' | 'PASSPORT_ATTRIBUTE' | 'DOCUMENT' | 'TELEMETRY' | 'TASK' | 'USER';

export interface LifecycleEvent {
  id: string;
  assetId: string;
  type: LifecycleEventType;
  category: EventCategory;
  timestamp: string;
  actor: string;
  source: 'BMS' | 'manual' | 'system' | 'supplier';
  description: string;
  documentId?: string;
  metadata?: Record<string, string>;
}

export type LifecycleEventType =
  | 'design_freeze'
  | 'production_batch_created'
  | 'module_assembly'
  | 'factory_acceptance_test'
  | 'passport_created'
  | 'shipment'
  | 'commissioning'
  | 'firmware_update'
  | 'service_inspection'
  | 'alarm_event'
  | 'warranty_review'
  | 'repurposing_assessment'
  | 'recycling_handover';

export type EventCategory = 'production' | 'operational' | 'service' | 'compliance';
