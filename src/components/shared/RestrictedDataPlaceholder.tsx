import { Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/types';

interface RestrictedDataPlaceholderProps {
  section: string;
  requiredRoles: UserRole[];
  message?: string;
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

export function RestrictedDataPlaceholder({
  section,
  requiredRoles,
  message,
  className,
}: RestrictedDataPlaceholderProps) {
  const defaultMessage = `This section is restricted based on your current role. Switch to an authorized role to view this data.`;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-600/50 bg-slate-900/30 px-6 py-8 text-center',
        className
      )}
      role="status"
      aria-label={`Restricted section: ${section}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60">
        <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-slate-300">{section}</h3>
        <p className="max-w-sm text-xs text-slate-500">
          {message || defaultMessage}
        </p>
      </div>

      <div className="mt-2 space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Accessible by
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {requiredRoles.map((role) => (
            <span
              key={role}
              className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-400"
            >
              {ROLE_LABELS[role]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
