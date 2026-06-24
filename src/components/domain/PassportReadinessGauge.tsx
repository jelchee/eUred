import React from 'react';
import { cn } from '@/lib/cn';
import { GaugeChart } from '@/components/shared';

export interface PassportReadinessGaugeProps {
  score: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showSegments?: boolean;
  className?: string;
}

/**
 * PassportReadinessGauge — Wrapper around the shared GaugeChart that adds
 * passport-specific context (readiness label, demo disclaimer tooltip).
 *
 * Color segments: 0-49 red (Critical Gaps), 50-74 amber (Needs Attention),
 * 75-89 cyan (Nearly Ready), 90-100 emerald (Passport Ready).
 *
 * @validates FR-004 — Compliance Gap Analyzer score visualization
 * @validates FR-003 — Private Passport View readiness display
 */
export const PassportReadinessGauge: React.FC<PassportReadinessGaugeProps> = ({
  score,
  label = 'Passport Readiness',
  size = 'md',
  showSegments = true,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <GaugeChart
        value={score}
        label={label}
        size={size}
        showSegments={showSegments}
      />
      <p className="text-caption text-text-tertiary mt-2 text-center">
        Demo compliance score — not a regulatory assessment
      </p>
    </div>
  );
};

export default PassportReadinessGauge;
