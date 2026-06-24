import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck, Download, AlertTriangle, ShieldAlert, Send } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { usePassportAttributes } from '@/hooks/usePassportAttributes';
import { useCompliance } from '@/hooks/useCompliance';
import { useRole } from '@/hooks/useRole';
import { RestrictedDataPlaceholder, DemoDisclaimer } from '@/components/shared';
import {
  PassportReadinessGauge,
  PassportAttributeRow,
  PassportCompletenessCard,
  QRCodePanel,
  RoleAccessBanner,
  CarbonFootprintBreakdown,
  RecycledContentBarList,
} from '@/components/domain';
import { ROLE_ACCESS_MAP } from '@/lib/permissions';
import { exportPassportJSON } from '@/lib/exportService';
import {
  getCarbonFootprintByAssetId,
  getRecycledContentByAssetId,
  getDueDiligenceByAssetId,
} from '@/data/esgData';
import type { DueDiligenceSummary } from '@/data/esgData';
import type { AccessLevel, UserRole, PassportSection, ConfidenceLevel } from '@/types';

// ============================================================
// HELPERS
// ============================================================

/**
 * Given an access level, returns the list of roles that can view it.
 */
function getRolesForAccessLevel(accessLevel: AccessLevel): UserRole[] {
  const roles: UserRole[] = [];
  for (const [role, levels] of Object.entries(ROLE_ACCESS_MAP)) {
    if (levels.includes(accessLevel)) {
      roles.push(role as UserRole);
    }
  }
  return roles;
}

/**
 * Section display order matching the 13 passport sections from the spec.
 */
const SECTION_ORDER: PassportSection[] = [
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
// CONFIDENCE INDICATOR
// ============================================================

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; color: string; bg: string }> = {
  high: { label: 'High', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  low: { label: 'Low', color: 'text-red-400', bg: 'bg-red-400/10' },
};

function ConfidenceIndicator({ level }: { level: ConfidenceLevel }) {
  const config = CONFIDENCE_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.color} ${config.bg}`}
      aria-label={`Confidence: ${config.label}`}
    >
      <ShieldAlert className="w-3 h-3" aria-hidden="true" />
      {config.label} confidence
    </span>
  );
}

// ============================================================
// DUE DILIGENCE SUMMARY COMPONENT
// ============================================================

function DueDiligenceSummarySection({ data }: { data: DueDiligenceSummary }) {
  const ratio = data.supplierDeclarationsReceived / data.supplierDeclarationsRequired;
  const ratioColor = ratio >= 0.8 ? 'text-emerald-400' : ratio >= 0.5 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-3">
      {/* Declaration count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">Supplier Declarations</span>
        <span className={`font-mono text-sm font-semibold tabular-nums ${ratioColor}`}>
          {data.supplierDeclarationsReceived} / {data.supplierDeclarationsRequired}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${
            ratio >= 0.8 ? 'bg-emerald-400' : ratio >= 0.5 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>

      {/* High-risk materials */}
      <div>
        <span className="text-xs text-slate-400">High-risk materials:</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {data.highRiskMaterials.map((material) => (
            <span
              key={material}
              className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300"
            >
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              {material}
            </span>
          ))}
        </div>
      </div>

      {/* Open actions and review date */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-500">Open actions</span>
          <p className="font-mono text-slate-200">{data.openSupplierActions}</p>
        </div>
        <div>
          <span className="text-slate-500">Last review</span>
          <p className="font-mono text-slate-200">{data.lastReviewDate}</p>
        </div>
      </div>

      {/* Confidence */}
      <ConfidenceIndicator level={data.confidence} />
    </div>
  );
}

// ============================================================
// NOT FOUND STATE
// ============================================================

function PassportNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <FileText className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
      <h1 className="text-heading-2 text-text-primary">Passport Not Found</h1>
      <p className="text-body text-text-secondary max-w-md text-center">
        The asset or passport you're looking for doesn't exist or you don't have access to view it.
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
// PASSPORT DETAIL PAGE
// ============================================================

/**
 * PassportDetailPage — Full digital battery passport view for a single asset.
 * Displays readiness gauge, attributes grouped by section, ESG carbon & recycled
 * content data, due diligence summary, restricted placeholders, and QR code sidebar.
 *
 * @validates FR-003 — Private Passport View with full lifecycle data by role
 * @validates FR-007 — ESG & Carbon Module with confidence indicators and disclaimer
 * @validates FR-009 — Role-based Access Control with restricted sections
 */
export function PassportDetailPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const { getAssetById } = useAssets();

  const asset = assetId ? getAssetById(assetId) : undefined;

  if (!asset) {
    return <PassportNotFound />;
  }

  const passportId = asset.passportId;

  return <PassportDetailContent assetId={asset.assetId} passportId={passportId} serialNumber={asset.serialNumber} />;
}

/**
 * Inner content component that uses hooks requiring a valid passportId.
 */
function PassportDetailContent({
  assetId,
  passportId,
  serialNumber,
}: {
  assetId: string;
  passportId: string;
  serialNumber: string;
}) {
  const { sections, restricted } = usePassportAttributes(passportId);
  const { score } = useCompliance(passportId);
  const { hasPermission } = useRole();

  // ESG data
  const carbonData = getCarbonFootprintByAssetId(assetId);
  const recycledContent = getRecycledContentByAssetId(assetId);
  const dueDiligence = getDueDiligenceByAssetId(assetId);

  // Group restricted attributes by section for display
  const restrictedBySection = new Map<PassportSection, { accessLevel: AccessLevel; count: number }>();
  for (const { item } of restricted) {
    const existing = restrictedBySection.get(item.section);
    if (existing) {
      existing.count += 1;
    } else {
      restrictedBySection.set(item.section, {
        accessLevel: item.accessLevel,
        count: 1,
      });
    }
  }

  // Create a map from section name to its visible attributes for quick lookup
  const visibleSectionMap = new Map(sections.map((s) => [s.section, s.attributes]));

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic passport data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Back link */}
      <Link
        to={`/assets/${assetId}`}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Asset Detail
      </Link>

      {/* Page header */}
      <header className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-accent-cyan shrink-0" aria-hidden="true" />
        <div>
          <h1 className="text-heading-1 text-text-primary">Digital Battery Passport</h1>
          <p className="text-body text-text-secondary mt-0.5">
            Passport ID: <span className="font-mono text-text-primary">{passportId}</span>
          </p>
        </div>
      </header>

      {/* Main layout: content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <main className="flex flex-col gap-6 min-w-0">
          {/* Readiness Gauge */}
          <section
            className="card p-6 flex justify-center"
            aria-label="Passport readiness score"
          >
            <PassportReadinessGauge score={score} size="lg" showSegments />
          </section>

          {/* Attribute Sections */}
          <div className="flex flex-col gap-4">
            {SECTION_ORDER.map((sectionName) => {
              const visibleAttributes = visibleSectionMap.get(sectionName);
              const restrictedInfo = restrictedBySection.get(sectionName);

              // Skip sections with nothing to show
              if (!visibleAttributes?.length && !restrictedInfo) {
                return null;
              }

              return (
                <section
                  key={sectionName}
                  className="card overflow-hidden"
                  aria-label={`${sectionName} section`}
                >
                  {/* Section header */}
                  <div className="px-4 py-3 border-b border-border bg-background-tertiary/30">
                    <h2 className="text-heading-3 text-text-primary">{sectionName}</h2>
                    {visibleAttributes && (
                      <p className="text-caption text-text-tertiary mt-0.5">
                        {visibleAttributes.length} attribute{visibleAttributes.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Visible attributes */}
                  {visibleAttributes && visibleAttributes.length > 0 && (
                    <div>
                      {visibleAttributes.map((attr) => (
                        <PassportAttributeRow
                          key={attr.attributeId}
                          attribute={attr}
                        />
                      ))}
                    </div>
                  )}

                  {/* Restricted placeholder for this section */}
                  {restrictedInfo && (
                    <div className="p-4">
                      <RestrictedDataPlaceholder
                        section={`${sectionName} (${restrictedInfo.count} restricted attribute${restrictedInfo.count !== 1 ? 's' : ''})`}
                        requiredRoles={getRolesForAccessLevel(restrictedInfo.accessLevel)}
                        message={`${restrictedInfo.count} attribute${restrictedInfo.count !== 1 ? 's' : ''} in this section require${restrictedInfo.count === 1 ? 's' : ''} elevated access.`}
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* ESG & CARBON DATA SECTION                                     */}
          {/* Validates FR-007 — ESG & Carbon Module                        */}
          {/* ============================================================ */}
          <section className="card overflow-hidden" aria-label="ESG and Carbon Data">
            <div className="px-4 py-3 border-b border-border bg-background-tertiary/30 flex items-center justify-between">
              <div>
                <h2 className="text-heading-3 text-text-primary">ESG & Carbon Data</h2>
                <p className="text-caption text-text-tertiary mt-0.5">
                  Carbon footprint, recycled content & due diligence
                </p>
              </div>
              <DemoDisclaimer variant="badge" />
            </div>

            <div className="p-5 space-y-8">
              {/* Demo disclaimer banner */}
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                <p className="text-xs text-amber-300">
                  <span className="font-medium">Demo values — not externally verified.</span>{' '}
                  All ESG data shown is synthetic and for demonstration purposes only.
                </p>
              </div>

              {/* Carbon Footprint Breakdown */}
              {carbonData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Carbon Footprint Breakdown
                    </h3>
                    <ConfidenceIndicator level={carbonData.confidence} />
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>
                      Carbon intensity:{' '}
                      <span className="font-mono text-slate-300">
                        {carbonData.carbonIntensityKgCO2ePerKWh} kgCO₂e/kWh
                      </span>
                    </span>
                    <span className="text-slate-600">|</span>
                    <span>
                      Verification:{' '}
                      <span className="capitalize text-slate-300">
                        {carbonData.verificationStatus.replace(/_/g, ' ')}
                      </span>
                    </span>
                  </div>
                  <CarbonFootprintBreakdown
                    data={carbonData.lifecycleBreakdown}
                    totalKgCO2e={carbonData.totalProductCarbonFootprintKgCO2e}
                  />
                </div>
              )}

              {/* Divider */}
              <hr className="border-border" />

              {/* Recycled Content */}
              {recycledContent.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Recycled Content
                    </h3>
                    <ConfidenceIndicator level="low" />
                  </div>
                  <RecycledContentBarList data={recycledContent} />
                </div>
              )}

              {/* Divider */}
              <hr className="border-border" />

              {/* Due Diligence Summary */}
              {dueDiligence && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Supply Chain Due Diligence
                  </h3>
                  <DueDiligenceSummarySection data={dueDiligence} />
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          {/* Passport Completeness Card — reactive score updates (FR-DI-010) */}
          <PassportCompletenessCard assetId={assetId} />

          <QRCodePanel passportId={passportId} serialNumber={serialNumber} />

          {/* Publish button — visible only with publish_passport permission */}
          {hasPermission('publish_passport') && (
            <Link
              to={`/assets/${assetId}/passport/publish`}
              className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              Publish Passport
            </Link>
          )}

          {/* Export button */}
          <button
            onClick={() => exportPassportJSON(passportId)}
            className="flex items-center justify-center gap-2 rounded-lg border border-accent-cyan/20 bg-accent-cyan/5 px-4 py-2.5 text-sm text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export Passport JSON
          </button>

          {/* Quick stats */}
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-medium text-text-primary">Passport Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-caption">
                <span className="text-text-secondary">Visible Sections</span>
                <span className="text-text-primary">{sections.length}</span>
              </div>
              <div className="flex justify-between text-caption">
                <span className="text-text-secondary">Restricted Sections</span>
                <span className="text-text-primary">{restrictedBySection.size}</span>
              </div>
              <div className="flex justify-between text-caption">
                <span className="text-text-secondary">Readiness Score</span>
                <span className="text-text-primary font-mono">{score.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
