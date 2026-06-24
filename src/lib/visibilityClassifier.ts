import type { VisibilityLevel } from '../types/dataIngestion';

/**
 * Maps field paths to their visibility classification.
 * Used to determine access control for passport data fields.
 */
export const FIELD_VISIBILITY_MAP: Record<string, VisibilityLevel> = {
  // Public fields
  'asset.productFamily': 'public',
  'asset.batteryType': 'public',
  'asset.capacityKWh': 'public',
  'asset.chemistryCategory': 'public',
  'asset.lifecycleStatus': 'public',
  'passport.model': 'public',
  'passport.manufacturer': 'public',
  'passport.batteryCategory': 'public',
  'passport.productionYear': 'public',
  'passport.safetySummary': 'public',
  'passport.recyclingSummary': 'public',

  // Restricted fields
  'asset.assetId': 'restricted',
  'asset.manufacturingDate': 'restricted',
  'asset.manufacturingSite': 'restricted',
  'asset.installationLocation': 'restricted',
  'asset.passportStatus': 'restricted',
  'telemetry.soc': 'restricted',
  'telemetry.soh': 'restricted',
  'telemetry.cycleCount': 'restricted',

  // Confidential fields
  'asset.serialNumber': 'confidential',
  'asset.customerProject': 'confidential',
  'supplier.purchaseOrder': 'confidential',
  'supplier.costData': 'confidential',
  'telemetry.moduleLevel': 'confidential',
};

/**
 * Classify the visibility level for a given field path.
 * Returns the mapped visibility level, defaulting to 'restricted' if not explicitly mapped.
 */
export function classifyVisibility(fieldPath: string): VisibilityLevel {
  return FIELD_VISIBILITY_MAP[fieldPath] ?? 'restricted';
}
