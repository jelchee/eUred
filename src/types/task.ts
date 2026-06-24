import type { UserRole } from './index';

// ============================================================
// TASK MODEL
// ============================================================

export interface Task {
  taskId: string;
  type: TaskType;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  assignee: string;
  assigneeRole: UserRole;
  assetId: string;
  relatedEntityId?: string;
  dueDate: string;
  createdAt: string;
  resolvedAt?: string;
}

export type TaskType =
  | 'missing_attribute'
  | 'document_expiring'
  | 'telemetry_stopped'
  | 'high_temperature'
  | 'soh_below_threshold'
  | 'supplier_declaration_missing'
  | 'carbon_verification_pending';
