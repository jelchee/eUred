import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Table2,
  ClipboardCheck,
  PartyPopper,
  Copy,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  XCircle,
  CheckCircle,
  MinusCircle,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import { validateCSVImport } from '@/lib/csvValidator';
import {
  csvColumnDefinitions,
  demoCSVContent,
} from '@/data/csvTemplates';
import type { CSVRow, CSVValidationResult, ImportResult, ImportStep } from '@/types/dataIngestion';
import type { Asset } from '@/types/asset';

export interface CSVImportWizardProps {
  className?: string;
}

const STEPS: { key: ImportStep; label: string; icon: React.ElementType }[] = [
  { key: 'template', label: 'Template', icon: FileSpreadsheet },
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'validate', label: 'Validate', icon: CheckCircle2 },
  { key: 'preview', label: 'Preview', icon: Table2 },
  { key: 'confirm', label: 'Confirm', icon: ClipboardCheck },
  { key: 'complete', label: 'Complete', icon: PartyPopper },
];

// Template CSV header for copy-to-clipboard
const TEMPLATE_CSV = csvColumnDefinitions.map((c) => c.name).join(',');

/**
 * CSVImportWizard — 6-step wizard for bulk CSV asset import.
 * Steps: Template → Upload → Validate → Preview → Confirm → Complete
 *
 * Validates: Requirements FR-DI-003, FR-DI-004, FR-DI-014
 */
export function CSVImportWizard({ className }: CSVImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('template');
  const [csvContent, setCsvContent] = useState('');
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const assets = useAppStore((s) => s.assets);
  const startCSVImport = useAppStore((s) => s.startCSVImport);
  const completeCSVImport = useAppStore((s) => s.completeCSVImport);
  const resetCSVImport = useAppStore((s) => s.resetCSVImport);

  const existingAssetIds = useMemo(() => assets.map((a) => a.assetId), [assets]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Navigation helpers
  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  }, [currentStepIndex]);

  const goBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  }, [currentStepIndex]);

  // Copy template to clipboard
  const handleCopyTemplate = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(TEMPLATE_CSV);
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    } catch {
      // Fallback: ignore clipboard errors in non-secure contexts
    }
  }, []);

  // Load demo data into textarea
  const handleLoadDemo = useCallback(() => {
    setCsvContent(demoCSVContent);
    setCurrentStep('upload');
  }, []);

  // Validate CSV content
  const handleValidate = useCallback(() => {
    const result = validateCSVImport(csvContent, existingAssetIds);
    setValidationResult(result);
    // Pre-select all valid and warning rows
    const selectableRows = new Set<number>([
      ...result.validRows.map((r) => r.rowNumber),
      ...result.warningRows.map((r) => r.rowNumber),
    ]);
    setSelectedRows(selectableRows);
    goNext();
  }, [csvContent, existingAssetIds, goNext]);

  // Toggle row selection in preview
  const toggleRow = useCallback((rowNumber: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  }, []);

  // Get importable rows (selected valid + warning rows)
  const importableRows = useMemo(() => {
    if (!validationResult) return [];
    const all = [...validationResult.validRows, ...validationResult.warningRows];
    return all.filter((r) => selectedRows.has(r.rowNumber));
  }, [validationResult, selectedRows]);

  // Execute import
  const handleImport = useCallback(() => {
    startCSVImport(importableRows);

    // Create mock assets from the importable rows
    const importedAssets: Asset[] = importableRows.map((row) => ({
      assetId: row.data['asset_id'] ?? '',
      passportId: `PP-${row.data['asset_id'] ?? ''}`,
      model: row.data['product_family'] ?? '',
      serialNumber: row.data['serial_number'] ?? '',
      owner: 'Rimac Energy',
      operator: 'Rimac Energy',
      location: {
        siteName: row.data['manufacturing_site'] ?? '',
        city: row.data['location']?.split(' ')[0] ?? '',
        country: row.data['location']?.split(' ').slice(1).join(' ') ?? '',
        lat: 45.8,
        lng: 15.97,
      },
      nominalEnergyKWh: Number(row.data['capacity_kwh']) || 0,
      usableEnergyKWh: (Number(row.data['capacity_kwh']) || 0) * 0.95,
      ratedPowerKVA: (Number(row.data['capacity_kwh']) || 0) * 0.5,
      outputVoltage: '800V DC',
      chemistry: (row.data['chemistry'] as Asset['chemistry']) ?? 'LFP',
      commissioningDate: row.data['manufacturing_date'] ?? null,
      status: 'Pre-commissioning' as const,
      complianceStatus: 'needs_attention' as const,
      complianceScorePct: 45,
      dataQualityScorePct: 60,
      connectivityStatus: 'pending' as const,
      alarmStatus: 'normal' as const,
    }));

    const result: ImportResult = {
      totalRows: validationResult?.totalRows ?? 0,
      successCount: importableRows.filter((r) => r.status === 'valid').length,
      warningCount: importableRows.filter((r) => r.status === 'warning').length,
      errorCount: validationResult?.errorRows.length ?? 0,
      duplicateCount: validationResult?.duplicateRows.length ?? 0,
      importedAssets,
      auditEventId: `AUD-CSV-${Date.now()}`,
    };

    completeCSVImport(result);
    setImportResult(result);
    setCurrentStep('complete');
  }, [importableRows, validationResult, startCSVImport, completeCSVImport]);

  // Reset wizard
  const handleReset = useCallback(() => {
    setCsvContent('');
    setValidationResult(null);
    setSelectedRows(new Set());
    setImportResult(null);
    setCurrentStep('template');
    resetCSVImport();
  }, [resetCSVImport]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Indicator */}
      <nav aria-label="Import wizard progress" className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          return (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  isActive && 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
                  isCompleted && 'bg-emerald-500/10 text-emerald-400',
                  !isActive && !isCompleted && 'text-slate-500'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {step.label}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-4 h-px mx-1',
                    isCompleted ? 'bg-emerald-500/50' : 'bg-slate-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Step Content */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        {/* Step 1: Template */}
        {currentStep === 'template' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">CSV Template</h3>
              <p className="text-sm text-text-tertiary mt-1">
                Use this template to prepare your battery asset data for import.
              </p>
            </div>

            {/* Column definitions table */}
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm" role="grid">
                <thead className="bg-slate-800/80 text-slate-300 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Column</th>
                    <th className="px-4 py-2.5 text-left font-medium">Required</th>
                    <th className="px-4 py-2.5 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {csvColumnDefinitions.map((col) => (
                    <tr key={col.name} className="bg-slate-900/50">
                      <td className="px-4 py-2 text-cyan-300 font-mono text-xs">{col.name}</td>
                      <td className="px-4 py-2">
                        {col.required ? (
                          <span className="text-emerald-400 text-xs">Yes</span>
                        ) : (
                          <span className="text-slate-500 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-300 text-xs">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Example CSV */}
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">Example CSV</h4>
              <pre className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 overflow-x-auto whitespace-pre">
                {demoCSVContent}
              </pre>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopyTemplate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copiedTemplate ? 'Copied!' : 'Copy Template'}
              </button>
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
              >
                <Database className="h-4 w-4" aria-hidden="true" />
                Load Demo Data
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload */}
        {currentStep === 'upload' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Paste CSV Data</h3>
              <p className="text-sm text-text-tertiary mt-1">
                Paste your CSV content below or load the demo dataset.
              </p>
            </div>

            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste CSV content here..."
              aria-label="CSV content input"
              rows={12}
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCsvContent(demoCSVContent)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
              >
                <Database className="h-4 w-4" aria-hidden="true" />
                Load Demo CSV
              </button>
              {csvContent && (
                <span className="text-xs text-slate-400">
                  {csvContent.split('\n').filter((l) => l.trim()).length - 1} data rows detected
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Validate */}
        {currentStep === 'validate' && validationResult && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Validation Results</h3>
              <p className="text-sm text-text-tertiary mt-1">
                CSV parsed and validated against schema rules.
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <SummaryCard label="Total Rows" count={validationResult.totalRows} color="slate" />
              <SummaryCard label="Valid" count={validationResult.validRows.length} color="emerald" />
              <SummaryCard label="Warnings" count={validationResult.warningRows.length} color="amber" />
              <SummaryCard label="Errors" count={validationResult.errorRows.length} color="red" />
              <SummaryCard label="Duplicates" count={validationResult.duplicateRows.length} color="slate" />
            </div>

            {/* Header errors */}
            {validationResult.headerErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm font-medium text-red-400 mb-1">Header Errors</p>
                {validationResult.headerErrors.map((err, i) => (
                  <p key={i} className="text-xs text-red-300">{err}</p>
                ))}
              </div>
            )}

            {/* Row-by-row status */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[
                ...validationResult.validRows,
                ...validationResult.warningRows,
                ...validationResult.errorRows,
                ...validationResult.duplicateRows,
              ]
                .sort((a, b) => a.rowNumber - b.rowNumber)
                .map((row) => (
                  <RowStatusIndicator key={row.rowNumber} row={row} />
                ))}
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 'preview' && validationResult && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Preview Import</h3>
              <p className="text-sm text-text-tertiary mt-1">
                Review rows to import. Deselect any rows you wish to exclude.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm" role="grid">
                <thead className="bg-slate-800/80 text-slate-300 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">Select</th>
                    <th className="px-3 py-2.5 text-left font-medium">Row</th>
                    <th className="px-3 py-2.5 text-left font-medium">Status</th>
                    <th className="px-3 py-2.5 text-left font-medium">Asset ID</th>
                    <th className="px-3 py-2.5 text-left font-medium">Serial</th>
                    <th className="px-3 py-2.5 text-left font-medium">Chemistry</th>
                    <th className="px-3 py-2.5 text-left font-medium">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {[
                    ...validationResult.validRows,
                    ...validationResult.warningRows,
                    ...validationResult.errorRows,
                    ...validationResult.duplicateRows,
                  ]
                    .sort((a, b) => a.rowNumber - b.rowNumber)
                    .map((row) => {
                      const isSelectable = row.status === 'valid' || row.status === 'warning';
                      const isSelected = selectedRows.has(row.rowNumber);
                      return (
                        <tr
                          key={row.rowNumber}
                          className={cn(
                            'transition-colors',
                            row.status === 'valid' && 'bg-emerald-500/5',
                            row.status === 'warning' && 'bg-amber-500/5',
                            row.status === 'error' && 'bg-red-500/5 opacity-60',
                            row.status === 'duplicate' && 'bg-slate-500/5 opacity-60'
                          )}
                        >
                          <td className="px-3 py-2">
                            {isSelectable ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRow(row.rowNumber)}
                                aria-label={`Select row ${row.rowNumber}`}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                              />
                            ) : (
                              <MinusCircle className="h-4 w-4 text-slate-600" aria-hidden="true" />
                            )}
                          </td>

                          <td className="px-3 py-2 text-slate-400 text-xs">{row.rowNumber}</td>
                          <td className="px-3 py-2">
                            <StatusPill status={row.status} />
                          </td>
                          <td className="px-3 py-2 text-slate-200 font-mono text-xs">
                            {row.data['asset_id'] ?? '—'}
                          </td>
                          <td className="px-3 py-2 text-slate-300 text-xs">
                            {row.data['serial_number'] ?? '—'}
                          </td>
                          <td className="px-3 py-2 text-slate-300 text-xs">
                            {row.data['chemistry'] ?? '—'}
                          </td>
                          <td className="px-3 py-2 text-slate-300 text-xs">
                            {row.data['capacity_kwh'] ?? '—'} kWh
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400">
              {importableRows.length} row(s) selected for import
            </p>
          </div>
        )}

        {/* Step 5: Confirm */}
        {currentStep === 'confirm' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Confirm Import</h3>
              <p className="text-sm text-text-tertiary mt-1">
                Review and confirm the import operation.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20 space-y-3">
              <p className="text-base font-medium text-cyan-300">
                {importableRows.length} asset(s) will be imported
              </p>
              <ul className="space-y-1.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  {importableRows.length} battery asset records will be created
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  Digital passports will be generated for each asset
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  A batch audit event will be recorded
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors text-sm"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import
              </button>
              <button
                onClick={goBack}
                className="px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Complete */}
        {currentStep === 'complete' && importResult && (
          <div className="space-y-5 text-center py-4">
            <PartyPopper className="h-12 w-12 text-emerald-400 mx-auto" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Import Successful</h3>
              <p className="text-sm text-text-tertiary mt-1">
                {importResult.successCount + importResult.warningCount} asset(s) imported successfully.
              </p>
            </div>

            <div className="inline-flex flex-col gap-2 text-left p-4 rounded-lg bg-slate-800 border border-slate-700 text-sm">
              <p className="text-emerald-400">✓ {importResult.successCount} valid assets created</p>
              {importResult.warningCount > 0 && (
                <p className="text-amber-400">⚠ {importResult.warningCount} assets with warnings</p>
              )}
              <p className="text-slate-400 text-xs">Audit Event: {importResult.auditEventId}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Link
                to="/assets"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
              >
                View Asset Registry
              </Link>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                Import More
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 'complete' && (
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          {currentStep === 'template' && (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
            >
              Next: Upload
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {currentStep === 'upload' && (
            <button
              onClick={handleValidate}
              disabled={!csvContent.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next: Validate
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {currentStep === 'validate' && (
            <button
              onClick={goNext}
              disabled={!validationResult || (validationResult.validRows.length === 0 && validationResult.warningRows.length === 0)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next: Preview
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {currentStep === 'preview' && (
            <button
              onClick={goNext}
              disabled={importableRows.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next: Confirm
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {currentStep === 'confirm' && (
            <div /> /* Empty spacer — confirm step has its own import button */
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function SummaryCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
    slate: 'text-slate-300 bg-slate-700/50 border-slate-600',
  };
  return (
    <div className={cn('p-3 rounded-lg border text-center', colorMap[color] ?? colorMap.slate)}>
      <p className="text-xl font-bold">{count}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: CSVRow['status'] }) {
  const config: Record<CSVRow['status'], { icon: React.ElementType; label: string; cls: string }> = {
    valid: { icon: CheckCircle, label: 'Valid', cls: 'text-emerald-400 bg-emerald-500/10' },
    warning: { icon: AlertTriangle, label: 'Warning', cls: 'text-amber-400 bg-amber-500/10' },
    error: { icon: XCircle, label: 'Error', cls: 'text-red-400 bg-red-500/10' },
    duplicate: { icon: MinusCircle, label: 'Duplicate', cls: 'text-slate-400 bg-slate-500/10' },
  };
  const { icon: Icon, label, cls } = config[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', cls)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

function RowStatusIndicator({ row }: { row: CSVRow }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-2.5 rounded-lg border text-xs',
        row.status === 'valid' && 'border-emerald-500/20 bg-emerald-500/5',
        row.status === 'warning' && 'border-amber-500/20 bg-amber-500/5',
        row.status === 'error' && 'border-red-500/20 bg-red-500/5',
        row.status === 'duplicate' && 'border-slate-600 bg-slate-800/50'
      )}
    >
      <StatusPill status={row.status} />
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 font-medium">
          Row {row.rowNumber}: {row.data['asset_id'] ?? 'Unknown'}
        </p>
        {row.errors.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-red-300">
            {row.errors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        )}
        {row.warnings.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-amber-300">
            {row.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
