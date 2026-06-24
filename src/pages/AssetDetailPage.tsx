import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ArrowRight,
  FileText,
  Activity,
  Clock,
  Shield,
  Battery,
  Zap,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { StatusBadge, KPICard, DemoDisclaimer } from '@/components/shared';
import { BatteryHealthCard, RoleAccessBanner } from '@/components/domain';

// ============================================================
// NOT FOUND STATE
// ============================================================

function AssetNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Battery className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
      <h1 className="text-heading-2 text-text-primary">Asset Not Found</h1>
      <p className="text-body text-text-secondary max-w-md text-center">
        The asset you're looking for doesn't exist or you don't have access to view it.
      </p>
      <Link
        to="/assets"
        className="mt-4 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-colors"
      >
        ← Back to Asset Registry
      </Link>
    </div>
  );
}

// ============================================================
// NAVIGATION LINKS
// ============================================================

interface NavLinkItem {
  label: string;
  path: string;
  icon: React.ElementType;
  description: string;
}

function SubPageNavigation({ assetId }: { assetId: string }) {
  const navLinks: NavLinkItem[] = [
    {
      label: 'Passport',
      path: `/assets/${assetId}/passport`,
      icon: FileText,
      description: 'Full digital battery passport with compliance data',
    },
    {
      label: 'Telemetry',
      path: `/assets/${assetId}/telemetry`,
      icon: Activity,
      description: 'BMS data, charts, SoC/SoH trends, and alarms',
    },
    {
      label: 'Timeline',
      path: `/assets/${assetId}/timeline`,
      icon: Clock,
      description: 'Lifecycle events from production to operation',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {navLinks.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            to={item.path}
            className="group card p-5 flex flex-col gap-3 hover:border-accent-cyan/30 hover:shadow-glow-cyan transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-accent-cyan/10">
                <Icon className="w-5 h-5 text-accent-cyan" aria-hidden="true" />
              </div>
              <ArrowRight
                className="w-4 h-4 text-text-tertiary group-hover:text-accent-cyan transition-colors"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-body font-semibold text-text-primary">
                {item.label}
              </span>
              <span className="text-caption text-text-secondary">
                {item.description}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ============================================================
// ASSET DETAIL PAGE
// ============================================================

/**
 * AssetDetailPage — Main detail view for a single BESS asset.
 * Displays header with status badges, KPI summary, navigation links,
 * and battery health card.
 *
 * @validates FR-001 — Asset Registry detail view
 * @validates FR-003 — Private Passport entry point
 */
export function AssetDetailPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const { getAssetById } = useAssets();

  const asset = assetId ? getAssetById(assetId) : undefined;

  if (!asset) {
    return <AssetNotFound />;
  }

  const telemetry = asset.latestTelemetry;

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic asset data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-heading-1 text-text-primary">{asset.model}</h1>
            <div className="flex items-center gap-2 text-body text-text-secondary">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {asset.location.siteName} · {asset.location.city},{' '}
                {asset.location.country}
              </span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={asset.complianceStatus}
              size="md"
              showIcon
            />
            <StatusBadge
              status={asset.connectivityStatus}
              size="md"
              showIcon
            />
            <StatusBadge
              status={asset.alarmStatus}
              size="md"
              showIcon
            />
          </div>
        </div>

        {/* Active warning banner */}
        {asset.activeWarning && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-sm text-amber-300">{asset.activeWarning}</span>
          </div>
        )}
      </header>

      {/* KPI Row */}
      <section aria-label="Key performance indicators">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            label="State of Charge"
            value={telemetry?.socPct != null ? telemetry.socPct : '—'}
            unit={telemetry?.socPct != null ? '%' : undefined}
            icon={Battery}
            variant="accent"
            accentColor="cyan"
          />
          <KPICard
            label="State of Health"
            value={telemetry?.sohPct != null ? telemetry.sohPct : '—'}
            unit={telemetry?.sohPct != null ? '%' : undefined}
            icon={Activity}
            variant="accent"
            accentColor="emerald"
          />
          <KPICard
            label="Equivalent Cycles"
            value={telemetry?.equivalentFullCycles ?? 0}
            icon={Zap}
            variant="accent"
            accentColor="cyan"
          />
          <KPICard
            label="30-day Availability"
            value={
              telemetry?.availability30dPct != null
                ? telemetry.availability30dPct
                : '—'
            }
            unit={telemetry?.availability30dPct != null ? '%' : undefined}
            icon={BarChart3}
            variant="accent"
            accentColor="emerald"
          />
          <KPICard
            label="Compliance Score"
            value={asset.complianceScorePct}
            unit="%"
            icon={CheckCircle2}
            variant="accent"
            accentColor={
              asset.complianceScorePct >= 90
                ? 'emerald'
                : asset.complianceScorePct >= 75
                  ? 'cyan'
                  : asset.complianceScorePct >= 50
                    ? 'amber'
                    : 'red'
            }
          />
        </div>
      </section>

      {/* Sub-page navigation */}
      <section aria-label="Asset sections">
        <h2 className="text-heading-3 text-text-primary mb-3">Explore</h2>
        <SubPageNavigation assetId={asset.assetId} />
      </section>

      {/* Battery Health Card */}
      <section aria-label="Battery health summary">
        <BatteryHealthCard asset={asset} />
      </section>
    </div>
  );
}
