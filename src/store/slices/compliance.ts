import type { StateCreator } from 'zustand';
import { calculateComplianceScore, type ComplianceScoreResult } from '@/lib/compliance';
import { getAttributesByPassportId } from '@/data/passportAttributes';
import { documents } from '@/data/documents';

// ============================================================
// COMPLIANCE SLICE
// ============================================================

export interface ComplianceSlice {
  scores: Record<string, ComplianceScoreResult>;
  calculateScoreForAsset: (passportId: string) => ComplianceScoreResult;
}

export const createComplianceSlice: StateCreator<
  ComplianceSlice,
  [['zustand/immer', never]],
  [],
  ComplianceSlice
> = (set, get) => ({
  scores: {},

  calculateScoreForAsset: (passportId: string) => {
    const existing = get().scores[passportId];
    if (existing) return existing;

    const attributes = getAttributesByPassportId(passportId);
    const result = calculateComplianceScore(attributes, documents);

    set((state) => {
      state.scores[passportId] = result;
    });

    return result;
  },
});
