import React from 'react';
import {
  Activity,
  Battery,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Asset } from '@/types';

export interface BatteryHealthCardProps {
  asset: Asset;
  className?: string;
}

/** Lifetime cycle design target for SineStack */
const LIFETIME_CYCLE_TARGET = 12_000;

/**
 * Determines the SoH trend direction based on the current value.
 * In a real system this would compare to historical values.
 * For demo purposes:
 * - SoH >= 99.5% → stable (nearly new)
 * - SoH >= 95% → down (slight degradation observed)
 * - SoH < 95% → down (noticeable degradation)
 */
function getSohTrend(sohPct: number | null): {
  direction: 'up' | 'down' | 'stable';
  value: string;
} {
  if (sohPct == null) {
    return { direction: 'stable', value: 'N/A' };
  }
  if (sohPct >= 99.5) {
    return { direction: 'stable', value: 'Stable' };
  }
  if (sohPct >= 95) {
    return { direction: 'down', value: `-${(100 - sohPct).toFixed(1)}%` };
  }
  return { direction: 'down', value: `-${(100 - sohPct).toFixed(1)}%` };
}

/**
 * Trend icon component for inline display.
 */
function TrendIcon({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };
  const colors = {
    up: 'text-emerald-400',
    down: 'text-amber-400',
    stable: 'text-text-secondary',
  };
  const Icon = icons[direction];
  return <Icon className={cn('w-4 h-4', colors[direction])} aria-hidden="true" />;
}

/**
 * BatteryHealthCard — Displays battery health summary including SoH trend,
 * cycle count, energy throughput, and round-trip efficiency.
 *
 * Uses KPICard from shared components for consistent metric display.
 *
 * @validates FR-001 — Asset health indicators
 * @validates FR-005 — BMS telemetry visualization (SoH, cycles, energy)
 */
export const BatteryHealthCard: React.FC<BatteryHealthCardProps> = ({
  asset,
  className,
}) => {
  const telemetry = asset.latestTelemetry;
  const sohTrend = getSohTrend(telemetry?.sohPct ?? null);
  const cycles = telemetry?.equivalentFullCycles ?? 0;
  const cycleProgress = Math.min(100, (cycles / LIFETIME_CYCLE_TARGET) * 100);

  return (
    <div
      className={cn('card p-card-padding flex flex-col gap-5', className)}
      aria-label={`Battery health summary for ${asset.model}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-accent-cyan" aria-hidden="true" />
        <h3 className="text-heading-3 text-text-primary">Battery Health</h3>
      </div>

      {/* SoH with trend */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-background-primary border border-border">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-text-secondary">State of Health</span>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-kpi-large tabular-nums',
                telemetry?.sohPct != null
                  ? telemetry.sohPct >= 90
                    ? 'text-emerald-400'
                    : telemetry.sohPct >= 75
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  : 'text-text-tertiary',
              )}
            >
              {telemetry?.sohPct != null ? `${telemetry.sohPct}%` : '—'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon direction={sohTrend.direction} />
          <span className="text-caption text-text-secondary">{sohTrend.value}</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cycle count */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-background-primary border border-border">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span className="text-caption text-text-secondary">Cycle Count</span>
          </div>
          <span className="text-body font-semibold text-text-primary tabular-nums">
            {cycles.toLocaleString()}
          </span>
          {/* Progress toward lifetime target */}
          <div className="flex flex-col gap-1">
            <div className="w-full h-1.5 rounded-full bg-border-emphasis overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all"
                style={{ width: `${cycleProgress}%` }}
                role="progressbar"
                aria-valuenow={cycles}
                aria-valuemax={LIFETIME_CYCLE_TARGET}
                aria-label={`${cycles} of ${LIFETIME_CYCLE_TARGET.toLocaleString()} cycles`}
              />
            </div>
            <span className="text-[0.625rem] text-text-tertiary">
              of {LIFETIME_CYCLE_TARGET.toLocaleString()} design target
            </span>
          </div>
        </div>

        {/* Round-trip efficiency */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-background-primary border border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span className="text-caption text-text-secondary">Round-trip Eff.</span>
          </div>
          <span className="text-body font-semibold text-text-primary tabular-nums">
            {telemetry?.rollingRtePct != null ? `${telemetry.rollingRtePct}%` : '—'}
          </span>
          <span className="text-[0.625rem] text-text-tertiary">
            Rolling estimate
          </span>
        </div>
      </div>

      {/* Energy throughput summary */}
      <div className="flex flex-col gap-2 p-3 rounded-xl bg-background-primary border border-border">
        <span className="text-caption text-text-secondary">Energy Throughput</span>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.625rem] text-text-tertiary">Capacity</span>
            <span className="text-body font-semibold text-text-primary tabular-nums">
              {asset.nominalEnergyKWh} kWh
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.625rem] text-text-tertiary">Usable</span>
            <span className="text-body font-semibold text-text-primary tabular-nums">
              {asset.usableEnergyKWh} kWh
            </span>
          </div>
        </div>
        {/* Availability */}
        {telemetry?.availability30dPct != null && (
          <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
            <span className="text-[0.625rem] text-text-tertiary">30-day Availability</span>
            <span className="text-body font-semibold text-emerald-400 tabular-nums">
              {telemetry.availability30dPct}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatteryHealthCard;
