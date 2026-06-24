import { useMemo } from 'react';
import { useAppStore } from '@/store';

/**
 * Typed selector hook for compliance scoring.
 * Computes and caches compliance data for the given passport.
 */
export function useCompliance(passportId: string) {
  const calculateScoreForAsset = useAppStore((s) => s.calculateScoreForAsset);

  const result = useMemo(() => {
    return calculateScoreForAsset(passportId);
  }, [calculateScoreForAsset, passportId]);

  return {
    score: result.score,
    level: result.level,
    gaps: result.gaps,
    topGaps: result.topGaps,
    totalRequired: result.totalRequired,
    providedCount: result.providedCount,
    verifiedCount: result.verifiedCount,
    missingCount: result.missingCount,
  };
}
