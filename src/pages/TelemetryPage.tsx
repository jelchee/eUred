import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Battery,
  Activity,
  Thermometer,
  Zap,
  AlertTriangle,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { useTelemetry } from '@/hooks/useTelemetry';
import { KPICard } from '@/components/shared';
import { TelemetryChart, RoleAccessBanner } from '@/components/domain';
import { DemoDisclaimer } from '@/components/shared';
import { exportTelemetryCSV } from '@/lib/exportService';
import type { TimeRange } from '@/types';

// ============================================================
// TIME RANGE SELECTOR
// ============================================================

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-background-tertiary border border-border-default">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === range.value
              ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-background-surface'
          }`}
          aria-pressed={value === range.value}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// NOT FOUND STATE
// ============================================================

function AssetNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Activity className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
      <h1 className="text-heading-2 text-text-primary">Asset Not Found</h1>
      <p className="text-body text-text-secondary max-w-md text-center">
        The asset you're looking for doesn't exist or you don't have access to view its telemetry.
      </p>
      <Link
        to="/assets"
        className="mt-4 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-colors"
      >
        ← Back to Asset Registry
      </Link>
    </div>
  );
}

// ============================================================
// ALARM EVENTS LIST
// ============================================================

interface AlarmEventsListProps {
  alarms: ReturnType<typeof useTelemetry>['alarms'];
}

function AlarmEventsList({ alarms }: AlarmEventsListProps) {
  if (alarms.length === 0) return null;

  // Flatten all alarm events from readings that have alarms
  const allAlarmEvents = alarms.flatMap((reading) =>
    reading.activeAlarms.map((alarm) => ({
      ...alarm,
      readingTimestamp: reading.timestamp,
    }))
  );

  // Show latest 10
  const recentAlarms = allAlarmEvents.slice(-10).reverse();

  return (
    <section aria-label="Alarm events">
      <h2 className="text-heading-3 text-text-primary mb-3 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />
        Recent Alarm Events
      </h2>
      <div className="card p-4">
        <div className="space-y-3">
          {recentAlarms.map((alarm, idx) => (
            <div
              key={`${alarm.id}-${idx}`}
              className={`flex items-start gap-3 px-3 py-2 rounded-lg ${
                alarm.severity === 'critical'
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  alarm.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                }`}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    alarm.severity === 'critical' ? 'text-red-300' : 'text-amber-300'
                  }`}
                >
                  {alarm.message}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {new Date(alarm.timestamp).toLocaleString()} ·{' '}
                  <span className="capitalize">{alarm.severity}</span> ·{' '}
                  {alarm.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TELEMETRY PAGE
// ============================================================

/**
 * TelemetryPage — Displays BMS telemetry data for a single BESS asset.
 * Includes time range selector, four chart panels (SoC, SoH, Temperature, Energy),
 * current status KPI cards, and alarm event overlays.
 *
 * @validates FR-005 — BMS/Telemetry visualization with charts and alarm scenarios
 */
export function TelemetryPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const { getAssetById } = useAssets();
  const {
    readings,
    allReadings,
    timeRange,
    setTimeRange,
    generateForAsset,
    alarms,
    stats,
  } = useTelemetry(assetId ?? '');

  const asset = assetId ? getAssetById(assetId) : undefined;

  // Generate telemetry data on mount if none exists
  useEffect(() => {
    if (assetId && allReadings.length === 0) {
      generateForAsset(assetId);
    }
  }, [assetId, allReadings.length, generateForAsset]);

  if (!asset) {
    return <AssetNotFound />;
  }

  // Derive availability from latest reading or asset telemetry snapshot
  const latestAvailability =
    readings.length > 0
      ? readings[readings.length - 1].availabilityPct
      : asset.latestTelemetry?.availability30dPct ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic telemetry data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Header */}
      <header className="flex flex-col gap-3">
        <Link
          to={`/assets/${asset.assetId}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-cyan transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to {asset.model}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-heading-1 text-text-primary">
              Telemetry Dashboard
            </h1>
            <p className="text-body text-text-secondary mt-1">
              {asset.model} · {asset.location.siteName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportTelemetryCSV(readings, asset.assetId)}
              disabled={readings.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export telemetry data as CSV"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Export CSV
            </button>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </div>
      </header>

      {/* Status KPI Cards */}
      <section aria-label="Current telemetry status">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Latest SoC"
            value={stats.latestSoC > 0 ? stats.latestSoC.toFixed(1) : '—'}
            unit={stats.latestSoC > 0 ? '%' : undefined}
            icon={Battery}
            variant="accent"
            accentColor="cyan"
          />
          <KPICard
            label="Latest SoH"
            value={stats.latestSoH > 0 ? stats.latestSoH.toFixed(1) : '—'}
            unit={stats.latestSoH > 0 ? '%' : undefined}
            icon={Activity}
            variant="accent"
            accentColor="emerald"
          />
          <KPICard
            label="Avg Temperature"
            value={stats.avgTemp > 0 ? stats.avgTemp.toFixed(1) : '—'}
            unit={stats.avgTemp > 0 ? '°C' : undefined}
            icon={Thermometer}
            variant="accent"
            accentColor="amber"
          />
          <KPICard
            label="Availability"
            value={latestAvailability != null ? latestAvailability.toFixed(1) : '—'}
            unit={latestAvailability != null ? '%' : undefined}
            icon={Zap}
            variant="accent"
            accentColor="emerald"
          />
        </div>
      </section>

      {/* Chart Panels */}
      <section aria-label="Telemetry charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TelemetryChart
          data={readings}
          metric="soc"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          showAlarms
          height={280}
        />
        <TelemetryChart
          data={readings}
          metric="soh"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          showAlarms
          height={280}
        />
        <TelemetryChart
          data={readings}
          metric="temperature"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          showAlarms
          height={280}
        />
        <TelemetryChart
          data={readings}
          metric="energy"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          showAlarms
          height={280}
        />
      </section>

      {/* Alarm Events */}
      <AlarmEventsList alarms={alarms} />
    </div>
  );
}
