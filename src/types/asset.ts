// ============================================================
// ASSET MODEL
// ============================================================

export interface Asset {
  assetId: string;
  passportId: string;
  model: string;
  serialNumber: string;
  owner: string;
  operator: string;
  location: AssetLocation;
  nominalEnergyKWh: number;
  usableEnergyKWh: number;
  ratedPowerKVA: number;
  outputVoltage: string;
  chemistry: BatteryChemistry;
  commissioningDate: string | null;
  status: AssetStatus;
  complianceStatus: ComplianceLevel;
  complianceScorePct: number;
  dataQualityScorePct: number;
  connectivityStatus: ConnectivityStatus;
  alarmStatus: AlarmStatus;
  activeWarning?: string;
  latestTelemetry?: TelemetrySnapshot;
}

export interface AssetLocation {
  siteName: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export type BatteryChemistry = 'LFP' | 'NMC' | 'NCA' | 'LTO';
export type AssetStatus = 'Operational' | 'Pre-commissioning' | 'Maintenance' | 'Decommissioned';
export type ComplianceLevel = 'critical_gaps' | 'needs_attention' | 'nearly_ready' | 'passport_ready';
export type ConnectivityStatus = 'online' | 'offline' | 'pending';
export type AlarmStatus = 'normal' | 'warning' | 'critical' | 'none';

export interface TelemetrySnapshot {
  socPct: number | null;
  sohPct: number | null;
  equivalentFullCycles: number;
  rollingRtePct: number | null;
  availability30dPct: number | null;
  avgModuleTempC: number | null;
  lastUpdated: string;
}
