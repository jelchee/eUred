import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/types';

// ============================================================
// ROLE METADATA
// ============================================================

interface RoleInfo {
  label: string;
  description: string;
}

const ROLE_INFO: Record<UserRole, RoleInfo> = {
  PUBLIC_VIEWER: {
    label: 'Public Viewer',
    description: 'Basic public passport data via QR code',
  },
  ASSET_OWNER: {
    label: 'Asset Owner',
    description: 'Full asset data, telemetry, compliance',
  },
  RIMAC_SERVICE_ENGINEER: {
    label: 'Service Engineer',
    description: 'Detailed telemetry, service data, diagnostics',
  },
  ENT_PLATFORM_OPERATOR: {
    label: 'Platform Operator',
    description: 'Platform health, audit trail, system status',
  },
  REGULATOR: {
    label: 'Regulator',
    description: 'Compliance matrix, audit trail, verification status',
  },
  RECYCLER: {
    label: 'Recycler',
    description: 'Chemistry, materials, recycling instructions',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Full access to all data and admin functions',
  },
  RIMAC_OPERATOR: {
    label: 'Rimac Operator',
    description: 'Rimac data operator — creates assets, imports data, manages integrations',
  },
  RIMAC_COMPLIANCE_MANAGER: {
    label: 'Compliance Manager',
    description: 'Rimac compliance manager — reviews evidence, approves/rejects, publishes passports',
  },
  RIMAC_SERVICE_USER: {
    label: 'Rimac Service User',
    description: 'Rimac service user — manages lifecycle events, uploads documents',
  },
  SUPPLIER_USER: {
    label: 'Supplier User',
    description: 'Supplier user — views obligations, submits declarations',
  },
};

const ALL_ROLES: UserRole[] = [
  'PUBLIC_VIEWER',
  'ASSET_OWNER',
  'RIMAC_SERVICE_ENGINEER',
  'ENT_PLATFORM_OPERATOR',
  'REGULATOR',
  'RECYCLER',
  'ADMIN',
  'RIMAC_OPERATOR',
  'RIMAC_COMPLIANCE_MANAGER',
  'RIMAC_SERVICE_USER',
  'SUPPLIER_USER',
];

// ============================================================
// ROLE SWITCHER COMPONENT
// ============================================================

interface RoleSwitcherProps {
  className?: string;
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { currentRole, setRole } = useRole();
  const currentRoleInfo = ROLE_INFO[currentRole];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2',
            'bg-[#141B2D] border border-[#1E293B] hover:border-[#334155]',
            'text-sm text-[#F1F5F9] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50',
            className
          )}
          aria-label={`Current role: ${currentRoleInfo.label}. Click to switch role.`}
        >
          <span className="font-medium truncate max-w-[140px]">
            {currentRoleInfo.label}
          </span>
          <ChevronDown className="h-4 w-4 text-[#94A3B8] shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[280px] rounded-xl p-1.5',
            'bg-[#0D1321] border border-[#1E293B]',
            'shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'
          )}
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
              Switch Role
            </p>
          </div>

          {ALL_ROLES.map((role) => {
            const info = ROLE_INFO[role];
            const isActive = role === currentRole;

            return (
              <DropdownMenu.Item
                key={role}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 cursor-pointer',
                  'outline-none transition-colors',
                  isActive
                    ? 'bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]'
                    : 'hover:bg-[#1A2332] border border-transparent'
                )}
                onSelect={() => setRole(role)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-[#00D4FF]' : 'text-[#F1F5F9]'
                      )}
                    >
                      {info.label}
                    </span>
                    {isActive && (
                      <Check className="h-3.5 w-3.5 text-[#00D4FF] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5 leading-tight">
                    {info.description}
                  </p>
                </div>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
