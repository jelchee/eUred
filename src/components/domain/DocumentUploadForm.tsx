import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { createAuditEvent } from '@/lib/auditLogger';
import { useAppStore } from '@/store';
import { assets } from '@/data/assets';
import { passportAttributes } from '@/data/passportAttributes';
import type { DocumentUpload, ExtendedDocumentType } from '@/types/workflow';
import type { DocumentType } from '@/types/document';
import type { VisibilityLevel } from '@/types/dataIngestion';

// ============================================================
// CONSTANTS
// ============================================================

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType | ExtendedDocumentType; label: string }[] = [
  { value: 'EU_DECLARATION_OF_CONFORMITY', label: 'EU Declaration of Conformity' },
  { value: 'SAFETY_INSTRUCTIONS', label: 'Safety Instructions' },
  { value: 'TRANSPORT_HANDLING_GUIDE', label: 'Transport & Handling Guide' },
  { value: 'RECYCLING_INSTRUCTIONS', label: 'Recycling Instructions' },
  { value: 'CARBON_FOOTPRINT_STATEMENT', label: 'Carbon Footprint Statement' },
  { value: 'SUPPLIER_DUE_DILIGENCE', label: 'Supplier Due Diligence' },
  { value: 'FACTORY_ACCEPTANCE_TEST', label: 'Factory Acceptance Test' },
  { value: 'COMMISSIONING_REPORT', label: 'Commissioning Report' },
  { value: 'SERVICE_REPORT', label: 'Service Report' },
  { value: 'FIRMWARE_RELEASE_NOTES', label: 'Firmware Release Notes' },
  { value: 'RECYCLED_CONTENT_DECLARATION', label: 'Recycled Content Declaration' },
  { value: 'SUPPLIER_DUE_DILIGENCE_STATEMENT', label: 'Supplier Due Diligence Statement' },
  { value: 'ORIGIN_DECLARATION', label: 'Origin Declaration' },
  { value: 'ROHS_REACH_DECLARATION', label: 'RoHS/REACH Declaration' },
  { value: 'MATERIAL_COMPOSITION_DECLARATION', label: 'Material Composition Declaration' },
  { value: 'BATTERY_CHEMISTRY_DECLARATION', label: 'Battery Chemistry Declaration' },
  { value: 'QUALITY_GATE_REPORT', label: 'Quality Gate Report' },
  { value: 'PERFORMANCE_TEST_REPORT', label: 'Performance Test Report' },
];

const VISIBILITY_OPTIONS: { value: VisibilityLevel; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Visible to all stakeholders' },
  { value: 'restricted', label: 'Restricted', description: 'Asset owner & regulators only' },
  { value: 'confidential', label: 'Confidential', description: 'Internal platform use only' },
];

const SIMULATED_FILE = {
  fileName: 'document.pdf',
  fileSize: '2.4MB',
  mimeType: 'application/pdf',
};

// ============================================================
// INTERFACES
// ============================================================

export interface DocumentUploadFormProps {
  assetId?: string;
  onSave: (upload: DocumentUpload) => void;
  onCancel: () => void;
  className?: string;
}

// ============================================================
// HELPER
// ============================================================

function generateUploadId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `DOC-UPL-${timestamp}-${random}`;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * DocumentUploadForm — Upload and link documents to assets and passport attributes.
 * Supports document type selection, visibility classification, and simulated file attachment.
 *
 * @validates FR-DI-008 — Document upload and linking
 * @validates FR-DI-014 — Visibility classification
 * @validates FR-DI-015 — Audit trail generation
 */
export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  assetId,
  onSave,
  onCancel,
  className,
}) => {
  const addToReviewQueue = useAppStore((s) => s.addToReviewQueue);

  // Form state
  const [documentType, setDocumentType] = useState<DocumentType | ExtendedDocumentType | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkedAssetId, setLinkedAssetId] = useState(assetId ?? '');
  const [linkedAttributes, setLinkedAttributes] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<VisibilityLevel>('restricted');
  const [fileSelected, setFileSelected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Available passport attributes for the selected asset
  const availableAttributes = useMemo(() => {
    if (!linkedAssetId) return [];
    const attrs = passportAttributes.filter(
      (attr) =>
        attr.passportId === linkedAssetId ||
        assets.some((a) => a.assetId === linkedAssetId && a.passportId === attr.passportId),
    );
    // Deduplicate by attributeId
    const seen = new Set<string>();
    return attrs.filter((a) => {
      if (seen.has(a.attributeId)) return false;
      seen.add(a.attributeId);
      return true;
    });
  }, [linkedAssetId]);

  const handleAttributeToggle = useCallback((attributeId: string) => {
    setLinkedAttributes((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId],
    );
  }, []);

  const handleFileSelect = useCallback(() => {
    setFileSelected(true);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFileSelected(false);
  }, []);

  const isFormValid = useMemo(() => {
    return (
      documentType !== '' &&
      title.trim() !== '' &&
      linkedAssetId !== '' &&
      fileSelected
    );
  }, [documentType, title, linkedAssetId, fileSelected]);

  const handleSave = useCallback(() => {
    if (!isFormValid || documentType === '') return;

    const uploadId = generateUploadId();
    const now = new Date().toISOString();

    const upload: DocumentUpload = {
      uploadId,
      documentType,
      title: title.trim(),
      description: description.trim(),
      linkedAssetId,
      linkedPassportAttributes: linkedAttributes,
      visibility,
      status: 'uploaded',
      uploadedBy: 'current-user',
      uploadedAt: now,
      fileSimulation: SIMULATED_FILE,
      reviewStatus: 'pending_review',
    };

    // Create audit event
    createAuditEvent({
      action: 'DOCUMENT_LINKED',
      entityType: 'DOCUMENT',
      entityId: uploadId,
      actor: 'current-user',
      actorRole: 'RIMAC_OPERATOR',
      reason: `Document uploaded: ${title.trim()}`,
      dataSource: 'manual',
      affectedFields: ['documentType', 'title', 'linkedAssetId', 'visibility'],
      visibility,
    });

    // Add to review queue
    addToReviewQueue({
      itemId: uploadId,
      type: 'document',
      title: title.trim(),
      submittedBy: 'current-user',
      submittedAt: now,
      source: 'manual',
      status: 'pending_review',
      content: {
        documentType,
        linkedAssetId,
        visibility,
        fileName: SIMULATED_FILE.fileName,
      },
      linkedDocumentId: uploadId,
      reviewHistory: [],
    });

    // Notify parent
    onSave(upload);

    // Show success briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [
    isFormValid,
    documentType,
    title,
    description,
    linkedAssetId,
    linkedAttributes,
    visibility,
    addToReviewQueue,
    onSave,
  ]);

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        noValidate
        className="space-y-6"
      >
        {/* Document Type */}
        <fieldset className="card p-6 space-y-4">
          <legend className="text-heading-3 text-text-primary font-semibold px-1">
            Document Details
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Type Dropdown */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="doc-type"
                className="text-sm font-medium text-text-secondary"
              >
                Document Type <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <select
                id="doc-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType | ExtendedDocumentType)}
                className={cn(
                  'w-full rounded-lg border bg-navy-800 px-3 py-2 text-sm text-text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500',
                  'transition-colors border-border hover:border-text-tertiary',
                )}
                aria-required="true"
              >
                <option value="" disabled>
                  Select document type…
                </option>
                {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="doc-title"
                className="text-sm font-medium text-text-secondary"
              >
                Title <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <input
                id="doc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. EU DoC for SineStack SE-868"
                className={cn(
                  'w-full rounded-lg border bg-navy-800 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500',
                  'transition-colors border-border hover:border-text-tertiary',
                )}
                aria-required="true"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="doc-description"
                className="text-sm font-medium text-text-secondary"
              >
                Description
              </label>
              <textarea
                id="doc-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of the document contents…"
                rows={3}
                className={cn(
                  'w-full rounded-lg border bg-navy-800 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500',
                  'transition-colors border-border hover:border-text-tertiary resize-none',
                )}
              />
            </div>
          </div>
        </fieldset>

        {/* Linking */}
        <fieldset className="card p-6 space-y-4">
          <legend className="text-heading-3 text-text-primary font-semibold px-1">
            Asset &amp; Attribute Linking
          </legend>

          <div className="space-y-4">
            {/* Asset Link Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="doc-asset"
                className="text-sm font-medium text-text-secondary"
              >
                Link to Asset <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <select
                id="doc-asset"
                value={linkedAssetId}
                onChange={(e) => {
                  setLinkedAssetId(e.target.value);
                  setLinkedAttributes([]);
                }}
                className={cn(
                  'w-full rounded-lg border bg-navy-800 px-3 py-2 text-sm text-text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500',
                  'transition-colors border-border hover:border-text-tertiary',
                )}
                aria-required="true"
              >
                <option value="" disabled>
                  Select an asset…
                </option>
                {assets.map((asset) => (
                  <option key={asset.assetId} value={asset.assetId}>
                    {asset.assetId} — {asset.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Passport Attribute Multi-select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Link to Passport Attributes
              </label>
              {availableAttributes.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">
                  {linkedAssetId
                    ? 'No attributes found for this asset.'
                    : 'Select an asset to see available attributes.'}
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-navy-800 p-2 space-y-1">
                  {availableAttributes.map((attr) => (
                    <label
                      key={attr.attributeId}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer',
                        'hover:bg-surface-elevated transition-colors',
                        linkedAttributes.includes(attr.attributeId) && 'bg-cyan-500/10',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={linkedAttributes.includes(attr.attributeId)}
                        onChange={() => handleAttributeToggle(attr.attributeId)}
                        className="rounded border-border text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-text-primary">{attr.name}</span>
                      <span className="text-text-tertiary text-xs ml-auto">{attr.section}</span>
                    </label>
                  ))}
                </div>
              )}
              {linkedAttributes.length > 0 && (
                <p className="text-xs text-text-tertiary">
                  {linkedAttributes.length} attribute{linkedAttributes.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Visibility & File */}
        <fieldset className="card p-6 space-y-4">
          <legend className="text-heading-3 text-text-primary font-semibold px-1">
            Visibility &amp; File
          </legend>

          <div className="space-y-4">
            {/* Visibility Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Visibility Classification <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Visibility level">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                      visibility === opt.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-text-primary'
                        : 'border-border bg-navy-800 text-text-secondary hover:border-text-tertiary',
                    )}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={visibility === opt.value}
                      onChange={(e) => setVisibility(e.target.value as VisibilityLevel)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-text-tertiary hidden sm:inline">
                      — {opt.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Simulated File Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                File <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              {!fileSelected ? (
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed',
                    'border-border hover:border-cyan-500/50 hover:bg-cyan-500/5',
                    'transition-colors text-text-secondary hover:text-text-primary',
                  )}
                  aria-label="Choose file to upload"
                >
                  <Upload className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm">Choose File</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-navy-800">
                  <FileText className="w-5 h-5 text-cyan-400 shrink-0" aria-hidden="true" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-text-primary font-medium truncate">
                      {SIMULATED_FILE.fileName}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {SIMULATED_FILE.fileSize} • {SIMULATED_FILE.mimeType}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="ml-auto text-text-tertiary hover:text-red-400 transition-colors"
                    aria-label="Remove selected file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'border border-border text-text-secondary',
              'hover:bg-surface-elevated hover:text-text-primary transition-colors',
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isFormValid
                ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                : 'bg-cyan-600/40 text-white/50 cursor-not-allowed',
            )}
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            Upload &amp; Submit for Review
          </button>
        </div>
      </form>

      {/* Success notification */}
      {showSuccess && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900/90 border border-emerald-500/30 rounded-lg px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4"
          role="alert"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-emerald-100 font-medium">Document submitted</span>
            <span className="text-xs text-emerald-300">Pending review</span>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-3 text-emerald-400 hover:text-emerald-200 text-xs"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadForm;
