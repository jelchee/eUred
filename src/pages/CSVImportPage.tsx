import { FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { DemoDisclaimer, DataSourceBadge } from '@/components/shared';
import { CSVImportWizard } from '@/components/domain';

/**
 * CSVImportPage — Page for importing battery asset data via CSV files.
 * Provides a multi-step wizard for uploading, validating, and importing
 * asset data in bulk.
 *
 * Access restricted to RIMAC_OPERATOR and ADMIN roles.
 *
 * @validates FR-DI-003 — CSV Data Import
 * @validates FR-DI-004 — Data Validation during import
 */
export function CSVImportPage() {
  const { hasPermission } = useRole();

  // Role guard — RIMAC_OPERATOR and ADMIN only
  if (!hasPermission('import_csv')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Access Restricted</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          CSV data import is available only to Rimac Operators and Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-heading-1 text-text-primary flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-accent-cyan" aria-hidden="true" />
            CSV Data Import
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Import battery asset data from CSV files — upload, validate, and review before committing.
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </header>

      {/* Demo disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* Data source & verification labels */}
      <div className="flex flex-wrap items-center gap-2">
        <DataSourceBadge source="CSV Demo Import" />
        <span className="text-[11px] text-amber-500/70 italic">
          Synthetic demo data — not externally verified
        </span>
      </div>

      {/* CSV Import Wizard */}
      <CSVImportWizard />
    </div>
  );
}
