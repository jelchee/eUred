import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { VisibilityLevel } from '@/types/dataIngestion';

// ============================================================
// VISIBILITY BADGE
// ============================================================

export interface VisibilityBadgeProps {
  level: VisibilityLevel;
  size?: 'xs' | 'sm';
  showTooltip?: boolean;
  className?: string;
}

const colorMap: Record<VisibilityLevel, { bg: string; text: string; border: string }> = {
  public: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  restricted: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  confidential: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
};

const tooltipMap: Record<VisibilityLevel, string> = {
  public: 'Visible to all public viewers via QR code',
  restricted: 'Visible only to authorized authenticated users',
  confidential: 'Visible only to platform operators and administrators',
};

const sizeClasses = {
  xs: {
    badge: 'px-1.5 py-0.5 text-[0.625rem] gap-1',
    icon: 'h-2.5 w-2.5',
  },
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1.5',
    icon: 'h-3 w-3',
  },
};

/**
 * VisibilityBadge — Compact pill-style badge showing data visibility level.
 *
 * - Public (emerald): Visible to all public viewers via QR code
 * - Restricted (amber): Visible only to authorized authenticated users
 * - Confidential (red): Visible only to platform operators and administrators
 *
 * @validates FR-DI-015 — Visibility classification display
 */
export const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({
  level,
  size = 'xs',
  showTooltip = true,
  className,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const colors = colorMap[level];
  const tooltip = tooltipMap[level];
  const sizeStyle = sizeClasses[size];

  return (
    <span
      className={cn(
        'relative inline-flex items-center rounded-full border font-medium leading-none whitespace-nowrap capitalize',
        colors.bg,
        colors.text,
        colors.border,
        sizeStyle.badge,
        className,
      )}
      role="status"
      aria-label={`Visibility: ${level} — ${tooltip}`}
    >
      <span>{level}</span>
      {showTooltip && (
        <span
          className="relative inline-flex"
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
          onFocus={() => setIsTooltipVisible(true)}
          onBlur={() => setIsTooltipVisible(false)}
        >
          <Info
            className={cn(sizeStyle.icon, 'shrink-0 cursor-help opacity-70 hover:opacity-100 transition-opacity')}
            aria-hidden="true"
            tabIndex={0}
          />
          {isTooltipVisible && (
            <span
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[0.625rem] leading-tight text-white bg-navy-900 border border-border rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
              role="tooltip"
            >
              {tooltip}
            </span>
          )}
        </span>
      )}
    </span>
  );
};

export default VisibilityBadge;
