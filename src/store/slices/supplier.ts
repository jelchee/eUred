import type { StateCreator } from 'zustand';
import type { SupplierObligation, SupplierDeclaration } from '@/types';
import { obligations as demoObligations } from '@/data/obligations';

// ============================================================
// SUPPLIER SLICE
// ============================================================

export interface SupplierSlice {
  obligations: SupplierObligation[];
  declarations: SupplierDeclaration[];

  // Supplier actions
  submitDeclaration: (declaration: SupplierDeclaration) => void;
  getObligationsForSupplier: (supplierId: string) => SupplierObligation[];

  // Compliance manager actions
  approveDeclaration: (declarationId: string, comment: string) => void;
  rejectDeclaration: (declarationId: string, reason: string) => void;
  requestChanges: (declarationId: string, comment: string) => void;
}

export const createSupplierSlice: StateCreator<
  SupplierSlice,
  [['zustand/immer', never]],
  [],
  SupplierSlice
> = (set, get) => ({
  obligations: [...demoObligations],
  declarations: [],

  submitDeclaration: (declaration: SupplierDeclaration) => {
    set((state) => {
      state.declarations.push(declaration);
      // Set the corresponding obligation status to 'under_review'
      const obligation = state.obligations.find(
        (o) => o.obligationId === declaration.obligationId
      );
      if (obligation) {
        obligation.status = 'under_review';
        obligation.submittedAt = declaration.submittedAt;
      }
    });
  },

  getObligationsForSupplier: (supplierId: string) => {
    return get().obligations.filter((o) => o.supplierId === supplierId);
  },

  approveDeclaration: (declarationId: string, comment: string) => {
    let assetId: string | undefined;

    set((state) => {
      const declaration = state.declarations.find((d) => d.declarationId === declarationId);
      if (declaration) {
        const obligation = state.obligations.find(
          (o) => o.obligationId === declaration.obligationId
        );
        if (obligation) {
          obligation.status = 'approved';
          obligation.reviewedAt = new Date().toISOString();
          obligation.reviewedBy = comment ? `reviewer (${comment})` : 'reviewer';
          assetId = obligation.assetId;
        }
      }
    });

    // Trigger completeness recalculation after declaration approval
    if (assetId) {
      const store = get() as unknown as { recalculateCompleteness: (id: string, trigger?: string) => void };
      if (store.recalculateCompleteness) {
        store.recalculateCompleteness(assetId, 'supplier_declaration_approved');
      }
    }
  },

  rejectDeclaration: (declarationId: string, reason: string) => {
    set((state) => {
      const declaration = state.declarations.find((d) => d.declarationId === declarationId);
      if (declaration) {
        const obligation = state.obligations.find(
          (o) => o.obligationId === declaration.obligationId
        );
        if (obligation) {
          obligation.status = 'rejected';
          obligation.reviewedAt = new Date().toISOString();
          obligation.rejectionReason = reason;
        }
      }
    });
  },

  requestChanges: (declarationId: string, comment: string) => {
    set((state) => {
      const declaration = state.declarations.find((d) => d.declarationId === declarationId);
      if (declaration) {
        const obligation = state.obligations.find(
          (o) => o.obligationId === declaration.obligationId
        );
        if (obligation) {
          obligation.status = 'changes_requested';
          obligation.reviewedAt = new Date().toISOString();
          obligation.rejectionReason = comment;
        }
      }
    });
  },
});
