import { cn } from '@/lib/cn';

interface GaugeChartProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showSegments?: boolean;
  className?: string;
}

/** Color segments for the gauge arc */
const SEGMENTS = [
  { min: 0, max: 49, color: '#EF4444', label: 'Critical' },
  { min: 50, max: 74, color: '#F59E0B', label: 'Warning' },
  { min: 75, max: 89, color: '#00D4FF', label: 'Good' },
  { min: 90, max: 100, color: '#34D399', label: 'Excellent' },
] as const;

/** Map size prop to pixel dimensions */
const SIZE_MAP = {
  sm: { width: 120, height: 72, textSize: 'text-kpi-medium', labelSize: 'text-caption' },
  md: { width: 180, height: 108, textSize: 'text-kpi-large', labelSize: 'text-body' },
  lg: { width: 240, height: 144, textSize: 'text-kpi-hero', labelSize: 'text-body' },
} as const;

/**
 * Returns the active color based on the current value.
 */
function getValueColor(value: number): string {
  const segment = SEGMENTS.find((s) => value >= s.min && value <= s.max);
  return segment?.color ?? SEGMENTS[0].color;
}

/**
 * Returns the accessible label for a value segment.
 */
function getValueLabel(value: number): string {
  const segment = SEGMENTS.find((s) => value >= s.min && value <= s.max);
  return segment?.label ?? 'Unknown';
}

/**
 * GaugeChart — SVG-based semi-circular gauge with color segments.
 * Displays numeric value prominently in center. Respects `prefers-reduced-motion`.
 *
 * @validates NFR-006 — Status not dependent on color alone (text label included)
 * @validates FR-005 — Telemetry visualization
 */
export function GaugeChart({
  value,
  label,
  size = 'md',
  showSegments = true,
  className,
}: GaugeChartProps) {
  // Clamp value to 0-100
  const clampedValue = Math.max(0, Math.min(100, value));
  const { width, height, textSize, labelSize } = SIZE_MAP[size];

  // SVG arc math: semi-circle from 180° to 0° (left to right)
  const cx = width / 2;
  const cy = height - 4; // leave a little padding at the bottom
  const radius = Math.min(cx, cy) - 12;
  const strokeWidth = size === 'sm' ? 8 : size === 'md' ? 10 : 12;

  // Arc helper: angle in degrees (180 = leftmost, 0 = rightmost)
  function polarToCartesian(angleDeg: number): { x: number; y: number } {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy - radius * Math.sin(angleRad),
    };
  }

  // Build SVG arc path from startAngle to endAngle (both in 0-180 range, left=180, right=0)
  function describeArc(startAngle: number, endAngle: number): string {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArcFlag = startAngle - endAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }

  // Value arc: 0% maps to 180° (left), 100% maps to 0° (right)
  const valueAngle = 180 - (clampedValue / 100) * 180;

  // Segment arcs (for background visualization)
  const segmentArcs = SEGMENTS.map((seg) => {
    const segStart = 180 - (seg.min / 100) * 180;
    const segEnd = 180 - ((seg.max + 1) / 100) * 180;
    return {
      ...seg,
      path: describeArc(segStart, segEnd),
    };
  });

  const activeColor = getValueColor(clampedValue);
  const statusLabel = getValueLabel(clampedValue);

  return (
    <div
      className={cn('flex flex-col items-center gap-1', className)}
      role="meter"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ? `${label}: ${clampedValue}%` : `${clampedValue}%`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        {/* Background track */}
        {showSegments ? (
          // Colored segments background
          segmentArcs.map((seg) => (
            <path
              key={seg.min}
              d={seg.path}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.2}
            />
          ))
        ) : (
          // Single gray track
          <path
            d={describeArc(180, 0)}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-border-emphasis"
            opacity={0.3}
          />
        )}

        {/* Active value arc */}
        <path
          d={describeArc(180, valueAngle)}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="gauge-arc"
          style={
            {
              '--gauge-color': activeColor,
            } as React.CSSProperties
          }
        />
      </svg>

      {/* Center value display */}
      <div className="flex flex-col items-center -mt-2">
        <span className={cn(textSize, 'font-bold tabular-nums')} style={{ color: activeColor }}>
          {clampedValue}%
        </span>
        {/* Status text ensures color is not the only indicator (NFR-006) */}
        {label && (
          <span className={cn(labelSize, 'text-text-secondary')}>
            {label}
          </span>
        )}
        <span className="text-caption text-text-tertiary">{statusLabel}</span>
      </div>
    </div>
  );
}
