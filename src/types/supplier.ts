// ============================================================
// SUPPLIER & OBLIGATION TYPES
// ============================================================

export type ObligationStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';

export interface SupplierObligation {
  obligationId: string;
  assetId: string;
  supplierId: string;
  component: string;
  requiredEvidence: string;
  status: ObligationStatus;
  dueDate: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface SupplierDeclaration {
  declarationId: string;
  obligationId: string;
  type: 'structured_data' | 'document_upload';
  content?: Record<string, unknown>;
  documentId?: string;
  submittedBy: string;
  submittedAt: string;
}
