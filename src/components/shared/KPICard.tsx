import { type LucideIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down' | 'stable'; value: string };
  icon?: LucideIcon;
  variant?: 'default' | 'glass' | 'accent';
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'red';
  className?: string;
}

const accentColorMap = {
  cyan: {
    border: 'border-accent-cyan/30',
    glow: 'shadow-glow-cyan',
    text: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
  },
  emerald: {
    border: 'border-accent-emerald/30',
    glow: 'shadow-glow-emerald',
    text: 'text-accent-emerald',
    bg: 'bg-accent-emerald/10',
  },
  amber: {
    border: 'border-amber-400/30',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3),0_0_40px_rgba(245,158,11,0.1)]',
    text: 'text-accent-amber',
    bg: 'bg-accent-amber/10',
  },
  red: {
    border: 'border-accent-red/30',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3),0_0_40px_rgba(239,68,68,0.1)]',
    text: 'text-accent-red',
    bg: 'bg-accent-red/10',
  },
} as const;

const trendConfig = {
  up: { icon: ArrowUp, color: 'text-accent-emerald' },
  down: { icon: ArrowDown, color: 'text-accent-red' },
  stable: { icon: Minus, color: 'text-text-secondary' },
} as const;

/**
 * KPICard — Displays a single KPI metric with large numeric value, label,
 * optional trend indicator, icon, and unit. Supports default, glass, and accent variants.
 *
 * Validates: Requirements NFR-006
 */
export function KPICard({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  variant = 'default',
  accentColor = 'cyan',
  className,
}: KPICardProps) {
  const colors = accentColorMap[accentColor];

  const variantClasses = {
    default: 'card flex flex-col gap-2',
    glass: 'glass-card p-card-padding flex flex-col gap-2',
    accent: cn(
      'card flex flex-col gap-2',
      colors.border,
      colors.glow,
    ),
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        className,
      )}
    >
      {/* Header row: icon + trend */}
      <div className="flex items-center justify-between">
        {Icon && (
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <Icon className={cn('w-5 h-5', colors.text)} aria-hidden="true" />
          </div>
        )}
        {trend && <TrendIndicator direction={trend.direction} value={trend.value} />}
      </div>

      {/* Value display */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-kpi-large text-text-primary"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-body text-text-secondary">{unit}</span>
        )}
      </div>

      {/* Label */}
      <span className="text-caption text-text-secondary">{label}</span>
    </div>
  );
}

function TrendIndicator({ direction, value }: { direction: 'up' | 'down' | 'stable'; value: string }) {
  const config = trendConfig[direction];
  const TrendIcon = config.icon;

  return (
    <div className={cn('flex items-center gap-1 text-caption', config.color)}>
      <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{value}</span>
    </div>
  );
}
