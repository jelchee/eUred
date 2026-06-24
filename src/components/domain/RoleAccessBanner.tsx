import { Shield } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types';

export interface RoleAccessBannerProps {
  className?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  PUBLIC_VIEWER: 'Public Viewer',
  ASSET_OWNER: 'Asset Owner',
  RIMAC_SERVICE_ENGINEER: 'Rimac Service Engineer',
  ENT_PLATFORM_OPERATOR: 'ENT Platform Operator',
  REGULATOR: 'Regulator',
  RECYCLER: 'Recycler',
  ADMIN: 'Admin',
  RIMAC_OPERATOR: 'Rimac Operator',
  RIMAC_COMPLIANCE_MANAGER: 'Rimac Compliance Manager',
  RIMAC_SERVICE_USER: 'Rimac Service User',
  SUPPLIER_USER: 'Supplier User',
};

const ROLE_ACCESSIBLE_SECTIONS: Record<UserRole, string[]> = {
  PUBLIC_VIEWER: ['Public passport data'],
  ASSET_OWNER: [
    'Private passport',
    'Telemetry overview',
    'Compliance status',
    'Documents',
    'ESG data',
  ],
  RIMAC_SERVICE_ENGINEER: [
    'Private passport',
    'Detailed telemetry',
    'Compliance',
    'Service documents',
    'Tasks',
  ],
  ENT_PLATFORM_OPERATOR: [
    'Private passport',
    'Detailed telemetry',
    'Compliance',
    'Documents',
    'Audit trail',
    'System status',
  ],
  REGULATOR: [
    'Private passport',
    'Compliance matrix',
    'Documents',
    'Audit trail',
    'ESG data',
  ],
  RECYCLER: [
    'Private passport',
    'Documents',
    'Recycling data',
  ],
  ADMIN: [
    'All sections',
    'Demo data management',
    'System status',
  ],
  RIMAC_OPERATOR: [
    'Private passport',
    'Telemetry overview',
    'Data ingestion',
    'Asset management',
  ],
  RIMAC_COMPLIANCE_MANAGER: [
    'Private passport',
    'Compliance review',
    'Documents',
    'Audit trail',
    'Passport publishing',
  ],
  RIMAC_SERVICE_USER: [
    'Private passport',
    'Telemetry overview',
    'Service documents',
  ],
  SUPPLIER_USER: [
    'Supplier obligations',
    'Declarations',
    'Own submissions',
  ],
};

/**
 * RoleAccessBanner — Shows current role context on pages.
 * Displays a brief "You're viewing as..." message with accessible data sections.
 *
 * Validates: Requirements FR-009, NFR-005
 */
export function RoleAccessBanner({ className }: RoleAccessBannerProps) {
  const { currentRole } = useRole();

  const roleLabel = ROLE_LABELS[currentRole];
  const sections = ROLE_ACCESSIBLE_SECTIONS[currentRole];

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50',
        className
      )}
      role="status"
      aria-label={`Current role: ${roleLabel}`}
    >
      <Shield
        className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-sm text-text-primary">
          You're viewing as{' '}
          <span className="font-medium text-cyan-400">{roleLabel}</span>
        </p>
        <p className="text-xs text-text-tertiary mt-0.5">
          Access: {sections.join(' · ')}
        </p>
      </div>
    </div>
  );
}
