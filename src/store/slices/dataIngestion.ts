import type { StateCreator } from 'zustand';
import type {
  CSVRow,
  ImportResult,
  IntegrationSystem,
  MockIntegration,
  SimulatorState,
  TelemetryScenario,
  NewAssetDraft,
} from '@/types';

// ============================================================
// DATA INGESTION SLICE
// ============================================================

export interface DataIngestionSlice {
  // CSV Import state
  csvImportInProgress: boolean;
  csvImportRows: CSVRow[];
  csvImportResult: ImportResult | null;
  startCSVImport: (rows: CSVRow[]) => void;
  completeCSVImport: (result: ImportResult) => void;
  resetCSVImport: () => void;

  // Mock Integration state
  integrationStatuses: Record<IntegrationSystem, MockIntegration>;
  triggerMockImport: (system: IntegrationSystem, assetId: string) => void;

  // Telemetry Simulator state
  simulatorStates: Record<string, SimulatorState>;
  startSimulator: (assetId: string, scenario: TelemetryScenario) => void;
  stopSimulator: (assetId: string) => void;
  changeScenario: (assetId: string, scenario: TelemetryScenario) => void;
  resetSimulator: (assetId: string) => void;

  // Asset creation
  draftAssets: NewAssetDraft[];
  saveDraft: (draft: NewAssetDraft) => void;
  publishDraft: (assetId: string) => void;
}

const defaultIntegrationStatuses: Record<IntegrationSystem, MockIntegration> = {
  PLM: {
    id: 'int-plm',
    system: 'PLM',
    label: 'Product Lifecycle Management',
    description: 'Siemens Teamcenter — design data, BOMs, ECOs',
    icon: 'Layers',
    status: 'idle',
    fieldsPopulated: ['productFamily', 'batteryType', 'capacityKWh', 'chemistryCategory'],
    dataPreview: { productFamily: 'SEST Energy', batteryType: 'LFP Module', capacityKWh: 120 },
  },
  MES: {
    id: 'int-mes',
    system: 'MES',
    label: 'Manufacturing Execution System',
    description: 'Production records, serial numbers, QC results',
    icon: 'Factory',
    status: 'idle',
    fieldsPopulated: ['serialNumber', 'manufacturingDate', 'manufacturingSite'],
    dataPreview: { serialNumber: 'SN-2026-001', manufacturingSite: 'Zagreb Plant' },
  },
  ERP: {
    id: 'int-erp',
    system: 'ERP',
    label: 'Enterprise Resource Planning',
    description: 'SAP S/4HANA — procurement, logistics, cost data',
    icon: 'Database',
    status: 'idle',
    fieldsPopulated: ['customerProject', 'installationLocation'],
    dataPreview: { customerProject: 'EU-GRID-2026', installationLocation: 'Munich Data Center' },
  },
  QMS: {
    id: 'int-qms',
    system: 'QMS',
    label: 'Quality Management System',
    description: 'Certifications, test reports, non-conformances',
    icon: 'ShieldCheck',
    status: 'idle',
    fieldsPopulated: ['complianceStatus', 'certifications'],
    dataPreview: { complianceStatus: 'compliant', certifications: 3 },
  },
  BMS: {
    id: 'int-bms',
    system: 'BMS',
    label: 'Battery Management System',
    description: 'Live telemetry — SoC, SoH, temperature, cycles',
    icon: 'Activity',
    status: 'idle',
    fieldsPopulated: ['stateOfCharge', 'stateOfHealth', 'temperature', 'cycleCount'],
    dataPreview: { stateOfCharge: 87, stateOfHealth: 96, temperature: 24 },
  },
  DOCUMENT_VAULT: {
    id: 'int-docvault',
    system: 'DOCUMENT_VAULT',
    label: 'Document Vault',
    description: 'Certificates, declarations, test reports (SharePoint)',
    icon: 'FileText',
    status: 'idle',
    fieldsPopulated: ['documents', 'certificates'],
    dataPreview: { documents: 12, certificates: 4 },
  },
};

export const createDataIngestionSlice: StateCreator<
  DataIngestionSlice,
  [['zustand/immer', never]],
  [],
  DataIngestionSlice
> = (set, get) => ({
  // CSV Import state
  csvImportInProgress: false,
  csvImportRows: [],
  csvImportResult: null,

  startCSVImport: (rows: CSVRow[]) => {
    set((state) => {
      state.csvImportInProgress = true;
      state.csvImportRows = rows;
      state.csvImportResult = null;
    });
  },

  completeCSVImport: (result: ImportResult) => {
    set((state) => {
      state.csvImportInProgress = false;
      state.csvImportResult = result;
    });

    // Trigger completeness recalculation for each imported asset
    const store = get() as unknown as { recalculateCompleteness: (id: string, trigger?: string) => void };
    if (store.recalculateCompleteness) {
      for (const asset of result.importedAssets) {
        store.recalculateCompleteness(asset.assetId, 'csv_import_completed');
      }
    }
  },

  resetCSVImport: () => {
    set((state) => {
      state.csvImportInProgress = false;
      state.csvImportRows = [];
      state.csvImportResult = null;
    });
  },

  // Mock Integration state
  integrationStatuses: { ...defaultIntegrationStatuses },

  triggerMockImport: (system: IntegrationSystem, _assetId: string) => {
    set((state) => {
      state.integrationStatuses[system].status = 'syncing';
      state.integrationStatuses[system].lastSync = new Date().toISOString();
    });
    // Simulate async completion — mark as success after state update
    setTimeout(() => {
      set((state) => {
        state.integrationStatuses[system].status = 'success';
      });
    }, 1500);
  },

  // Telemetry Simulator state
  simulatorStates: {},

  startSimulator: (assetId: string, scenario: TelemetryScenario) => {
    set((state) => {
      state.simulatorStates[assetId] = {
        isRunning: true,
        scenario,
        intervalMs: 2000,
        tickCount: 0,
        lastTick: new Date().toISOString(),
      };
    });
  },

  stopSimulator: (assetId: string) => {
    set((state) => {
      if (state.simulatorStates[assetId]) {
        state.simulatorStates[assetId].isRunning = false;
      }
    });
  },

  changeScenario: (assetId: string, scenario: TelemetryScenario) => {
    set((state) => {
      if (state.simulatorStates[assetId]) {
        state.simulatorStates[assetId].scenario = scenario;
        state.simulatorStates[assetId].tickCount = 0;
      }
    });
  },

  resetSimulator: (assetId: string) => {
    set((state) => {
      delete state.simulatorStates[assetId];
    });
  },

  // Asset creation
  draftAssets: [],

  saveDraft: (draft: NewAssetDraft) => {
    set((state) => {
      const existingIndex = state.draftAssets.findIndex((d) => d.assetId === draft.assetId);
      if (existingIndex >= 0) {
        state.draftAssets[existingIndex] = draft;
      } else {
        state.draftAssets.push(draft);
      }
    });

    // Trigger completeness recalculation after saving/creating asset draft
    const store = get() as unknown as { recalculateCompleteness: (id: string, trigger?: string) => void };
    if (store.recalculateCompleteness) {
      store.recalculateCompleteness(draft.assetId, 'asset_creation');
    }
  },

  publishDraft: (assetId: string) => {
    set((state) => {
      state.draftAssets = state.draftAssets.filter((d) => d.assetId !== assetId);
    });
  },
});
