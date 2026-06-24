import type { ConnectivityStatus } from './asset';

// ============================================================
// TELEMETRY MODEL
// ============================================================

export interface TelemetryReading {
  assetId: string;
  timestamp: string;
  socPct: number;
  sohPct: number;
  equivalentFullCycles: number;
  energyChargedKWh: number;
  energyDischargedKWh: number;
  avgModuleTempC: number;
  maxModuleTempC: number;
  minModuleTempC: number;
  thermalGradientC: number;
  rollingRoundTripEfficiencyPct: number;
  availabilityPct: number;
  activeAlarms: Alarm[];
  connectivityStatus: ConnectivityStatus;
}

export interface Alarm {
  id: string;
  type: AlarmType;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export type AlarmType =
  | 'high_temperature'
  | 'connectivity_loss'
  | 'capacity_degradation'
  | 'thermal_gradient'
  | 'low_soc'
  | 'efficiency_drop';

export type TelemetryMetric =
  | 'soc'
  | 'soh'
  | 'temperature'
  | 'energy'
  | 'efficiency'
  | 'availability';

export type TimeRange = '24h' | '7d' | '30d' | '90d';
