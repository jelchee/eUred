import { useMemo, useState } from 'react';
import { ShieldCheck, ClipboardList } from 'lucide-react';
import { DemoDisclaimer } from '@/components/shared';
import {
  PassportReadinessGauge,
  ComplianceGapTable,
  ComplianceReviewPanel,
  RoleAccessBanner,
} from '@/components/domain';
import { useAssets } from '@/hooks/useAssets';
import { useCompliance } from '@/hooks/useCompliance';
import { usePassportAttributes } from '@/hooks/usePassportAttributes';
import { useRole } from '@/hooks/useRole';
import { useAppStore } from '@/store';
import { cn } from '@/lib/cn';
import type { PassportSection } from '@/types';

// ============================================================
// SECTION FILTER OPTIONS
// ============================================================

const ALL_SECTIONS: PassportSection[] = [
  'Identity',
  'Manufacturer',
  'Technical',
  'Chemistry',
  'Carbon Footprint',
  'Recycled Content',
  'Performance',
  'State of Health',
  'Due Diligence',
  'Safety',
  'End of Life',
  'Documents',
  'Audit',
];

// ============================================================
// PER-ASSET COMPLIANCE PANEL
// ============================================================

interface AssetCompliancePanelProps {
  assetId: string;
  passportId: string;
  assetLabel: string;
}

function AssetCompliancePanel({
  assetId,
  passportId,
  assetLabel,
}: AssetCompliancePanelProps) {
  const { score, level, totalRequired, providedCount, verifiedCount, missingCount } =
    useCompliance(passportId);
  const { visible } = usePassportAttributes(passportId);

  const [sectionFilter, setSectionFilter] = useState<PassportSection | 'all'>('all');

  // Filter attributes by section if selected
  const filteredAttributes = useMemo(() => {
    if (sectionFilter === 'all') return visible;
    return visible.filter((attr) => attr.section === sectionFilter);
  }, [visible, sectionFilter]);

  // Available sections for this asset
  const availableSections = useMemo(() => {
    const sections = new Set(visible.map((attr) => attr.section));
    return ALL_SECTIONS.filter((s) => sections.has(s));
  }, [visible]);

  const handleCreateTask = (attributeId: string) => {
    // In demo mode, show a brief notification / no-op
    // A real implementation would create a task in the store
    console.log(`[Demo] Create task for attribute: ${attributeId} on asset: ${assetId}`);
  };

  return (
    <section
      aria-label={`Compliance for ${assetLabel}`}
      className="card p-card-padding space-y-6"
    >
      {/* Header with gauge and summary */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Gauge */}
        <div className="shrink-0">
          <PassportReadinessGauge
            score={score}
            label={assetLabel}
            size="md"
            showSegments
          />
        </div>

        {/* Summary stats */}
        <div className="flex-1 space-y-3">
          <h3 className="text-heading-3 text-text-primary">{assetLabel}</h3>
          <p className="text-body text-text-secondary">
            Passport ID:{' '}
            <span className="font-mono text-text-primary">{passportId}</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            <StatBlock label="Total Required" value={totalRequired} />
            <StatBlock label="Provided" value={providedCount} color="text-cyan-400" />
            <StatBlock label="Verified" value={verifiedCount} color="text-emerald-400" />
            <StatBlock label="Missing" value={missingCount} color="text-red-400" />
          </div>

          {/* Compliance level badge */}
          <div className="mt-2">
            <ComplianceLevelBadge level={level} score={score} />
          </div>
        </div>
      </div>

      {/* Section filter */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by passport section">
        <button
          type="button"
          onClick={() => setSectionFilter('all')}
          aria-pressed={sectionFilter === 'all'}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-button border transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan',
            sectionFilter === 'all'
              ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40'
              : 'text-text-secondary hover:text-text-primary hover:bg-background-surface border-border'
          )}
        >
          All Sections
        </button>
        {availableSections.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setSectionFilter(section)}
            aria-pressed={sectionFilter === section}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-button border transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan',
              sectionFilter === section
                ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-surface border-border'
            )}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Compliance Gap Table */}
      <ComplianceGapTable
        attributes={filteredAttributes}
        onCreateTask={handleCreateTask}
        showConfidence
      />
    </section>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StatBlock({
  label,
  value,
  color = 'text-text-primary',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-text-tertiary uppercase tracking-wide">
        {label}
      </span>
      <span className={cn('text-lg font-semibold tabular-nums', color)}>
        {value}
      </span>
    </div>
  );
}

function ComplianceLevelBadge({ level, score }: { level: string; score: number }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    critical_gaps: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Critical Gaps' },
    needs_attention: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Needs Attention' },
    nearly_ready: { bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-400', label: 'Nearly Ready' },
    passport_ready: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Passport Ready' },
  };

  const c = config[level] ?? config.critical_gaps;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
        c.bg,
        c.text
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {c.label} — {score.toFixed(1)}%
    </span>
  );
}

// ============================================================
// COMPLIANCE PAGE
// ============================================================

/**
 * CompliancePage — Shows overall compliance score per asset with full
 * attribute gap analysis, section filtering, and task creation.
 *
 * Displays all 3 demo assets in separate sections with individual
 * PassportReadinessGauge, ComplianceGapTable, and "Create Task" actions.
 *
 * When the current user has the review_compliance permission (RIMAC_COMPLIANCE_MANAGER),
 * the page also renders a ComplianceReviewPanel with pending items.
 *
 * @validates FR-004 — Compliance Gap Analyzer
 * @validates FR-DI-009 — Compliance Review
 */
export function CompliancePage() {
  const { assets } = useAssets();
  const { hasPermission } = useRole();
  const reviewQueue = useAppStore((s) => s.reviewQueue);
  const selectedAssetId = useAppStore((s) => s.selectedAssetId);

  const canReview = hasPermission('review_compliance');

  // Count pending review items across all assets
  const pendingReviewCount = useMemo(
    () => reviewQueue.filter((item) => item.status === 'pending_review').length,
    [reviewQueue]
  );

  // Determine which asset to show in the review panel — use the selected asset or default to first
  const reviewAssetId = selectedAssetId ?? assets[0]?.assetId ?? '';

  return (
    <div className="space-y-6">
      {/* Role access context */}
      <RoleAccessBanner />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-1 text-text-primary flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-cyan-400" aria-hidden="true" />
            Compliance Gap Analyzer
            {canReview && pendingReviewCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                {pendingReviewCount} pending review
              </span>
            )}
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Passport attribute readiness and verification status across all assets
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </div>

      {/* Demo score disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* Per-asset compliance panels */}
      {assets.map((asset) => (
        <AssetCompliancePanel
          key={asset.assetId}
          assetId={asset.assetId}
          passportId={asset.passportId}
          assetLabel={`${asset.model} — ${asset.location.city}`}
        />
      ))}

      {/* Compliance Review Panel — only for RIMAC_COMPLIANCE_MANAGER role */}
      {canReview && reviewAssetId && (
        <section aria-label="Compliance review queue" className="card p-card-padding">
          <ComplianceReviewPanel assetId={reviewAssetId} />
        </section>
      )}
    </div>
  );
}

export default CompliancePage;
