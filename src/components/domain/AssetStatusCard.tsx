import React from 'react';
import {
  MapPin,
  Building2,
  Wifi,
  WifiOff,
  Signal,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { GaugeChart, StatusBadge } from '@/components/shared';
import type { Asset } from '@/types';

export interface AssetStatusCardProps {
  asset: Asset;
  variant?: 'compact' | 'expanded';
  onClick?: (assetId: string) => void;
  className?: string;
}

/**
 * Connectivity status icon mapping.
 */
const connectivityIcons = {
  online: Wifi,
  offline: WifiOff,
  pending: Signal,
} as const;

const connectivityColors = {
  online: 'text-emerald-400',
  offline: 'text-red-400',
  pending: 'text-amber-400',
} as const;

/**
 * AssetStatusCard — Summary card for a single BESS asset showing key health,
 * compliance, and connectivity indicators.
 *
 * Supports compact (list item) and expanded (dashboard hero) variants.
 * Uses glassmorphism styling for the expanded variant.
 *
 * @validates FR-001 — Asset Registry display
 * @validates FR-005 — BMS/Telemetry indicators (SoC/SoH)
 */
export const AssetStatusCard: React.FC<AssetStatusCardProps> = ({
  asset,
  variant = 'compact',
  onClick,
  className,
}) => {
  const ConnectivityIcon = connectivityIcons[asset.connectivityStatus];

  const handleClick = () => {
    onClick?.(asset.assetId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(asset.assetId);
    }
  };

  if (variant === 'expanded') {
    return (
      <div
        className={cn(
          'glass-card p-card-padding flex flex-col gap-4 transition-shadow hover:shadow-card-hover',
          onClick && 'cursor-pointer',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Asset ${asset.assetId}: ${asset.model}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="text-heading-3 text-text-primary truncate">{asset.model}</h3>
            <div className="flex items-center gap-2 text-caption text-text-secondary">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{asset.location.city}, {asset.location.country}</span>
            </div>
            <div className="flex items-center gap-2 text-caption text-text-secondary">
              <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{asset.owner}</span>
            </div>
          </div>

          {/* Connectivity + alarm status */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <ConnectivityIcon
                className={cn('w-4 h-4', connectivityColors[asset.connectivityStatus])}
                aria-hidden="true"
              />
              <StatusBadge status={asset.connectivityStatus} size="xs" />
            </div>
            <StatusBadge status={asset.alarmStatus} size="xs" showIcon />
          </div>
        </div>

        {/* Gauges row */}
        <div className="flex items-center justify-around gap-4">
          <GaugeChart
            value={asset.latestTelemetry?.socPct ?? 0}
            label="SoC"
            size="sm"
            showSegments={false}
          />
          <GaugeChart
            value={asset.latestTelemetry?.sohPct ?? 0}
            label="SoH"
            size="sm"
            showSegments={false}
          />
        </div>

        {/* Compliance badge */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-caption text-text-tertiary">Compliance</span>
          <StatusBadge status={asset.complianceStatus} size="sm" showIcon />
        </div>

        {/* Active warning */}
        {asset.activeWarning && (
          <p className="text-caption text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
            {asset.activeWarning}
          </p>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div
      className={cn(
        'card flex items-center gap-4 p-4 transition-shadow hover:shadow-card-hover',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Asset ${asset.assetId}: ${asset.model}`}
    >
      {/* Asset info */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-body font-medium text-text-primary truncate">{asset.model}</span>
        <span className="text-caption text-text-secondary truncate">
          {asset.location.city}, {asset.location.country} · {asset.owner}
        </span>
      </div>

      {/* SoC/SoH compact display */}
      <div className="flex items-center gap-3 shrink-0">
        <CompactGauge
          label="SoC"
          value={asset.latestTelemetry?.socPct}
        />
        <CompactGauge
          label="SoH"
          value={asset.latestTelemetry?.sohPct}
        />
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={asset.complianceStatus} size="xs" />
        <ConnectivityIcon
          className={cn('w-4 h-4', connectivityColors[asset.connectivityStatus])}
          aria-hidden="true"
        />
        {asset.alarmStatus !== 'normal' && asset.alarmStatus !== 'none' && (
          <StatusBadge status={asset.alarmStatus} size="xs" showIcon />
        )}
      </div>
    </div>
  );
};

/**
 * Compact inline gauge for list view — shows a colored value with label.
 */
function CompactGauge({ label, value }: { label: string; value: number | null | undefined }) {
  const displayValue = value != null ? `${Math.round(value)}%` : '—';
  const color = value == null
    ? 'text-text-tertiary'
    : value >= 90
      ? 'text-emerald-400'
      : value >= 75
        ? 'text-cyan-400'
        : value >= 50
          ? 'text-amber-400'
          : 'text-red-400';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn('text-body font-semibold tabular-nums', color)}>
        {displayValue}
      </span>
      <span className="text-[0.625rem] text-text-tertiary">{label}</span>
    </div>
  );
}

export default AssetStatusCard;
