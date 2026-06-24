// Utility functions and services
export { cn } from './cn';

export {
  ROLE_ACCESS_MAP,
  ROLE_PERMISSION_MAP,
  ROUTE_PERMISSIONS,
  filterByRole,
  canAccessRoute,
  hasPermission,
} from './permissions';
export type { FilteredResult, RouteAccessResult } from './permissions';

export {
  calculateComplianceScore,
  scoreToLevel,
  getSourceWeight,
  createGap,
} from './compliance';
export type { ComplianceScoreResult, ComplianceGap } from './compliance';

export {
  downloadBlob,
  exportPassportJSON,
  exportAuditCSV,
  exportTelemetryCSV,
} from './exportService';

export {
  parseCSV,
  validateCSVRow,
  validateCSVImport,
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  ALLOWED_CHEMISTRIES,
  CAPACITY_RANGE,
  DATE_FORMAT_REGEX,
} from './csvValidator';

export { calculateCompletenessScore } from './completenessScore';

export { FIELD_VISIBILITY_MAP, classifyVisibility } from './visibilityClassifier';

export { createAuditEvent } from './auditLogger';
