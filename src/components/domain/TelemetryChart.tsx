import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { ChartContainer } from '@/components/shared';
import type { TelemetryReading, TelemetryMetric, TimeRange } from '@/types';

export interface TelemetryChartProps {
  data: TelemetryReading[];
  metric: TelemetryMetric;
  timeRange: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showAlarms?: boolean;
  height?: number;
  className?: string;
}

/** Metric configuration: which data field to plot, labels, colors, thresholds */
interface MetricConfig {
  dataKey: keyof TelemetryReading;
  label: string;
  unit: string;
  color: string;
  fillColor: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  /** Whether threshold means "above is bad" (true) or "below is bad" (false) */
  thresholdDirection: 'above' | 'below';
  yDomain?: [number, number];
}

const METRIC_CONFIGS: Record<TelemetryMetric, MetricConfig> = {
  soc: {
    dataKey: 'socPct',
    label: 'State of Charge',
    unit: '%',
    color: '#00D4FF',
    fillColor: 'rgba(0, 212, 255, 0.15)',
    warningThreshold: 20,
    criticalThreshold: 10,
    thresholdDirection: 'below',
    yDomain: [0, 100],
  },
  soh: {
    dataKey: 'sohPct',
    label: 'State of Health',
    unit: '%',
    color: '#34D399',
    fillColor: 'rgba(52, 211, 153, 0.15)',
    warningThreshold: 85,
    criticalThreshold: 70,
    thresholdDirection: 'below',
    yDomain: [60, 100],
  },
  temperature: {
    dataKey: 'avgModuleTempC',
    label: 'Avg. Module Temperature',
    unit: '°C',
    color: '#F59E0B',
    fillColor: 'rgba(245, 158, 11, 0.15)',
    warningThreshold: 40,
    criticalThreshold: 50,
    thresholdDirection: 'above',
  },
  energy: {
    dataKey: 'energyDischargedKWh',
    label: 'Energy Discharged',
    unit: 'kWh',
    color: '#00D4FF',
    fillColor: 'rgba(0, 212, 255, 0.15)',
    thresholdDirection: 'above',
  },
  efficiency: {
    dataKey: 'rollingRoundTripEfficiencyPct',
    label: 'Round-Trip Efficiency',
    unit: '%',
    color: '#34D399',
    fillColor: 'rgba(52, 211, 153, 0.15)',
    warningThreshold: 88,
    criticalThreshold: 82,
    thresholdDirection: 'below',
    yDomain: [75, 100],
  },
  availability: {
    dataKey: 'availabilityPct',
    label: 'System Availability',
    unit: '%',
    color: '#34D399',
    fillColor: 'rgba(52, 211, 153, 0.15)',
    warningThreshold: 95,
    criticalThreshold: 90,
    thresholdDirection: 'below',
    yDomain: [80, 100],
  },
};

/** Format timestamp for X axis based on the time range */
function formatXAxis(timestamp: string, timeRange: TimeRange): string {
  const date = new Date(timestamp);
  if (timeRange === '24h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (timeRange === '7d') {
    return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Custom tooltip component for dark theme */
function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const date = new Date(label as string);
  const formattedDate = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-lg border border-border-emphasis bg-background-elevated px-3 py-2 shadow-elevated">
      <p className="text-xs text-text-tertiary mb-1">
        {formattedDate} {formattedTime}
      </p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-medium text-text-primary">
          {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          {unit}
        </p>
      ))}
    </div>
  );
}

/**
 * TelemetryChart — Recharts-based line/area chart for BMS telemetry data.
 * Supports multiple metrics, alarm overlays, and color-coded threshold lines.
 *
 * @validates FR-005 — Telemetry visualization with charts and alarm scenarios
 */
export function TelemetryChart({
  data,
  metric,
  timeRange,
  onTimeRangeChange,
  showAlarms = true,
  height = 300,
  className,
}: TelemetryChartProps) {
  const config = METRIC_CONFIGS[metric];

  // Prepare chart data with simplified timestamp for display
  const chartData = useMemo(() => {
    return data.map((reading) => ({
      ...reading,
      _displayTime: formatXAxis(reading.timestamp, timeRange),
    }));
  }, [data, timeRange]);

  // Collect alarm timestamps for reference markers
  const alarmMarkers = useMemo(() => {
    if (!showAlarms) return [];
    return data
      .filter((reading) => reading.activeAlarms.length > 0)
      .map((reading) => ({
        timestamp: reading.timestamp,
        severity: reading.activeAlarms[0].severity,
        message: reading.activeAlarms[0].message,
      }));
  }, [data, showAlarms]);

  return (
    <ChartContainer
      title={config.label}
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
      showTimeSelector={!!onTimeRangeChange}
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(30, 41, 59, 0.8)"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts) => formatXAxis(ts, timeRange)}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={{ stroke: '#1E293B' }}
            tickLine={{ stroke: '#1E293B' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={config.yDomain ?? ['auto', 'auto']}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={{ stroke: '#1E293B' }}
            tickLine={{ stroke: '#1E293B' }}
            unit={config.unit === '%' ? '%' : ''}
            width={45}
          />
          <Tooltip
            content={<CustomTooltip unit={config.unit} />}
            cursor={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
          />

          {/* Filled area under the line */}
          <Area
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            fill={config.fillColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: config.color, stroke: '#0D1321', strokeWidth: 2 }}
          />

          {/* Warning threshold line */}
          {config.warningThreshold !== undefined && (
            <ReferenceLine
              y={config.warningThreshold}
              stroke="#F59E0B"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Warning: ${config.warningThreshold}${config.unit}`,
                fill: '#F59E0B',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
          )}

          {/* Critical threshold line */}
          {config.criticalThreshold !== undefined && (
            <ReferenceLine
              y={config.criticalThreshold}
              stroke="#EF4444"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: `Critical: ${config.criticalThreshold}${config.unit}`,
                fill: '#EF4444',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
            />
          )}

          {/* Alarm event markers as vertical reference lines */}
          {showAlarms &&
            alarmMarkers.map((alarm, idx) => (
              <ReferenceLine
                key={`alarm-${idx}`}
                x={alarm.timestamp}
                stroke={alarm.severity === 'critical' ? '#EF4444' : '#F59E0B'}
                strokeDasharray="2 2"
                strokeWidth={1}
              />
            ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default TelemetryChart;
