import type { BatteryChemistry, AssetStatus, Asset } from './asset';

// ============================================================
// DATA INGESTION TYPES
// ============================================================

export type VisibilityLevel = 'public' | 'restricted' | 'confidential';

export type ImportStep = 'template' | 'upload' | 'validate' | 'preview' | 'confirm' | 'complete';

export interface NewAssetDraft {
  assetId: string;
  serialNumber: string;
  productFamily: string;
  batteryType: string;
  capacityKWh: number;
  chemistryCategory: BatteryChemistry;
  manufacturingDate: string;
  manufacturingSite: string;
  customerProject?: string;
  installationLocation?: string;
  lifecycleStatus: AssetStatus;
  passportStatus: 'draft';
  isDraft: boolean;
}

export interface AssetFormField {
  key: keyof NewAssetDraft;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  visibility: VisibilityLevel;
  placeholder: string;
  options?: string[];
  validation?: (value: unknown) => string | null;
}

export interface CSVRow {
  rowNumber: number;
  data: Record<string, string>;
  status: 'valid' | 'warning' | 'error' | 'duplicate';
  errors: string[];
  warnings: string[];
}

export interface CSVValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: CSVRow[];
  warningRows: CSVRow[];
  errorRows: CSVRow[];
  duplicateRows: CSVRow[];
  headerErrors: string[];
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  warningCount: number;
  errorCount: number;
  duplicateCount: number;
  importedAssets: Asset[];
  auditEventId: string;
}

export type IntegrationSystem = 'PLM' | 'MES' | 'ERP' | 'QMS' | 'BMS' | 'DOCUMENT_VAULT';

export interface MockIntegration {
  id: string;
  system: IntegrationSystem;
  label: string;
  description: string;
  icon: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSync?: string;
  fieldsPopulated: string[];
  dataPreview: Record<string, string | number>;
}

export type TelemetryScenario = 'normal' | 'warning' | 'critical' | 'degradation';

export interface SimulatorState {
  isRunning: boolean;
  scenario: TelemetryScenario;
  intervalMs: number;
  tickCount: number;
  lastTick?: string;
}

export interface ScenarioConfig {
  id: TelemetryScenario;
  label: string;
  description: string;
  color: string;
  parameters: {
    socRange: [number, number];
    sohDecayRate: number;
    tempRange: [number, number];
    alarmProbability: number;
    connectivityLossProbability: number;
  };
}
