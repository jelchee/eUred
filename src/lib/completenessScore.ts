import type { Asset } from '../types/asset';
import type { PassportAttribute, PassportSection } from '../types/passport';
import type { Document } from '../types/document';
import type { PassportCompletenessScore, SectionScore, ScoreSnapshot } from '../types/workflow';
import type { SupplierObligation } from '../types/supplier';

/**
 * Calculate completeness score for a battery passport.
 *
 * Scoring formula:
 * - 40% field population (non-missing attributes / total required attributes)
 * - 30% verification (verified attributes / total required attributes)
 * - 20% documents (verified documents / total linked documents)
 * - 10% supplier declarations (approved declarations / total declarations)
 *
 * The overall score is the average across all sections.
 */
export function calculateCompletenessScore(
  asset: Asset,
  attributes: PassportAttribute[],
  documents: Document[],
  declarations: SupplierObligation[],
  previousSnapshots?: ScoreSnapshot[]
): PassportCompletenessScore {
  // Group attributes by section
  const sectionMap = new Map<PassportSection, PassportAttribute[]>();
  for (const attr of attributes) {
    const existing = sectionMap.get(attr.section) || [];
    existing.push(attr);
    sectionMap.set(attr.section, existing);
  }

  const sectionScores: SectionScore[] = [];
  let totalCompletedFields = 0;
  let totalRequiredFields = 0;
  let totalVerifiedFields = 0;
  let totalPendingReviewFields = 0;

  for (const [section, sectionAttrs] of sectionMap.entries()) {
    const totalCount = sectionAttrs.length;
    const populatedAttrs = sectionAttrs.filter((a) => a.status !== 'missing');
    const verifiedAttrs = sectionAttrs.filter((a) => a.verificationStatus === 'verified');
    const pendingAttrs = sectionAttrs.filter(
      (a) =>
        a.verificationStatus === 'pending_internal' ||
        a.verificationStatus === 'pending_external_verification'
    );

    // Section-specific documents (linked to attributes in this section)
    const sectionAttrIds = new Set(sectionAttrs.map((a) => a.attributeId));
    const sectionDocs = documents.filter((doc) =>
      doc.linkedAttributes.some((attrId) => sectionAttrIds.has(attrId))
    );
    const verifiedDocs = sectionDocs.filter((doc) => doc.status === 'verified');

    // Section-specific declarations (by asset)
    const sectionDeclarations = declarations.filter((d) => d.assetId === asset.assetId);
    const approvedDeclarations = sectionDeclarations.filter((d) => d.status === 'approved');

    // Calculate weighted section score
    const populationScore = totalCount > 0 ? (populatedAttrs.length / totalCount) * 40 : 0;
    const verificationScore = totalCount > 0 ? (verifiedAttrs.length / totalCount) * 30 : 0;
    const documentScore =
      sectionDocs.length > 0 ? (verifiedDocs.length / sectionDocs.length) * 20 : 0;
    const supplierScore =
      sectionDeclarations.length > 0
        ? (approvedDeclarations.length / sectionDeclarations.length) * 10
        : 0;

    const sectionScore = populationScore + verificationScore + documentScore + supplierScore;

    const blockers: string[] = [];
    if (populatedAttrs.length < totalCount) {
      blockers.push(`${totalCount - populatedAttrs.length} missing fields`);
    }
    if (verifiedAttrs.length < totalCount) {
      blockers.push(`${totalCount - verifiedAttrs.length} unverified fields`);
    }

    sectionScores.push({
      section,
      score: Math.round(sectionScore * 100) / 100,
      completedCount: populatedAttrs.length,
      totalCount,
      blockers,
    });

    totalCompletedFields += populatedAttrs.length;
    totalRequiredFields += totalCount;
    totalVerifiedFields += verifiedAttrs.length;
    totalPendingReviewFields += pendingAttrs.length;
  }

  // Overall score is the average of section scores
  const overallScore =
    sectionScores.length > 0
      ? Math.round(
          (sectionScores.reduce((sum, s) => sum + s.score, 0) / sectionScores.length) * 100
        ) / 100
      : 0;

  // Determine trend from last 3 snapshots
  const trend = determineTrend(overallScore, previousSnapshots ?? []);

  // Create new snapshot
  const newSnapshot: ScoreSnapshot = {
    timestamp: new Date().toISOString(),
    score: overallScore,
    trigger: 'completeness_recalculated',
  };

  const scoreHistory = [...(previousSnapshots ?? []), newSnapshot].slice(-10);

  return {
    assetId: asset.assetId,
    overallScore,
    sectionScores,
    completedFields: totalCompletedFields,
    totalRequiredFields,
    verifiedFields: totalVerifiedFields,
    pendingReviewFields: totalPendingReviewFields,
    lastUpdated: new Date().toISOString(),
    trend,
    scoreHistory,
  };
}

/**
 * Determine score trend based on previous snapshots.
 * Compares current score to the average of the last 3 snapshots.
 */
function determineTrend(
  currentScore: number,
  previousSnapshots: ScoreSnapshot[]
): 'improving' | 'stable' | 'declining' {
  if (previousSnapshots.length < 2) {
    return 'stable';
  }

  const recentSnapshots = previousSnapshots.slice(-3);
  const avgPrevious =
    recentSnapshots.reduce((sum, s) => sum + s.score, 0) / recentSnapshots.length;

  const diff = currentScore - avgPrevious;

  if (diff > 1) {
    return 'improving';
  } else if (diff < -1) {
    return 'declining';
  }
  return 'stable';
}
