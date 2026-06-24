import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createAuthSlice, type AuthSlice } from './slices/auth';
import { createAssetSlice, type AssetSlice } from './slices/assets';
import { createTelemetrySlice, type TelemetrySlice } from './slices/telemetry';
import { createComplianceSlice, type ComplianceSlice } from './slices/compliance';
import { createUISlice, type UISlice } from './slices/ui';
import { createDataIngestionSlice, type DataIngestionSlice } from './slices/dataIngestion';
import { createSupplierSlice, type SupplierSlice } from './slices/supplier';
import { createWorkflowSlice, type WorkflowSlice } from './slices/workflow';

// ============================================================
// COMBINED STORE
// ============================================================

export type AppStore = AuthSlice &
  AssetSlice &
  TelemetrySlice &
  ComplianceSlice &
  UISlice &
  DataIngestionSlice &
  SupplierSlice &
  WorkflowSlice;

export const useAppStore = create<AppStore>()(
  immer((...a) => ({
    ...createAuthSlice(...a),
    ...createAssetSlice(...a),
    ...createTelemetrySlice(...a),
    ...createComplianceSlice(...a),
    ...createUISlice(...a),
    ...createDataIngestionSlice(...a),
    ...createSupplierSlice(...a),
    ...createWorkflowSlice(...a),
  }))
);

// ============================================================
// TYPED SELECTORS
// ============================================================

// Auth selectors
export const useCurrentRole = () => useAppStore((s) => s.currentRole);
export const useCurrentUser = () => useAppStore((s) => s.currentUser);
export const useIsAuthenticated = () => useAppStore((s) => s.isAuthenticated);

// Asset selectors
export const useAssets = () => useAppStore((s) => s.assets);
export const useSelectedAssetId = () => useAppStore((s) => s.selectedAssetId);

// Telemetry selectors
export const useTimeRange = () => useAppStore((s) => s.timeRange);

// UI selectors
export const useSidebarOpen = () => useAppStore((s) => s.sidebarOpen);
export const useSidebarCollapsed = () => useAppStore((s) => s.sidebarCollapsed);
export const useMobileNavOpen = () => useAppStore((s) => s.mobileNavOpen);

// Data Ingestion selectors
export const useCSVImportInProgress = () => useAppStore((s) => s.csvImportInProgress);
export const useCSVImportRows = () => useAppStore((s) => s.csvImportRows);
export const useCSVImportResult = () => useAppStore((s) => s.csvImportResult);
export const useIntegrationStatuses = () => useAppStore((s) => s.integrationStatuses);
export const useSimulatorStates = () => useAppStore((s) => s.simulatorStates);
export const useDraftAssets = () => useAppStore((s) => s.draftAssets);

// Supplier selectors
export const useObligations = () => useAppStore((s) => s.obligations);
export const useDeclarations = () => useAppStore((s) => s.declarations);

// Workflow selectors
export const useCompletenessScores = () => useAppStore((s) => s.completenessScores);
export const usePublishingState = () => useAppStore((s) => s.publishingState);
export const useReviewQueue = () => useAppStore((s) => s.reviewQueue);
export const useLifecycleEvents = () => useAppStore((s) => s.lifecycleEvents);
