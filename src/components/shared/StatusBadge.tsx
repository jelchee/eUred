import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  FileQuestion,
  Minus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Signal,
  SignalZero,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type {
  AttributeStatus,
  ComplianceLevel,
  ConnectivityStatus,
  AlarmStatus,
} from '@/types';

type StatusType = AttributeStatus | ComplianceLevel | ConnectivityStatus | AlarmStatus;

export interface StatusBadgeProps {
  status: StatusType;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

/**
 * Color classes mapped per status value (background + text).
 * Always includes a text label for accessibility (NFR-006).
 */
const statusColorMap: Record<StatusType, { bg: string; text: string; border: string }> = {
  // AttributeStatus
  missing: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
  draft: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  provided: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  verified: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  expired: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
  not_applicable: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  },
  // ComplianceLevel
  critical_gaps: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
  needs_attention: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  nearly_ready: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  passport_ready: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  // ConnectivityStatus
  online: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  offline: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
  pending: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  // AlarmStatus
  normal: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  critical: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
  none: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  },
};

/**
 * Icon mapping per status value for optional icon prefix.
 */
const statusIconMap: Record<StatusType, LucideIcon> = {
  // AttributeStatus
  missing: AlertCircle,
  draft: FileQuestion,
  provided: Circle,
  verified: CheckCircle2,
  expired: Clock,
  not_applicable: Minus,
  // ComplianceLevel
  critical_gaps: ShieldAlert,
  needs_attention: Shield,
  nearly_ready: ShieldCheck,
  passport_ready: ShieldCheck,
  // ConnectivityStatus
  online: Wifi,
  offline: WifiOff,
  pending: Signal,
  // AlarmStatus
  normal: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertCircle,
  none: SignalZero,
};

/**
 * Human-readable labels for status values.
 */
const statusLabelMap: Record<StatusType, string> = {
  // AttributeStatus
  missing: 'Missing',
  draft: 'Draft',
  provided: 'Provided',
  verified: 'Verified',
  expired: 'Expired',
  not_applicable: 'N/A',
  // ComplianceLevel
  critical_gaps: 'Critical Gaps',
  needs_attention: 'Needs Attention',
  nearly_ready: 'Nearly Ready',
  passport_ready: 'Passport Ready',
  // ConnectivityStatus
  online: 'Online',
  offline: 'Offline',
  pending: 'Pending',
  // AlarmStatus
  normal: 'Normal',
  warning: 'Warning',
  critical: 'Critical',
  none: 'None',
};

/**
 * Size classes for the badge container and icon.
 */
const sizeClasses = {
  xs: {
    badge: 'px-1.5 py-0.5 text-[0.625rem] gap-1',
    icon: 'h-2.5 w-2.5',
  },
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'h-3.5 w-3.5',
  },
};

/**
 * StatusBadge — Consistent badge component for all status displays.
 * Always includes a text label (never relies on color alone) for accessibility (NFR-006).
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = false,
  className,
}) => {
  const colors = statusColorMap[status];
  const Icon = statusIconMap[status];
  const label = statusLabelMap[status];
  const sizeStyle = sizeClasses[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium leading-none whitespace-nowrap',
        colors.bg,
        colors.text,
        colors.border,
        sizeStyle.badge,
        className,
      )}
      role="status"
      aria-label={label}
    >
      {showIcon && Icon && (
        <Icon className={cn(sizeStyle.icon, 'shrink-0')} aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
