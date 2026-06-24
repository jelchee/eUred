import type { ConfidenceLevel, AttributeStatus } from './passport';

// ============================================================
// ESG & SYSTEM HEALTH MODELS
// ============================================================

export interface CarbonFootprint {
  assetId: string;
  totalProductCarbonFootprintKgCO2e: number;
  carbonIntensityKgCO2ePerKWh: number;
  lifecycleBreakdown: CarbonLifecycleStage[];
  verificationStatus: string;
  confidence: ConfidenceLevel;
}

export interface CarbonLifecycleStage {
  stage: string;
  percentage: number;
  kgCO2e: number;
}

export interface RecycledContent {
  material: string;
  percentage: number | null;
  source: string;
  status: AttributeStatus;
  applicable: boolean;
}

export interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: string;
  uptime: number;
  traceId: string;
}
