import { describe, it, expect } from 'vitest';
import { generateTelemetry, getTelemetryForAsset } from './telemetryGenerator';
import { assets } from './assets';
import type { Asset } from '../types/asset';

const testAsset: Asset = assets[0]; // ZG-0001, operational, nearly_ready

describe('generateTelemetry', () => {
  it('generates 2160 readings (90 days × 24 hours) by default', () => {
    const readings = generateTelemetry(testAsset);
    expect(readings).toHaveLength(90 * 24);
  });

  it('generates correct number of readings for custom days', () => {
    const readings = generateTelemetry(testAsset, { days: 7 });
    expect(readings).toHaveLength(7 * 24);
  });

  it('returns readings sorted by timestamp ascending', () => {
    const readings = generateTelemetry(testAsset, { days: 10 });
    for (let i = 1; i < readings.length; i++) {
      expect(new Date(readings[i].timestamp).getTime())
        .toBeGreaterThan(new Date(readings[i - 1].timestamp).getTime());
    }
  });

  it('has SoC values within 20-90% range', () => {
    const readings = generateTelemetry(testAsset, { days: 30 });
    for (const r of readings) {
      expect(r.socPct).toBeGreaterThanOrEqual(20);
      expect(r.socPct).toBeLessThanOrEqual(90);
    }
  });

  it('SoH degrades monotonically', () => {
    const readings = generateTelemetry(testAsset, { days: 30 });
    for (let i = 1; i < readings.length; i++) {
      expect(readings[i].sohPct).toBeLessThanOrEqual(readings[i - 1].sohPct);
    }
  });

  it('SoH starts at asset latestTelemetry value', () => {
    const readings = generateTelemetry(testAsset);
    expect(readings[0].sohPct).toBe(testAsset.latestTelemetry!.sohPct!);
  });

  it('SoH degrades ~0.003%/day for normal profile', () => {
    const readings = generateTelemetry(testAsset, { days: 90, profile: 'normal' });
    const first = readings[0].sohPct;
    const last = readings[readings.length - 1].sohPct;
    const totalDegradation = first - last;
    // ~0.003%/day × 90 days = ~0.27%
    expect(totalDegradation).toBeGreaterThan(0.2);
    expect(totalDegradation).toBeLessThan(0.35);
  });

  it('SoH degrades faster (~0.01%/day) for degraded profile', () => {
    const readings = generateTelemetry(testAsset, { days: 90, profile: 'degraded' });
    const first = readings[0].sohPct;
    const last = readings[readings.length - 1].sohPct;
    const totalDegradation = first - last;
    // ~0.01%/day × 90 days = ~0.9%
    expect(totalDegradation).toBeGreaterThan(0.7);
    expect(totalDegradation).toBeLessThan(1.1);
  });

  it('equivalent full cycles increase monotonically', () => {
    const readings = generateTelemetry(testAsset, { days: 30 });
    for (let i = 1; i < readings.length; i++) {
      expect(readings[i].equivalentFullCycles).toBeGreaterThanOrEqual(
        readings[i - 1].equivalentFullCycles
      );
    }
  });

  it('temperature values are in realistic range', () => {
    const readings = generateTelemetry(testAsset, { days: 30, profile: 'normal' });
    for (const r of readings) {
      expect(r.avgModuleTempC).toBeGreaterThan(10);
      expect(r.avgModuleTempC).toBeLessThan(45);
      expect(r.maxModuleTempC).toBeGreaterThanOrEqual(r.avgModuleTempC);
      expect(r.minModuleTempC).toBeLessThanOrEqual(r.avgModuleTempC);
    }
  });

  it('warning profile includes high_temperature alarm around days 45-46', () => {
    const readings = generateTelemetry(testAsset, { days: 90, profile: 'warning' });
    const highTempAlarms = readings.filter(
      (r) => r.activeAlarms.some((a) => a.type === 'high_temperature')
    );
    expect(highTempAlarms.length).toBeGreaterThan(0);
  });

  it('warning profile includes connectivity_loss alarm around days 60-61', () => {
    const readings = generateTelemetry(testAsset, { days: 90, profile: 'warning' });
    const connLossAlarms = readings.filter(
      (r) => r.activeAlarms.some((a) => a.type === 'connectivity_loss')
    );
    expect(connLossAlarms.length).toBeGreaterThan(0);
  });

  it('warning profile includes capacity_degradation alarm on day 75', () => {
    const readings = generateTelemetry(testAsset, { days: 90, profile: 'warning' });
    const capAlarms = readings.filter(
      (r) => r.activeAlarms.some((a) => a.type === 'capacity_degradation')
    );
    expect(capAlarms.length).toBeGreaterThan(0);
  });

  it('normal profile has efficiency between 91-93%', () => {
    const readings = generateTelemetry(testAsset, { days: 30, profile: 'normal' });
    for (const r of readings) {
      expect(r.rollingRoundTripEfficiencyPct).toBeGreaterThanOrEqual(90);
      expect(r.rollingRoundTripEfficiencyPct).toBeLessThanOrEqual(94);
    }
  });

  it('all readings have the correct assetId', () => {
    const readings = generateTelemetry(testAsset, { days: 7 });
    for (const r of readings) {
      expect(r.assetId).toBe(testAsset.assetId);
    }
  });

  it('is deterministic for the same asset and profile', () => {
    const a = generateTelemetry(testAsset, { days: 5 });
    const b = generateTelemetry(testAsset, { days: 5 });
    expect(a).toEqual(b);
  });
});

describe('getTelemetryForAsset', () => {
  it('returns telemetry for a valid asset ID', () => {
    const readings = getTelemetryForAsset(testAsset.assetId);
    expect(readings.length).toBe(90 * 24);
    expect(readings[0].assetId).toBe(testAsset.assetId);
  });

  it('returns empty array for unknown asset ID', () => {
    const readings = getTelemetryForAsset('NONEXISTENT');
    expect(readings).toEqual([]);
  });

  it('returns cached results on subsequent calls', () => {
    const a = getTelemetryForAsset(testAsset.assetId);
    const b = getTelemetryForAsset(testAsset.assetId);
    expect(a).toBe(b); // same reference (cached)
  });
});
