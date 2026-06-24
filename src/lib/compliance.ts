import type { PassportAttribute, PassportSection, DataSource } from '@/types/passport';
import type { Document } from '@/types/document';
import type { ComplianceLevel } from '@/types/asset';

// ============================================================
// COMPLIANCE SCORE CALCULATOR
// Implements FR-004: Compliance score calculation with weighted
// source quality and gap analysis.
// ============================================================

export interface ComplianceScoreResult {
  score: number; // 0-100
  level: ComplianceLevel; // derived from score
  totalRequired: number;
  providedCount: number;
  verifiedCount: number;
  missingCount: number;
  expiredDocuments: number;
  gaps: ComplianceGap[];
  topGaps: ComplianceGap[]; // top 5
}

export interface ComplianceGap {
  attributeId: string;
  section: PassportSection;
  name: string;
  impact: number;
  recommendation: string;
}

/** High-impact sections receive a higher gap weight */
const HIGH_IMPACT_SECTIONS: PassportSection[] = [
  'Identity',
  'Safety',
  'Due Diligence',
];

/** Medium-impact sections */
const MEDIUM_IMPACT_SECTIONS: PassportSection[] = [
  'Manufacturer',
  'Technical',
  'Chemistry',
  'Carbon Footprint',
  'Performance',
  'State of Health',
];

/**
 * Returns a quality weight for the given data source.
 * Higher weight = more trustworthy source.
 */
export function getSourceWeight(source: DataSource): number {
  const weights: Record<DataSource, number> = {
    document_upload: 1.0,
    platform: 1.0,
    BMS: 0.9,
    ERP: 0.9,
    MES: 0.9,
    supplier_declaration: 0.7,
    calculated: 0.7,
    manual: 0.6,
    public_spec: 0.5,
    simulated: 0.3,
  };
  return weights[source] ?? 0.5;
}

/**
 * Maps a numeric score (0-100) to a ComplianceLevel.
 */
export function scoreToLevel(score: number): ComplianceLevel {
  if (score >= 90) return 'passport_ready';
  if (score >= 75) return 'nearly_ready';
  if (score >= 50) return 'needs_attention';
  return 'critical_gaps';
}

/**
 * Creates a ComplianceGap entry for a missing attribute.
 * Impact is determined by the attribute's section.
 */
export function createGap(attr: PassportAttribute): ComplianceGap {
  const impact = getSectionImpact(attr.section);
  const recommendation = `Provide ${attr.name} data from ${getRecommendedSource(attr.section)}`;

  return {
    attributeId: attr.attributeId,
    section: attr.section,
    name: attr.name,
    impact,
    recommendation,
  };
}

function getSectionImpact(section: PassportSection): number {
  if (HIGH_IMPACT_SECTIONS.includes(section)) return 2.0;
  if (MEDIUM_IMPACT_SECTIONS.includes(section)) return 1.0;
  return 0.5;
}

function getRecommendedSource(section: PassportSection): string {
  switch (section) {
    case 'Identity':
    case 'Manufacturer':
      return 'ERP or platform integration';
    case 'Technical':
    case 'Chemistry':
      return 'manufacturer documentation';
    case 'Carbon Footprint':
    case 'Recycled Content':
      return 'supplier declaration or verified document';
    case 'Performance':
    case 'State of Health':
      return 'BMS telemetry';
    case 'Due Diligence':
    case 'Safety':
      return 'verified document upload';
    case 'End of Life':
      return 'recycler documentation';
    case 'Documents':
    case 'Audit':
      return 'platform records';
    default:
      return 'appropriate data source';
  }
}

/**
 * Calculates the compliance score for a set of passport attributes and documents.
 *
 * Scoring logic:
 * - Each non-not_applicable attribute contributes up to 2 weighted points (provided + verified bonus)
 * - Source quality weight is applied to each point earned
 * - Expired documents deduct 2 raw points each
 * - Final score is normalized to 0-100 and clamped
 */
export function calculateComplianceScore(
  attributes: PassportAttribute[],
  documents: Document[]
): ComplianceScoreResult {
  const required = attributes.filter((a) => a.status !== 'not_applicable');
  const maxScore = required.length * 2; // max 2 points per required attribute

  // Guard against division by zero
  if (maxScore === 0) {
    return {
      score: 0,
      level: 'critical_gaps',
      totalRequired: 0,
      providedCount: 0,
      verifiedCount: 0,
      missingCount: 0,
      expiredDocuments: documents.filter((d) => d.status === 'expired').length,
      gaps: [],
      topGaps: [],
    };
  }

  let rawScore = 0;
  const gaps: ComplianceGap[] = [];

  for (const attr of required) {
    const sourceWeight = getSourceWeight(attr.source);

    if (attr.status === 'provided' || attr.status === 'verified') {
      rawScore += 1 * sourceWeight;
    }
    if (attr.status === 'verified') {
      rawScore += 1 * sourceWeight;
    }
    if (attr.status === 'missing') {
      gaps.push(createGap(attr));
    }
  }

  // Deduct for expired documents
  const expiredDocs = documents.filter((d) => d.status === 'expired');
  rawScore -= expiredDocs.length * 2;

  const score = Math.max(0, Math.min(100, (rawScore / maxScore) * 100));
  const level = scoreToLevel(score);

  const sortedGaps = gaps.sort((a, b) => b.impact - a.impact);

  return {
    score: Math.round(score * 10) / 10,
    level,
    totalRequired: required.length,
    providedCount: required.filter(
      (a) => a.status === 'provided' || a.status === 'verified'
    ).length,
    verifiedCount: required.filter((a) => a.status === 'verified').length,
    missingCount: required.filter((a) => a.status === 'missing').length,
    expiredDocuments: expiredDocs.length,
    gaps: sortedGaps,
    topGaps: sortedGaps.slice(0, 5),
  };
}
