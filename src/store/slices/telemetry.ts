import type { StateCreator } from 'zustand';
import type { TelemetryReading, TimeRange } from '@/types';
import { getTelemetryForAsset } from '@/data/telemetryGenerator';

// ============================================================
// TELEMETRY SLICE
// ============================================================

export interface TelemetrySlice {
  readings: Record<string, TelemetryReading[]>;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  getTelemetryForAsset: (assetId: string) => TelemetryReading[];
  generateForAsset: (assetId: string) => void;
}

export const createTelemetrySlice: StateCreator<
  TelemetrySlice,
  [['zustand/immer', never]],
  [],
  TelemetrySlice
> = (set, get) => ({
  readings: {},
  timeRange: '30d',

  setTimeRange: (range: TimeRange) => {
    set((state) => {
      state.timeRange = range;
    });
  },

  getTelemetryForAsset: (assetId: string) => {
    const state = get();
    return state.readings[assetId] ?? [];
  },

  generateForAsset: (assetId: string) => {
    const telemetryData = getTelemetryForAsset(assetId);
    set((state) => {
      state.readings[assetId] = telemetryData;
    });
  },
});
