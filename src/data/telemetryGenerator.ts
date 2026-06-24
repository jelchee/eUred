import type { Asset, ConnectivityStatus } from '../types/asset';
import type { TelemetryReading, Alarm, AlarmType } from '../types/telemetry';
import { assets } from './assets';

// ============================================================
// TELEMETRY GENERATOR
// ============================================================

export type TelemetryProfile = 'normal' | 'warning' | 'degraded';

export interface TelemetryGeneratorOptions {
  days?: number;
  profile?: TelemetryProfile;
  startDate?: string;
}

// Seeded pseudo-random number generator for deterministic output
function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

/**
 * Generates realistic telemetry readings for a battery asset.
 *
 * - SoC oscillates 20–90% with daily charge/discharge cycles (sine-based)
 * - SoH degrades monotonically (~0.003%/day normal, ~0.01%/day degraded)
 * - Temperature follows a diurnal pattern with random noise
 * - Warning profile injects alarm events at days 45-46, 60-61, and 75
 */
export function generateTelemetry(
  asset: Asset,
  options?: TelemetryGeneratorOptions
): TelemetryReading[] {
  const days = options?.days ?? 90;
  const profile: TelemetryProfile = options?.profile ?? 'normal';
  const startDate = options?.startDate
    ? new Date(options.startDate)
    : new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rng = createRng(hashString(asset.assetId + profile));
  const readings: TelemetryReading[] = [];

  // Initial values from asset or defaults
  const initialSoH = asset.latestTelemetry?.sohPct ?? 100;
  const initialCycles = asset.latestTelemetry?.equivalentFullCycles ?? 0;

  // Profile-specific parameters
  const sohDegradationPerDay = profile === 'degraded' ? 0.01 : 0.003;
  const baseEfficiency = profile === 'degraded' ? 89 : 92;
  const efficiencyRange = profile === 'degraded' ? 1.5 : 1;
  const baseAvailability = profile === 'degraded' ? 98.5 : 99.7;

  let cumulativeCycles = initialCycles;
  let cumulativeChargedKWh = 0;
  let cumulativeDischargedKWh = 0;
  let prevSoC = 55; // mid-range starting point

  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(startDate);
      timestamp.setDate(timestamp.getDate() + day);
      timestamp.setHours(hour, 0, 0, 0);

      // --- SoC: sine-based daily cycle, peak at ~14:00, trough at ~02:00 ---
      const hourPhase = ((hour - 14) / 24) * 2 * Math.PI;
      const socBase = 55 + 35 * Math.cos(hourPhase); // oscillates ~20–90
      const socNoise = (rng() - 0.5) * 4;
      const socPct = Math.max(20, Math.min(90, socBase + socNoise));

      // --- SoH: monotonic degradation ---
      const dayFraction = day + hour / 24;
      const sohPct = Math.max(0, initialSoH - sohDegradationPerDay * dayFraction);

      // --- Temperature: diurnal pattern ---
      const baseTemp = 22 + rng() * 3; // 22–25°C base
      const diurnalPhase = ((hour - 15) / 24) * 2 * Math.PI;
      const diurnalAmp = 3 + rng() * 2; // ±3–5°C
      const tempNoise = (rng() - 0.5) * 1; // ±0.5°C
      let avgTemp = baseTemp + diurnalAmp * Math.cos(diurnalPhase) + tempNoise;

      // Warning profile: high-temp event on days 45-46
      if (profile === 'warning' && day >= 45 && day <= 46 && hour >= 12 && hour <= 16) {
        avgTemp = 38 + rng() * 2;
      }
      // Degraded profile: more temperature spikes
      if (profile === 'degraded' && rng() < 0.03) {
        avgTemp = 35 + rng() * 4;
      }

      const maxTemp = avgTemp + 1.5 + rng() * 1;
      const minTemp = avgTemp - 1.5 - rng() * 1;
      const thermalGradient = maxTemp - minTemp;

      // --- Cycles: ~1.5/day on average ---
      const cycleIncrement = (1.5 / 24) + (rng() - 0.5) * 0.02;
      cumulativeCycles += Math.max(0, cycleIncrement);

      // --- Energy charged/discharged ---
      const socDelta = socPct - prevSoC;
      const nominalKWh = asset.nominalEnergyKWh || 868;
      if (socDelta > 0) {
        cumulativeChargedKWh += (socDelta / 100) * nominalKWh;
      } else {
        cumulativeDischargedKWh += (Math.abs(socDelta) / 100) * nominalKWh;
      }
      prevSoC = socPct;

      // --- Efficiency ---
      const efficiency = baseEfficiency + rng() * efficiencyRange * 2 - efficiencyRange;

      // --- Availability ---
      let availability = baseAvailability + rng() * 0.2;
      // Connectivity loss period (warning profile: day 60-61)
      const isConnectivityLoss = profile === 'warning' && day >= 60 && day <= 61;
      if (isConnectivityLoss) {
        availability = 85 + rng() * 5;
      }

      // --- Connectivity status ---
      let connectivityStatus: ConnectivityStatus = 'online';
      if (isConnectivityLoss) {
        connectivityStatus = 'offline';
      }

      // --- Alarms ---
      const activeAlarms: Alarm[] = [];

      if (profile === 'warning') {
        // High temperature alarm on days 45-46
        if (day >= 45 && day <= 46 && hour >= 12 && hour <= 16) {
          activeAlarms.push(createAlarm(
            `alarm-ht-${day}-${hour}`,
            'high_temperature',
            'critical',
            `Module temperature exceeded 38°C (${avgTemp.toFixed(1)}°C)`,
            timestamp.toISOString()
          ));
        }
        // Connectivity loss alarm on days 60-61
        if (day >= 60 && day <= 61) {
          activeAlarms.push(createAlarm(
            `alarm-cl-${day}-${hour}`,
            'connectivity_loss',
            'warning',
            'BMS connectivity interrupted — data gap detected',
            timestamp.toISOString()
          ));
        }
        // Capacity degradation warning on day 75
        if (day === 75 && hour >= 8 && hour <= 12) {
          activeAlarms.push(createAlarm(
            `alarm-cd-${day}-${hour}`,
            'capacity_degradation',
            'warning',
            'SoH degradation rate above expected threshold',
            timestamp.toISOString()
          ));
        }
      }

      if (profile === 'degraded') {
        // More frequent temperature alarms
        if (avgTemp > 35) {
          activeAlarms.push(createAlarm(
            `alarm-ht-${day}-${hour}`,
            'high_temperature',
            avgTemp > 38 ? 'critical' : 'warning',
            `Elevated module temperature: ${avgTemp.toFixed(1)}°C`,
            timestamp.toISOString()
          ));
        }
        // Efficiency drop events
        if (efficiency < 89) {
          activeAlarms.push(createAlarm(
            `alarm-eff-${day}-${hour}`,
            'efficiency_drop',
            'warning',
            `Round-trip efficiency dropped to ${efficiency.toFixed(1)}%`,
            timestamp.toISOString()
          ));
        }
      }

      readings.push({
        assetId: asset.assetId,
        timestamp: timestamp.toISOString(),
        socPct: parseFloat(socPct.toFixed(1)),
        sohPct: parseFloat(sohPct.toFixed(2)),
        equivalentFullCycles: parseFloat(cumulativeCycles.toFixed(1)),
        energyChargedKWh: parseFloat(cumulativeChargedKWh.toFixed(1)),
        energyDischargedKWh: parseFloat(cumulativeDischargedKWh.toFixed(1)),
        avgModuleTempC: parseFloat(avgTemp.toFixed(1)),
        maxModuleTempC: parseFloat(maxTemp.toFixed(1)),
        minModuleTempC: parseFloat(minTemp.toFixed(1)),
        thermalGradientC: parseFloat(thermalGradient.toFixed(1)),
        rollingRoundTripEfficiencyPct: parseFloat(efficiency.toFixed(1)),
        availabilityPct: parseFloat(availability.toFixed(2)),
        activeAlarms,
        connectivityStatus,
      });
    }
  }

  return readings;
}

function createAlarm(
  id: string,
  type: AlarmType,
  severity: 'warning' | 'critical',
  message: string,
  timestamp: string
): Alarm {
  return {
    id,
    type,
    severity,
    message,
    timestamp,
    acknowledged: false,
  };
}

// ============================================================
// CACHED TELEMETRY GETTER
// ============================================================

// Lazy cache: generate on first call, return cached on subsequent calls
const telemetryCache = new Map<string, TelemetryReading[]>();

/**
 * Returns cached telemetry readings for a given asset.
 * Generates on first call and caches the result.
 */
export function getTelemetryForAsset(assetId: string): TelemetryReading[] {
  if (telemetryCache.has(assetId)) {
    return telemetryCache.get(assetId)!;
  }

  const asset = assets.find((a) => a.assetId === assetId);

  if (!asset) {
    return [];
  }

  // Determine profile based on asset status
  let profile: TelemetryProfile = 'normal';
  if (asset.alarmStatus === 'warning' || asset.alarmStatus === 'critical') {
    profile = 'warning';
  }
  if (asset.status === 'Maintenance' || asset.complianceStatus === 'critical_gaps') {
    profile = 'degraded';
  }

  const readings = generateTelemetry(asset, { profile });
  telemetryCache.set(assetId, readings);
  return readings;
}
