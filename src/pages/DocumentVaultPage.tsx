import { useState, useMemo } from 'react';
import { FileArchive, AlertTriangle, FileText, Info, Upload, X } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useRole } from '@/hooks/useRole';
import { DocumentVaultTable, RoleAccessBanner, DocumentUploadForm } from '@/components/domain';
import { DemoDisclaimer } from '@/components/shared';
import type { Document, AccessLevel } from '@/types';

// ============================================================
// ACCESS LEVEL LABELS
// ============================================================

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  PUBLIC: 'Public',
  ASSET_OWNER_ONLY: 'Asset Owner Only',
  ASSET_OWNER_AND_REGULATOR: 'Asset Owner & Regulator',
  REGULATOR_AND_ASSET_OWNER: 'Regulator & Asset Owner',
  SERVICE_AND_ABOVE: 'Service & Above',
  PLATFORM_OPERATOR: 'Platform Operator',
  ADMIN_ONLY: 'Admin Only',
};

const ACCESS_LEVEL_OPTIONS: AccessLevel[] = [
  'PUBLIC',
  'ASSET_OWNER_ONLY',
  'ASSET_OWNER_AND_REGULATOR',
  'REGULATOR_AND_ASSET_OWNER',
  'SERVICE_AND_ABOVE',
  'PLATFORM_OPERATOR',
  'ADMIN_ONLY',
];

// ============================================================
// DOCUMENT METADATA PANEL
// ============================================================

interface DocumentMetadataPanelProps {
  document: Document;
  onClose: () => void;
}

function isExpired(doc: Document): boolean {
  if (!doc.validUntil) return false;
  return new Date(doc.validUntil) < new Date();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function DocumentMetadataPanel({ document, onClose }: DocumentMetadataPanelProps) {
  const expired = isExpired(document);

  return (
    <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-5 w-5 text-accent-cyan shrink-0" aria-hidden="true" />
          <h3 className="text-sm font-medium text-text-primary truncate">
            {document.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors shrink-0"
          aria-label="Close metadata panel"
        >
          ✕
        </button>
      </div>

      {expired && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
          <span className="text-xs text-red-400">This document has expired</span>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-text-tertiary">Document ID</dt>
          <dd className="text-text-secondary font-mono">{document.documentId}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Version</dt>
          <dd className="text-text-secondary">{document.version}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Status</dt>
          <dd className={`capitalize ${expired ? 'text-red-400' : 'text-text-secondary'}`}>
            {document.status.replace(/_/g, ' ')}
          </dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Access Level</dt>
          <dd className="text-text-secondary">
            {ACCESS_LEVEL_LABELS[document.accessLevel]}
          </dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Uploaded By</dt>
          <dd className="text-text-secondary">{document.uploadedBy}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Uploaded At</dt>
          <dd className="text-text-secondary">{formatDate(document.uploadedAt)}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Valid From</dt>
          <dd className="text-text-secondary">{formatDate(document.validFrom)}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">Valid Until</dt>
          <dd className={`${expired ? 'text-red-400' : 'text-text-secondary'}`}>
            {formatDate(document.validUntil)}
          </dd>
        </div>
        {document.fileSize && (
          <div>
            <dt className="text-text-tertiary">File Size</dt>
            <dd className="text-text-secondary">{document.fileSize}</dd>
          </div>
        )}
        {document.mimeType && (
          <div>
            <dt className="text-text-tertiary">MIME Type</dt>
            <dd className="text-text-secondary font-mono">{document.mimeType}</dd>
          </div>
        )}
      </dl>

      {document.linkedAttributes.length > 0 && (
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-xs text-text-tertiary mb-1">Linked Attributes:</p>
          <div className="flex flex-wrap gap-1">
            {document.linkedAttributes.map((attr) => (
              <span
                key={attr}
                className="px-2 py-0.5 rounded-full text-[0.65rem] bg-slate-700/50 text-text-secondary"
              >
                {attr}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DOCUMENT VAULT PAGE
// ============================================================

/**
 * DocumentVaultPage — Global document vault showing all documents
 * across all assets, filtered by current user role.
 *
 * Features:
 * - DocumentVaultTable with all documents (global view, no assetId filter)
 * - Filters: type, status, access level
 * - Expired document highlighting
 * - Document metadata display on row click
 * - RoleAccessBanner showing current role context
 *
 * @validates FR-008 — Document Vault
 */
export function DocumentVaultPage() {
  const { visible, restricted, expiredCount } = useDocuments();
  const { hasPermission } = useRole();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [accessLevelFilter, setAccessLevelFilter] = useState<AccessLevel | 'all'>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const canUpload = hasPermission('upload_documents');

  // Apply access level filter on top of role-filtered docs
  const filteredDocuments = useMemo(() => {
    if (accessLevelFilter === 'all') return visible;
    return visible.filter((d) => d.accessLevel === accessLevelFilter);
  }, [visible, accessLevelFilter]);

  // Get unique access levels present in visible documents for the filter
  const availableAccessLevels = useMemo(() => {
    const levels = new Set(visible.map((d) => d.accessLevel));
    return ACCESS_LEVEL_OPTIONS.filter((l) => levels.has(l));
  }, [visible]);

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument((prev) => (prev?.documentId === doc.documentId ? null : doc));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic document data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-cyan/10">
            <FileArchive className="w-5 h-5 text-accent-cyan" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-heading-1 text-text-primary">Document Vault</h1>
            <p className="text-body text-text-secondary">
              All compliance documents, certifications, and reports across assets
            </p>
          </div>
        </div>

        {/* Document stats */}
        <div className="flex items-center gap-3">
          {canUpload && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 transition-colors"
              aria-label="Upload Document"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload Document
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <span className="text-xs text-text-tertiary">Total:</span>
            <span className="text-sm font-semibold text-text-primary tabular-nums">
              {visible.length}
            </span>
          </div>
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
              <span className="text-xs text-red-400">
                {expiredCount} expired
              </span>
            </div>
          )}
          {restricted.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-text-tertiary">Restricted:</span>
              <span className="text-sm font-semibold text-amber-400 tabular-nums">
                {restricted.length}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Access Level Filter — additional to DocumentVaultTable's built-in filters */}
      <div className="flex items-center gap-2">
        <label htmlFor="access-level-filter" className="text-xs text-text-secondary">
          Access Level:
        </label>
        <select
          id="access-level-filter"
          value={accessLevelFilter}
          onChange={(e) => setAccessLevelFilter(e.target.value as AccessLevel | 'all')}
          className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Access Levels</option>
          {availableAccessLevels.map((level) => (
            <option key={level} value={level}>
              {ACCESS_LEVEL_LABELS[level]}
            </option>
          ))}
        </select>
      </div>

      {/* Document Upload Form (slide-in panel) */}
      {showUploadForm && (
        <div className="relative rounded-lg bg-slate-800/60 border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-3 text-text-primary font-semibold">
              Upload Document
            </h2>
            <button
              onClick={() => setShowUploadForm(false)}
              className="text-text-tertiary hover:text-text-secondary transition-colors"
              aria-label="Close upload form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DocumentUploadForm
            onSave={() => setShowUploadForm(false)}
            onCancel={() => setShowUploadForm(false)}
          />
        </div>
      )}

      {/* Document metadata panel (if a document is selected) */}
      {selectedDocument && (
        <DocumentMetadataPanel
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Document Vault Table */}
      <section aria-label="Document vault table">
        <DocumentVaultTable
          documents={filteredDocuments}
          onDocumentClick={handleDocumentClick}
        />
      </section>

      {/* Demo disclaimer */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
        <Info className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-text-tertiary">
          Demo Mode — All documents shown are synthetic test data. In production, documents would
          be uploaded via authenticated API endpoints with audit trail logging.
        </p>
      </div>
    </div>
  );
}
