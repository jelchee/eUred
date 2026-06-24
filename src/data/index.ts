// ============================================================
// DEMO DATA LAYER — barrel exports
// ============================================================

export { organizations } from './organizations';
export { users } from './users';
export { assets } from './assets';
export { documents } from './documents';
export { lifecycleEvents } from './lifecycleEvents';
export { auditEvents } from './auditEvents';
export { tasks } from './tasks';
export { passportAttributes, getAttributesByPassportId } from './passportAttributes';
export { generateTelemetry, getTelemetryForAsset } from './telemetryGenerator';
export type { TelemetryProfile, TelemetryGeneratorOptions } from './telemetryGenerator';
export {
  carbonFootprintData,
  recycledContentData,
  dueDiligenceData,
  getCarbonFootprintByAssetId,
  getRecycledContentByAssetId,
  getDueDiligenceByAssetId,
} from './esgData';
export type { DueDiligenceSummary } from './esgData';
export { suppliers } from './suppliers';
export { obligations } from './obligations';
export {
  csvColumnDefinitions,
  demoCSVContent,
  demoParsedCSVRows,
} from './csvTemplates';
export type { CSVColumnDefinition, ParsedCSVRow } from './csvTemplates';
