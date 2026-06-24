import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, Battery, Wrench, Monitor, Scale, Recycle, Settings } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { users } from '@/data/users';
import type { UserRole, DemoUser } from '@/types';
import type { LucideIcon } from 'lucide-react';

// ============================================================
// ROLE CARD METADATA
// ============================================================

interface RoleCardInfo {
  role: UserRole;
  label: string;
  userName: string;
  organization: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const ROLE_CARDS: RoleCardInfo[] = [
  {
    role: 'PUBLIC_VIEWER',
    label: 'Public Viewer',
    userName: 'Public QR User',
    organization: 'Public Access',
    description: 'Basic public passport data via QR code',
    icon: Shield,
    accentColor: 'text-[#94A3B8]',
    accentBg: 'rgba(148, 163, 184, 0.1)',
    accentBorder: 'rgba(148, 163, 184, 0.2)',
  },
  {
    role: 'ASSET_OWNER',
    label: 'Asset Owner',
    userName: 'Maja Kovač',
    organization: 'Adria Grid Storage d.o.o.',
    description: 'Full asset data, telemetry, compliance',
    icon: Battery,
    accentColor: 'text-[#00D4FF]',
    accentBg: 'rgba(0, 212, 255, 0.1)',
    accentBorder: 'rgba(0, 212, 255, 0.2)',
  },
  {
    role: 'RIMAC_SERVICE_ENGINEER',
    label: 'Service Engineer',
    userName: 'Ivan Horvat',
    organization: 'Rimac Energy Demo Operations',
    description: 'Detailed telemetry, service data, diagnostics',
    icon: Wrench,
    accentColor: 'text-[#34D399]',
    accentBg: 'rgba(52, 211, 153, 0.1)',
    accentBorder: 'rgba(52, 211, 153, 0.2)',
  },
  {
    role: 'ENT_PLATFORM_OPERATOR',
    label: 'Platform Operator',
    userName: 'Elena Marković',
    organization: 'Ericsson Nikola Tesla Platform Ops',
    description: 'Platform health, audit trail, system status',
    icon: Monitor,
    accentColor: 'text-[#F59E0B]',
    accentBg: 'rgba(245, 158, 11, 0.1)',
    accentBorder: 'rgba(245, 158, 11, 0.2)',
  },
  {
    role: 'REGULATOR',
    label: 'Regulator',
    userName: 'Sofia Weber',
    organization: 'EU Market Surveillance Demo Authority',
    description: 'Compliance matrix, audit trail, verification status',
    icon: Scale,
    accentColor: 'text-[#A78BFA]',
    accentBg: 'rgba(167, 139, 250, 0.1)',
    accentBorder: 'rgba(167, 139, 250, 0.2)',
  },
  {
    role: 'RECYCLER',
    label: 'Recycler',
    userName: 'Lukas Schneider',
    organization: 'Circular Battery Recovery GmbH',
    description: 'Chemistry, materials, recycling instructions',
    icon: Recycle,
    accentColor: 'text-[#34D399]',
    accentBg: 'rgba(52, 211, 153, 0.1)',
    accentBorder: 'rgba(52, 211, 153, 0.15)',
  },
  {
    role: 'ADMIN',
    label: 'Admin',
    userName: 'Admin Demo',
    organization: 'Ericsson Nikola Tesla Platform Ops',
    description: 'Full access to all data and admin functions',
    icon: Settings,
    accentColor: 'text-[#EF4444]',
    accentBg: 'rgba(239, 68, 68, 0.1)',
    accentBorder: 'rgba(239, 68, 68, 0.2)',
  },
];

// ============================================================
// LOGIN PAGE COMPONENT
// ============================================================

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useRole();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    const user: DemoUser | undefined = users.find((u) => u.role === role);
    if (user) {
      login(user);
      // PUBLIC_VIEWER should go to public passport, not dashboard
      if (role === 'PUBLIC_VIEWER') {
        navigate('/public/passport/BP-HR-RE-SEST-2026-0001');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070B16] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-heading-1 text-[#F1F5F9] mb-3">
          Demo Login
        </h1>
        <p className="text-body text-[#94A3B8]">
          Select a role to explore the Battery Passport Platform
        </p>
      </div>

      {/* Role cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
        {ROLE_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.role}
              onClick={() => handleRoleSelect(card.role)}
              className="group flex flex-col items-start gap-3 rounded-xl p-5 text-left
                bg-[#0D1321] border border-[#1E293B]
                hover:border-[#334155] hover:bg-[#141B2D]
                focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:border-[#00D4FF]/30
                transition-all duration-200"
              aria-label={`Login as ${card.userName} (${card.label})`}
            >
              {/* Icon + Role label */}
              <div className="flex items-center gap-3 w-full">
                <div
                  className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0"
                  style={{
                    backgroundColor: card.accentBg,
                    border: `1px solid ${card.accentBorder}`,
                  }}
                >
                  <Icon className={`h-5 w-5 ${card.accentColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#F1F5F9] truncate">
                    {card.label}
                  </p>
                  <p className="text-xs text-[#64748B] truncate">
                    {card.organization}
                  </p>
                </div>
              </div>

              {/* User name */}
              <p className="text-sm text-[#94A3B8]">
                {card.userName}
              </p>

              {/* Description */}
              <p className="text-xs text-[#64748B] leading-relaxed">
                {card.description}
              </p>

              {/* Login button */}
              <div
                className="mt-auto pt-2 flex items-center gap-1.5 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ color: card.accentColor.includes('#') ? card.accentColor.match(/#[A-Fa-f0-9]+/)?.[0] : '#00D4FF' }}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login as {card.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-[#475569] text-center max-w-md">
        This is a demonstration environment. All data is synthetic and clearly marked as demo content.
      </p>
    </div>
  );
}
