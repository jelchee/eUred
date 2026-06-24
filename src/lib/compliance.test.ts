import { describe, it, expect } from 'vitest';
import {
  calculateComplianceScore,
  scoreToLevel,
  getSourceWeight,
  createGap,
} from './compliance';
import type { PassportAttribute, DataSource } from '@/types/passport';
import type { Document } from '@/types/document';

// ============================================================
// Helpers for building test fixtures
// ============================================================

function makeAttribute(
  overrides: Partial<PassportAttribute> = {}
): PassportAttribute {
  return {
    attributeId: 'attr-1',
    passportId: 'BP-001',
    section: 'Technical',
    name: 'Nominal Energy',
    value: 100,
    unit: 'kWh',
    status: 'provided',
    verificationStatus: 'not_started',
    source: 'document_upload',
    confidence: 'high',
    accessLevel: 'PUBLIC',
    lastUpdated: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeDocument(overrides: Partial<Document> = {}): Document {
  return {
    documentId: 'doc-1',
    assetId: 'ASSET-001',
    title: 'Test Document',
    type: 'EU_DECLARATION_OF_CONFORMITY',
    version: '1.0',
    status: 'verified',
    accessLevel: 'PUBLIC',
    uploadedBy: 'user-1',
    uploadedAt: '2024-01-01T00:00:00Z',
    linkedAttributes: [],
    ...overrides,
  };
}

// ============================================================
// scoreToLevel
// ============================================================

describe('scoreToLevel', () => {
  it('returns critical_gaps for scores 0-49', () => {
    expect(scoreToLevel(0)).toBe('critical_gaps');
    expect(scoreToLevel(25)).toBe('critical_gaps');
    expect(scoreToLevel(49)).toBe('critical_gaps');
    expect(scoreToLevel(49.9)).toBe('critical_gaps');
  });

  it('returns needs_attention for scores 50-74', () => {
    expect(scoreToLevel(50)).toBe('needs_attention');
    expect(scoreToLevel(60)).toBe('needs_attention');
    expect(scoreToLevel(74)).toBe('needs_attention');
    expect(scoreToLevel(74.9)).toBe('needs_attention');
  });

  it('returns nearly_ready for scores 75-89', () => {
    expect(scoreToLevel(75)).toBe('nearly_ready');
    expect(scoreToLevel(80)).toBe('nearly_ready');
    expect(scoreToLevel(89)).toBe('nearly_ready');
    expect(scoreToLevel(89.9)).toBe('nearly_ready');
  });

  it('returns passport_ready for scores 90-100', () => {
    expect(scoreToLevel(90)).toBe('passport_ready');
    expect(scoreToLevel(95)).toBe('passport_ready');
    expect(scoreToLevel(100)).toBe('passport_ready');
  });

  it('handles boundary values exactly', () => {
    expect(scoreToLevel(50)).toBe('needs_attention');
    expect(scoreToLevel(75)).toBe('nearly_ready');
    expect(scoreToLevel(90)).toBe('passport_ready');
  });
});

// ============================================================
// getSourceWeight
// ============================================================

describe('getSourceWeight', () => {
  it('returns 1.0 for document_upload', () => {
    expect(getSourceWeight('document_upload')).toBe(1.0);
  });

  it('returns 1.0 for platform', () => {
    expect(getSourceWeight('platform')).toBe(1.0);
  });

  it('returns 0.9 for BMS, ERP, MES', () => {
    expect(getSourceWeight('BMS')).toBe(0.9);
    expect(getSourceWeight('ERP')).toBe(0.9);
    expect(getSourceWeight('MES')).toBe(0.9);
  });

  it('returns 0.7 for supplier_declaration and calculated', () => {
    expect(getSourceWeight('supplier_declaration')).toBe(0.7);
    expect(getSourceWeight('calculated')).toBe(0.7);
  });

  it('returns 0.6 for manual', () => {
    expect(getSourceWeight('manual')).toBe(0.6);
  });

  it('returns 0.5 for public_spec', () => {
    expect(getSourceWeight('public_spec')).toBe(0.5);
  });

  it('returns 0.3 for simulated', () => {
    expect(getSourceWeight('simulated')).toBe(0.3);
  });

  it('returns 0.5 as default for unknown sources', () => {
    expect(getSourceWeight('unknown_source' as DataSource)).toBe(0.5);
  });
});

// ============================================================
// createGap
// ============================================================

describe('createGap', () => {
  it('creates a gap with high impact for Identity section', () => {
    const attr = makeAttribute({ section: 'Identity', name: 'Battery ID' });
    const gap = createGap(attr);
    expect(gap.impact).toBe(2.0);
    expect(gap.attributeId).toBe(attr.attributeId);
    expect(gap.section).toBe('Identity');
    expect(gap.name).toBe('Battery ID');
    expect(gap.recommendation).toContain('Battery ID');
  });

  it('creates a gap with high impact for Safety section', () => {
    const attr = makeAttribute({ section: 'Safety', name: 'Safety Certificate' });
    const gap = createGap(attr);
    expect(gap.impact).toBe(2.0);
  });

  it('creates a gap with medium impact for Technical section', () => {
    const attr = makeAttribute({ section: 'Technical', name: 'Nominal Energy' });
    const gap = createGap(attr);
    expect(gap.impact).toBe(1.0);
  });

  it('creates a gap with low impact for Documents section', () => {
    const attr = makeAttribute({ section: 'Documents', name: 'Service Manual' });
    const gap = createGap(attr);
    expect(gap.impact).toBe(0.5);
  });
});

// ============================================================
// calculateComplianceScore
// ============================================================

describe('calculateComplianceScore', () => {
  describe('score bounds', () => {
    it('returns score of 0 for all missing attributes', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'missing' }),
        makeAttribute({ attributeId: 'a2', status: 'missing' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      expect(result.score).toBe(0);
      expect(result.level).toBe('critical_gaps');
    });

    it('returns score clamped to 0 even with many expired documents', () => {
      const attrs = [makeAttribute({ status: 'provided', source: 'document_upload' })];
      const docs = Array.from({ length: 10 }, (_, i) =>
        makeDocument({ documentId: `doc-${i}`, status: 'expired' })
      );
      const result = calculateComplianceScore(attrs, docs);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('never returns score above 100', () => {
      const attrs = [
        makeAttribute({ status: 'verified', source: 'document_upload' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('returns perfect score (100) for all verified attributes from document_upload', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'verified', source: 'document_upload' }),
        makeAttribute({ attributeId: 'a2', status: 'verified', source: 'document_upload' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      expect(result.score).toBe(100);
    });
  });

  describe('determinism', () => {
    it('produces identical results for the same inputs', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'verified', source: 'BMS' }),
        makeAttribute({ attributeId: 'a2', status: 'provided', source: 'manual' }),
        makeAttribute({ attributeId: 'a3', status: 'missing', source: 'ERP' }),
      ];
      const docs = [makeDocument({ status: 'expired' })];

      const result1 = calculateComplianceScore(attrs, docs);
      const result2 = calculateComplianceScore(attrs, docs);

      expect(result1.score).toBe(result2.score);
      expect(result1.level).toBe(result2.level);
      expect(result1.gaps).toEqual(result2.gaps);
      expect(result1.topGaps).toEqual(result2.topGaps);
    });
  });

  describe('source weights applied correctly', () => {
    it('document_upload (weight 1.0) gives higher score than simulated (weight 0.3)', () => {
      const docUploadAttr = [
        makeAttribute({ status: 'provided', source: 'document_upload' }),
      ];
      const simulatedAttr = [
        makeAttribute({ status: 'provided', source: 'simulated' }),
      ];

      const docResult = calculateComplianceScore(docUploadAttr, []);
      const simResult = calculateComplianceScore(simulatedAttr, []);

      expect(docResult.score).toBeGreaterThan(simResult.score);
    });

    it('verified attribute with document_upload earns full 2 weighted points', () => {
      const attrs = [
        makeAttribute({ status: 'verified', source: 'document_upload' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      // maxScore = 1 * 2 = 2, rawScore = 1*1.0 + 1*1.0 = 2.0
      // score = (2/2) * 100 = 100
      expect(result.score).toBe(100);
    });

    it('verified attribute with simulated source earns partial weighted points', () => {
      const attrs = [
        makeAttribute({ status: 'verified', source: 'simulated' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      // maxScore = 2, rawScore = 0.3 + 0.3 = 0.6
      // score = (0.6/2) * 100 = 30
      expect(result.score).toBe(30);
    });
  });

  describe('expired document deduction', () => {
    it('deducts 2 raw points per expired document', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'verified', source: 'document_upload' }),
        makeAttribute({ attributeId: 'a2', status: 'verified', source: 'document_upload' }),
      ];
      const withoutExpired = calculateComplianceScore(attrs, []);
      const withExpired = calculateComplianceScore(attrs, [
        makeDocument({ status: 'expired' }),
      ]);

      expect(withExpired.score).toBeLessThan(withoutExpired.score);
      expect(withExpired.expiredDocuments).toBe(1);
    });

    it('counts expired documents correctly', () => {
      const attrs = [
        makeAttribute({ status: 'verified', source: 'document_upload' }),
      ];
      const docs = [
        makeDocument({ documentId: 'doc-1', status: 'expired' }),
        makeDocument({ documentId: 'doc-2', status: 'expired' }),
        makeDocument({ documentId: 'doc-3', status: 'verified' }),
      ];
      const result = calculateComplianceScore(attrs, docs);
      expect(result.expiredDocuments).toBe(2);
    });
  });

  describe('empty input handling', () => {
    it('handles empty attributes array', () => {
      const result = calculateComplianceScore([], []);
      expect(result.score).toBe(0);
      expect(result.level).toBe('critical_gaps');
      expect(result.totalRequired).toBe(0);
      expect(result.providedCount).toBe(0);
      expect(result.verifiedCount).toBe(0);
      expect(result.missingCount).toBe(0);
      expect(result.gaps).toHaveLength(0);
      expect(result.topGaps).toHaveLength(0);
    });

    it('handles all not_applicable attributes', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'not_applicable' }),
        makeAttribute({ attributeId: 'a2', status: 'not_applicable' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      expect(result.score).toBe(0);
      expect(result.totalRequired).toBe(0);
    });

    it('handles empty documents array with attributes', () => {
      const attrs = [makeAttribute({ status: 'verified', source: 'BMS' })];
      const result = calculateComplianceScore(attrs, []);
      expect(result.expiredDocuments).toBe(0);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('gaps analysis', () => {
    it('creates gaps for missing attributes', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'missing', section: 'Identity', name: 'Battery ID' }),
        makeAttribute({ attributeId: 'a2', status: 'provided', section: 'Technical', name: 'Nominal Energy' }),
        makeAttribute({ attributeId: 'a3', status: 'missing', section: 'Safety', name: 'Safety Cert' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      expect(result.gaps).toHaveLength(2);
      expect(result.missingCount).toBe(2);
    });

    it('sorts gaps by impact descending', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'missing', section: 'Documents', name: 'Low Impact' }),
        makeAttribute({ attributeId: 'a2', status: 'missing', section: 'Identity', name: 'High Impact' }),
        makeAttribute({ attributeId: 'a3', status: 'missing', section: 'Technical', name: 'Medium Impact' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      expect(result.gaps[0].impact).toBeGreaterThanOrEqual(result.gaps[1].impact);
      expect(result.gaps[1].impact).toBeGreaterThanOrEqual(result.gaps[2].impact);
    });

    it('limits topGaps to 5 entries', () => {
      const attrs = Array.from({ length: 10 }, (_, i) =>
        makeAttribute({
          attributeId: `a${i}`,
          status: 'missing',
          section: 'Identity',
          name: `Attr ${i}`,
        })
      );
      const result = calculateComplianceScore(attrs, []);
      expect(result.gaps).toHaveLength(10);
      expect(result.topGaps).toHaveLength(5);
    });
  });

  describe('not_applicable exclusion', () => {
    it('excludes not_applicable attributes from required count', () => {
      const attrs = [
        makeAttribute({ attributeId: 'a1', status: 'verified', source: 'document_upload' }),
        makeAttribute({ attributeId: 'a2', status: 'not_applicable' }),
        makeAttribute({ attributeId: 'a3', status: 'not_applicable' }),
      ];
      const result = calculateComplianceScore(attrs, []);
      expect(result.totalRequired).toBe(1);
      expect(result.score).toBe(100);
    });
  });
});
