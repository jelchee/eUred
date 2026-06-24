import type { CarbonFootprint, RecycledContent } from '@/types';

// ============================================================
// MOCK ESG DATA — Carbon Footprint & Recycled Content per Asset
// ============================================================

/**
 * Carbon footprint data per asset.
 * Asset ZG-0001: total 56,594 kgCO2e, intensity 65.2 kgCO2e/kWh
 * Lifecycle stages: raw materials 35%, cell manufacturing 25%, module assembly 12%,
 * system assembly 8%, logistics 5%, operation estimate 10%, end-of-life estimate 5%
 */
export const carbonFootprintData: Record<string, CarbonFootprint> = {
  'ASSET-SEST-ZG-0001': {
    assetId: 'ASSET-SEST-ZG-0001',
    totalProductCarbonFootprintKgCO2e: 56594,
    carbonIntensityKgCO2ePerKWh: 65.2,
    lifecycleBreakdown: [
      { stage: 'Raw Materials', percentage: 35, kgCO2e: 19808 },
      { stage: 'Cell Manufacturing', percentage: 25, kgCO2e: 14149 },
      { stage: 'Module Assembly', percentage: 12, kgCO2e: 6791 },
      { stage: 'System Assembly', percentage: 8, kgCO2e: 4528 },
      { stage: 'Logistics', percentage: 5, kgCO2e: 2830 },
      { stage: 'Operation Estimate', percentage: 10, kgCO2e: 5659 },
      { stage: 'End-of-Life Estimate', percentage: 5, kgCO2e: 2830 },
    ],
    verificationStatus: 'pending_external_verification',
    confidence: 'medium',
  },

  'ASSET-SEST-UK-0002': {
    assetId: 'ASSET-SEST-UK-0002',
    totalProductCarbonFootprintKgCO2e: 57120,
    carbonIntensityKgCO2ePerKWh: 65.8,
    lifecycleBreakdown: [
      { stage: 'Raw Materials', percentage: 34, kgCO2e: 19421 },
      { stage: 'Cell Manufacturing', percentage: 26, kgCO2e: 14851 },
      { stage: 'Module Assembly', percentage: 11, kgCO2e: 6283 },
      { stage: 'System Assembly', percentage: 9, kgCO2e: 5141 },
      { stage: 'Logistics', percentage: 6, kgCO2e: 3427 },
      { stage: 'Operation Estimate', percentage: 9, kgCO2e: 5141 },
      { stage: 'End-of-Life Estimate', percentage: 5, kgCO2e: 2856 },
    ],
    verificationStatus: 'not_started',
    confidence: 'low',
  },

  'ASSET-SEST-HR-0003': {
    assetId: 'ASSET-SEST-HR-0003',
    totalProductCarbonFootprintKgCO2e: 56594,
    carbonIntensityKgCO2ePerKWh: 65.2,
    lifecycleBreakdown: [
      { stage: 'Raw Materials', percentage: 35, kgCO2e: 19808 },
      { stage: 'Cell Manufacturing', percentage: 25, kgCO2e: 14149 },
      { stage: 'Module Assembly', percentage: 12, kgCO2e: 6791 },
      { stage: 'System Assembly', percentage: 8, kgCO2e: 4528 },
      { stage: 'Logistics', percentage: 5, kgCO2e: 2830 },
      { stage: 'Operation Estimate', percentage: 10, kgCO2e: 5659 },
      { stage: 'End-of-Life Estimate', percentage: 5, kgCO2e: 2830 },
    ],
    verificationStatus: 'not_started',
    confidence: 'low',
  },
};

/**
 * Recycled content data per asset.
 * Asset ZG-0001: Aluminium 28% (draft), Copper 19% (draft), Steel 37% (draft),
 * Lithium 5% (draft), Plastics 12% (not_applicable)
 */
export const recycledContentData: Record<string, RecycledContent[]> = {
  'ASSET-SEST-ZG-0001': [
    { material: 'Aluminium', percentage: 28, source: 'Supplier declaration', status: 'draft', applicable: true },
    { material: 'Copper', percentage: 19, source: 'Supplier declaration', status: 'draft', applicable: true },
    { material: 'Steel', percentage: 37, source: 'Supplier declaration', status: 'draft', applicable: true },
    { material: 'Lithium', percentage: 5, source: 'Supplier declaration', status: 'draft', applicable: true },
    { material: 'Plastics', percentage: 12, source: 'Supplier declaration', status: 'not_applicable', applicable: false },
  ],

  'ASSET-SEST-UK-0002': [
    { material: 'Aluminium', percentage: 25, source: 'Supplier declaration', status: 'draft', applicable: true },
    { material: 'Copper', percentage: 15, source: 'Supplier declaration', status: 'missing', applicable: true },
    { material: 'Steel', percentage: 34, source: 'Supplier declaration', status: 'draft', applicable: true },
    { material: 'Lithium', percentage: null, source: 'Pending', status: 'missing', applicable: true },
    { material: 'Plastics', percentage: null, source: 'N/A', status: 'not_applicable', applicable: false },
  ],

  'ASSET-SEST-HR-0003': [
    { material: 'Aluminium', percentage: null, source: 'Pending', status: 'missing', applicable: true },
    { material: 'Copper', percentage: null, source: 'Pending', status: 'missing', applicable: true },
    { material: 'Steel', percentage: null, source: 'Pending', status: 'missing', applicable: true },
    { material: 'Lithium', percentage: null, source: 'Pending', status: 'missing', applicable: true },
    { material: 'Plastics', percentage: null, source: 'N/A', status: 'not_applicable', applicable: false },
  ],
};

/**
 * Due diligence summary data per asset.
 */
export interface DueDiligenceSummary {
  supplierDeclarationsReceived: number;
  supplierDeclarationsRequired: number;
  highRiskMaterials: string[];
  openSupplierActions: number;
  lastReviewDate: string;
  confidence: 'high' | 'medium' | 'low';
}

export const dueDiligenceData: Record<string, DueDiligenceSummary> = {
  'ASSET-SEST-ZG-0001': {
    supplierDeclarationsReceived: 8,
    supplierDeclarationsRequired: 10,
    highRiskMaterials: ['Cobalt (trace)', 'Graphite'],
    openSupplierActions: 2,
    lastReviewDate: '2026-05-20',
    confidence: 'medium',
  },

  'ASSET-SEST-UK-0002': {
    supplierDeclarationsReceived: 5,
    supplierDeclarationsRequired: 10,
    highRiskMaterials: ['Cobalt (trace)', 'Graphite', 'Lithium'],
    openSupplierActions: 4,
    lastReviewDate: '2026-04-12',
    confidence: 'low',
  },

  'ASSET-SEST-HR-0003': {
    supplierDeclarationsReceived: 2,
    supplierDeclarationsRequired: 10,
    highRiskMaterials: ['Cobalt (trace)', 'Graphite', 'Lithium'],
    openSupplierActions: 7,
    lastReviewDate: '2026-03-01',
    confidence: 'low',
  },
};

// ============================================================
// ACCESSOR FUNCTIONS
// ============================================================

export function getCarbonFootprintByAssetId(assetId: string): CarbonFootprint | undefined {
  return carbonFootprintData[assetId];
}

export function getRecycledContentByAssetId(assetId: string): RecycledContent[] {
  return recycledContentData[assetId] ?? [];
}

export function getDueDiligenceByAssetId(assetId: string): DueDiligenceSummary | undefined {
  return dueDiligenceData[assetId];
}
