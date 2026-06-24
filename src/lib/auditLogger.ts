import type { EntityType } from '../types/audit';
import type { UserRole } from '../types/index';
import type { DataSource } from '../types/passport';
import type { VisibilityLevel } from '../types/dataIngestion';
import type { ExtendedAuditAction, EnhancedAuditEvent } from '../types/workflow';

/**
 * Generate a unique audit event ID with format: AUD-{timestamp}-{random}
 */
function generateAuditEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `AUD-${timestamp}-${random}`;
}

/**
 * Generate a trace ID for correlating related audit events.
 */
function generateTraceId(): string {
  const parts = [
    Math.random().toString(36).substring(2, 10),
    Math.random().toString(36).substring(2, 10),
    Math.random().toString(36).substring(2, 10),
  ];
  return parts.join('-');
}

/**
 * Create a fully-formed audit event object ready to be pushed to the store.
 *
 * Generates unique auditEventId, traceId, and timestamp automatically.
 */
export function createAuditEvent(params: {
  action: ExtendedAuditAction;
  entityType: EntityType;
  entityId: string;
  actor: string;
  actorRole: UserRole;
  reason: string;
  dataSource?: DataSource;
  affectedFields?: string[];
  scoreImpact?: number;
  visibility?: VisibilityLevel;
}): EnhancedAuditEvent {
  return {
    auditEventId: generateAuditEventId(),
    timestamp: new Date().toISOString(),
    actor: params.actor,
    actorRole: params.actorRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    reason: params.reason,
    traceId: generateTraceId(),
    dataSource: params.dataSource ?? 'manual',
    affectedFields: params.affectedFields,
    scoreImpact: params.scoreImpact,
    visibility: params.visibility,
  };
}
