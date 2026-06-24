import { useState, useMemo, useCallback } from 'react';
import { Send, FileUp, Plus, Minus, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import { createAuditEvent } from '@/lib/auditLogger';
import type { ObligationStatus, SupplierDeclaration } from '@/types/supplier';

export interface SupplierPortalViewProps {
  supplierId: string;
  className?: string;
}

/** Status badge color config */
const STATUS_COLORS: Record<ObligationStatus, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  submitted: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  under_review: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
  changes_requested: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

const STATUS_LABELS: Record<ObligationStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
};

/**
 * SupplierPortalView — Displays supplier obligations and allows declaration submission.
 *
 * Validates: Requirements FR-DI-007, FR-DI-014
 */
export function SupplierPortalView({ supplierId, className }: SupplierPortalViewProps) {
  const obligations = useAppStore((s) => s.obligations);
  const submitDeclaration = useAppStore((s) => s.submitDeclaration);

  const [activeObligationId, setActiveObligationId] = useState<string | null>(null);
  const [declarationType, setDeclarationType] = useState<'structured_data' | 'document_upload'>('structured_data');
  const [kvFields, setKvFields] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [documentName, setDocumentName] = useState('');

  // Filter obligations by supplier
  const supplierObligations = useMemo(
    () => obligations.filter((o) => o.supplierId === supplierId),
    [obligations, supplierId]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = supplierObligations.length;
    const pending = supplierObligations.filter((o) => o.status === 'pending').length;
    const submitted = supplierObligations.filter(
      (o) => o.status === 'submitted' || o.status === 'under_review'
    ).length;
    const approved = supplierObligations.filter((o) => o.status === 'approved').length;
    const rejected = supplierObligations.filter(
      (o) => o.status === 'rejected' || o.status === 'changes_requested'
    ).length;
    return { total, pending, submitted, approved, rejected };
  }, [supplierObligations]);

  const handleOpenForm = useCallback((obligationId: string) => {
    setActiveObligationId(obligationId);
    setDeclarationType('structured_data');
    setKvFields([{ key: '', value: '' }]);
    setDocumentName('');
  }, []);

  const handleCloseForm = useCallback(() => {
    setActiveObligationId(null);
  }, []);

  const addKvField = useCallback(() => {
    setKvFields((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const removeKvField = useCallback((index: number) => {
    setKvFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateKvField = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setKvFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!activeObligationId) return;

    const now = new Date().toISOString();
    const declarationId = `DECL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const declaration: SupplierDeclaration = {
      declarationId,
      obligationId: activeObligationId,
      type: declarationType,
      submittedBy: supplierId,
      submittedAt: now,
    };

    if (declarationType === 'structured_data') {
      const content: Record<string, unknown> = {};
      for (const field of kvFields) {
        if (field.key.trim()) {
          content[field.key.trim()] = field.value;
        }
      }
      declaration.content = content;
    } else {
      declaration.documentId = `DOC-${Date.now()}-${documentName.replace(/\s+/g, '-') || 'upload'}`;
    }

    submitDeclaration(declaration);

    // Create audit event for the submission
    createAuditEvent({
      action: 'SUPPLIER_DECLARATION_SUBMITTED',
      entityType: 'DOCUMENT',
      entityId: declarationId,
      actor: supplierId,
      actorRole: 'SUPPLIER_USER',
      reason: `Supplier declaration submitted for obligation ${activeObligationId}`,
      dataSource: 'manual',
      affectedFields: declarationType === 'structured_data'
        ? kvFields.filter((f) => f.key.trim()).map((f) => f.key.trim())
        : [documentName || 'document'],
    });

    setActiveObligationId(null);
  }, [activeObligationId, declarationType, kvFields, documentName, supplierId, submitDeclaration]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" count={stats.total} color="slate" />
        <StatCard label="Pending" count={stats.pending} color="amber" />
        <StatCard label="Submitted" count={stats.submitted} color="cyan" />
        <StatCard label="Approved" count={stats.approved} color="emerald" />
        <StatCard label="Rejected" count={stats.rejected} color="red" />
      </div>

      {/* Obligations Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Supplier obligations">
            <thead className="bg-slate-800/80 text-slate-300 text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Component</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Required Evidence</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Due Date</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {supplierObligations.map((obligation) => (
                <tr key={obligation.obligationId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium">{obligation.component}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-xs">
                    {obligation.requiredEvidence}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {obligation.dueDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                        STATUS_COLORS[obligation.status]
                      )}
                    >
                      {STATUS_LABELS[obligation.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(obligation.status === 'pending' || obligation.status === 'changes_requested') && (
                      <button
                        type="button"
                        onClick={() => handleOpenForm(obligation.obligationId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                        aria-label={`Submit declaration for ${obligation.component}`}
                      >
                        <Send className="h-3 w-3" aria-hidden="true" />
                        Submit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {supplierObligations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No obligations found for this supplier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reasons / Change Requests */}
      {supplierObligations.some(
        (o) => (o.status === 'rejected' || o.status === 'changes_requested') && o.rejectionReason
      ) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
            Rejection Reasons &amp; Change Requests
          </h4>
          {supplierObligations
            .filter((o) => (o.status === 'rejected' || o.status === 'changes_requested') && o.rejectionReason)
            .map((o) => (
              <div
                key={o.obligationId}
                className={cn(
                  'p-3 rounded-lg border text-sm',
                  o.status === 'rejected'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-200">{o.component}</span>
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border',
                      STATUS_COLORS[o.status]
                    )}
                  >
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <p className={cn(
                  'text-xs',
                  o.status === 'rejected' ? 'text-red-300' : 'text-amber-300'
                )}>
                  {o.rejectionReason}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Inline Submit Declaration Form */}
      {activeObligationId && (
        <div className="bg-slate-800/70 border border-cyan-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
              <Send className="h-4 w-4" aria-hidden="true" />
              Submit Declaration
            </h4>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-slate-400 hover:text-slate-200 text-xs"
              aria-label="Cancel submission"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Obligation: <span className="text-slate-200">{activeObligationId}</span>
          </p>

          {/* Type selector */}
          <div className="flex gap-3" role="radiogroup" aria-label="Declaration type">
            <button
              type="button"
              onClick={() => setDeclarationType('structured_data')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
                declarationType === 'structured_data'
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:border-slate-500'
              )}
              role="radio"
              aria-checked={declarationType === 'structured_data'}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Structured Data
            </button>
            <button
              type="button"
              onClick={() => setDeclarationType('document_upload')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
                declarationType === 'document_upload'
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:border-slate-500'
              )}
              role="radio"
              aria-checked={declarationType === 'document_upload'}
            >
              <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
              Document Upload
            </button>
          </div>

          {/* Structured Data - Key-Value fields */}
          {declarationType === 'structured_data' && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Data Fields</label>
              {kvFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateKvField(index, 'key', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    aria-label={`Field ${index + 1} key`}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => updateKvField(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    aria-label={`Field ${index + 1} value`}
                  />
                  {kvFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKvField(index)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      aria-label={`Remove field ${index + 1}`}
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addKvField}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                Add Field
              </button>
            </div>
          )}

          {/* Document Upload simulation */}
          {declarationType === 'document_upload' && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block" htmlFor="doc-name-input">
                Document Name (simulated upload)
              </label>
              <div className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <input
                  id="doc-name-input"
                  type="text"
                  placeholder="e.g., IP67_Certification.pdf"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <p className="text-xs text-slate-500">
                In production, this would be a file upload input. For this demo, enter a document name.
              </p>
            </div>
          )}

          {/* Submit button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                declarationType === 'structured_data'
                  ? !kvFields.some((f) => f.key.trim())
                  : !documentName.trim()
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Submit Declaration
            </button>
            <p className="text-xs text-slate-500">
              Status will be set to &ldquo;Under Review&rdquo; — never auto-approved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    slate: 'text-slate-300 bg-slate-700/50 border-slate-600',
  };
  return (
    <div className={cn('p-3 rounded-lg border text-center', colorMap[color] ?? colorMap.slate)}>
      <p className="text-xl font-bold">{count}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

export default SupplierPortalView;
