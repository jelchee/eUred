import { useMemo } from 'react';
import { useAppStore } from '@/store';
import type { TelemetryReading, TimeRange } from '@/types';

/** Maps TimeRange to the number of most-recent entries to include */
const TIME_RANGE_LIMITS: Record<TimeRange, number | null> = {
  '24h': 24,
  '7d': 168,
  '30d': 720,
  '90d': null, // all entries
};

/**
 * Typed selector hook for telemetry data.
 * Filters readings by the current time range and derives stats and alarms.
 */
export function useTelemetry(assetId: string) {
  const allReadings = useAppStore((s) => s.readings[assetId] ?? []);
  const timeRange = useAppStore((s) => s.timeRange);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const generateForAsset = useAppStore((s) => s.generateForAsset);

  const readings: TelemetryReading[] = useMemo(() => {
    const limit = TIME_RANGE_LIMITS[timeRange];
    if (limit === null) return allReadings;
    return allReadings.slice(-limit);
  }, [allReadings, timeRange]);

  const alarms: TelemetryReading[] = useMemo(() => {
    return readings.filter((r) => r.activeAlarms.length > 0);
  }, [readings]);

  const stats = useMemo(() => {
    if (readings.length === 0) {
      return { latestSoC: 0, latestSoH: 0, avgTemp: 0, totalEnergy: 0 };
    }

    const latest = readings[readings.length - 1];
    const avgTemp =
      readings.reduce((sum, r) => sum + r.avgModuleTempC, 0) / readings.length;
    const totalEnergy = readings.reduce(
      (sum, r) => sum + r.energyChargedKWh + r.energyDischargedKWh,
      0
    );

    return {
      latestSoC: latest.socPct,
      latestSoH: latest.sohPct,
      avgTemp: Math.round(avgTemp * 10) / 10,
      totalEnergy: Math.round(totalEnergy * 10) / 10,
    };
  }, [readings]);

  return {
    readings,
    allReadings,
    timeRange,
    setTimeRange,
    generateForAsset,
    alarms,
    stats,
  };
}
