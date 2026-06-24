import React, { useState, useCallback } from 'react';
import { Save, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { classifyVisibility } from '@/lib/visibilityClassifier';
import { createAuditEvent } from '@/lib/auditLogger';
import { useAppStore } from '@/store';
import type { NewAssetDraft, AssetFormField, VisibilityLevel } from '@/types';
import type { BatteryChemistry, AssetStatus } from '@/types';

// ============================================================
// FORM FIELD DEFINITIONS
// ============================================================

const FORM_FIELDS: AssetFormField[] = [
  // Identity section
  {
    key: 'assetId',
    label: 'Asset ID',
    type: 'text',
    required: true,
    visibility: classifyVisibility('asset.assetId'),
    placeholder: 'e.g. BESS-2026-001',
  },
  {
    key: 'serialNumber',
    label: 'Serial Number',
    type: 'text',
    required: true,
    visibility: classifyVisibility('asset.serialNumber'),
    placeholder: 'e.g. SN-2026-001',
  },
  {
    key: 'productFamily',
    label: 'Product Family',
    type: 'text',
    required: true,
    visibility: classifyVisibility('asset.productFamily'),
    placeholder: 'e.g. SEST Energy',
  },
  // Technical section
  {
    key: 'batteryType',
    label: 'Battery Type',
    type: 'text',
    required: true,
    visibility: classifyVisibility('asset.batteryType'),
    placeholder: 'e.g. LFP Module',
  },
  {
    key: 'capacityKWh',
    label: 'Capacity (kWh)',
    type: 'number',
    required: true,
    visibility: classifyVisibility('asset.capacityKWh'),
    placeholder: 'e.g. 120',
    validation: (value: unknown) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) return 'Capacity must be a positive number';
      return null;
    },
  },
  {
    key: 'chemistryCategory',
    label: 'Chemistry',
    type: 'select',
    required: true,
    visibility: classifyVisibility('asset.chemistryCategory'),
    placeholder: 'Select chemistry',
    options: ['LFP', 'NMC', 'NCA', 'LTO'],
  },
  // Location section
  {
    key: 'manufacturingSite',
    label: 'Manufacturing Site',
    type: 'text',
    required: true,
    visibility: classifyVisibility('asset.manufacturingSite'),
    placeholder: 'e.g. Zagreb Plant',
  },
  {
    key: 'installationLocation',
    label: 'Installation Location',
    type: 'text',
    required: false,
    visibility: classifyVisibility('asset.installationLocation'),
    placeholder: 'e.g. Munich Data Center',
  },
  {
    key: 'customerProject',
    label: 'Customer Project',
    type: 'text',
    required: false,
    visibility: classifyVisibility('asset.customerProject'),
    placeholder: 'e.g. EU-GRID-2026',
  },
  // Status section
  {
    key: 'manufacturingDate',
    label: 'Manufacturing Date',
    type: 'date',
    required: true,
    visibility: classifyVisibility('asset.manufacturingDate'),
    placeholder: 'YYYY-MM-DD',
  },
  {
    key: 'lifecycleStatus',
    label: 'Lifecycle Status',
    type: 'select',
    required: true,
    visibility: classifyVisibility('asset.lifecycleStatus'),
    placeholder: 'Select status',
    options: ['Operational', 'Pre-commissioning', 'Maintenance', 'Decommissioned'],
  },
];

/** Group field keys by section */
const SECTIONS: { title: string; keys: (keyof NewAssetDraft)[] }[] = [
  { title: 'Identity', keys: ['assetId', 'serialNumber', 'productFamily'] },
  { title: 'Technical', keys: ['batteryType', 'capacityKWh', 'chemistryCategory'] },
  { title: 'Location', keys: ['manufacturingSite', 'installationLocation', 'customerProject'] },
  { title: 'Status', keys: ['manufacturingDate', 'lifecycleStatus'] },
];

// ============================================================
// VISIBILITY BADGE
// ============================================================

const visibilityColors: Record<VisibilityLevel, string> = {
  public: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  restricted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confidential: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function VisibilityBadge({ level }: { level: VisibilityLevel }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-[0.625rem] font-medium rounded border capitalize',
        visibilityColors[level],
      )}
      title={`Visibility: ${level}`}
    >
      {level}
    </span>
  );
}

// ============================================================
// SUCCESS TOAST
// ============================================================

function SuccessToast({ assetId, onDismiss }: { assetId: string; onDismiss: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900/90 border border-emerald-500/30 rounded-lg px-4 py-3 shadow-lg animate-in slide-in-from-bottom-4"
      role="alert"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-emerald-100 font-medium">Asset created successfully</span>
        <span className="text-xs text-emerald-300">
          Asset ID: <span className="font-mono">{assetId}</span>
        </span>
      </div>
      <button
        onClick={onDismiss}
        className="ml-3 text-emerald-400 hover:text-emerald-200 text-xs"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export interface CreateAssetFormProps {
  className?: string;
  onSuccess?: (assetId: string) => void;
}

/**
 * CreateAssetForm — Multi-section form for creating a new BESS asset.
 * Grouped by Identity, Technical, Location, Status.
 * Shows VisibilityBadge next to each field and validates required fields on submit.
 *
 * @validates FR-DI-001 — Manual asset creation
 * @validates FR-DI-002 — Draft asset support
 * @validates FR-DI-014 — Visibility classification
 * @validates FR-DI-015 — Audit trail generation
 */
export const CreateAssetForm: React.FC<CreateAssetFormProps> = ({ className, onSuccess }) => {
  const saveDraft = useAppStore((s) => s.saveDraft);

  const [formData, setFormData] = useState<Record<string, string>>({
    assetId: '',
    serialNumber: '',
    productFamily: '',
    batteryType: '',
    capacityKWh: '',
    chemistryCategory: '',
    manufacturingSite: '',
    installationLocation: '',
    customerProject: '',
    manufacturingDate: '',
    lifecycleStatus: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ assetId: string } | null>(null);

  const handleChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field on change
    setErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }, []);

  const validate = useCallback((isDraft: boolean): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!isDraft) {
      for (const field of FORM_FIELDS) {
        if (field.required) {
          const value = formData[field.key]?.trim();
          if (!value) {
            newErrors[field.key] = `${field.label} is required`;
          }
        }
        // Run custom validation
        if (field.validation && formData[field.key]) {
          const err = field.validation(formData[field.key]);
          if (err) {
            newErrors[field.key] = err;
          }
        }
      }
    } else {
      // For draft, asset ID is still required as minimum identifier
      if (!formData.assetId?.trim()) {
        newErrors.assetId = 'Asset ID is required even for drafts';
      }
    }

    return newErrors;
  }, [formData]);

  const buildDraft = useCallback((isDraft: boolean): NewAssetDraft => {
    return {
      assetId: formData.assetId.trim(),
      serialNumber: formData.serialNumber.trim(),
      productFamily: formData.productFamily.trim(),
      batteryType: formData.batteryType.trim(),
      capacityKWh: Number(formData.capacityKWh) || 0,
      chemistryCategory: (formData.chemistryCategory as BatteryChemistry) || 'LFP',
      manufacturingDate: formData.manufacturingDate,
      manufacturingSite: formData.manufacturingSite.trim(),
      customerProject: formData.customerProject?.trim() || undefined,
      installationLocation: formData.installationLocation?.trim() || undefined,
      lifecycleStatus: (formData.lifecycleStatus as AssetStatus) || 'Pre-commissioning',
      passportStatus: 'draft',
      isDraft,
    };
  }, [formData]);

  const handleSubmit = useCallback((isDraft: boolean) => {
    const validationErrors = validate(isDraft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const draft = buildDraft(isDraft);

    // Save to store
    saveDraft(draft);

    // Create audit event
    createAuditEvent({
      action: isDraft ? 'ASSET_DRAFT_SAVED' : 'PASSPORT_CREATED',
      entityType: 'ASSET',
      entityId: draft.assetId,
      actor: 'current-user',
      actorRole: 'RIMAC_OPERATOR',
      reason: isDraft ? 'Asset saved as draft' : 'New asset created via form',
      dataSource: 'manual',
      affectedFields: Object.keys(formData).filter((k) => formData[k]?.trim()),
    });

    // Show success toast
    setToast({ assetId: draft.assetId });
    onSuccess?.(draft.assetId);

    // Auto-dismiss toast after 5 seconds
    setTimeout(() => setToast(null), 5000);

    // Reset form if not draft
    if (!isDraft) {
      setFormData({
        assetId: '',
        serialNumber: '',
        productFamily: '',
        batteryType: '',
        capacityKWh: '',
        chemistryCategory: '',
        manufacturingSite: '',
        installationLocation: '',
        customerProject: '',
        manufacturingDate: '',
        lifecycleStatus: '',
      });
    }
  }, [validate, buildDraft, saveDraft, onSuccess, formData]);

  const fieldMap = new Map(FORM_FIELDS.map((f) => [f.key, f]));

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        noValidate
        className="space-y-8"
      >
        {SECTIONS.map((section) => (
          <fieldset
            key={section.title}
            className="card p-6 space-y-4"
          >
            <legend className="text-heading-3 text-text-primary font-semibold px-1">
              {section.title}
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.keys.map((key) => {
                const field = fieldMap.get(key);
                if (!field) return null;

                const error = errors[key];
                const value = formData[key] ?? '';

                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    {/* Label row with visibility badge */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`field-${key}`}
                        className="text-sm font-medium text-text-secondary"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
                        )}
                      </label>
                      <VisibilityBadge level={field.visibility} />
                    </div>

                    {/* Input */}
                    {field.type === 'select' ? (
                      <select
                        id={`field-${key}`}
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className={cn(
                          'w-full rounded-lg border bg-navy-800 px-3 py-2 text-sm text-text-primary',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500',
                          'transition-colors',
                          error
                            ? 'border-red-500/60 bg-red-500/5'
                            : 'border-border hover:border-text-tertiary',
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `error-${key}` : undefined}
                      >
                        <option value="" disabled>
                          {field.placeholder}
                        </option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`field-${key}`}
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={field.placeholder}
                        min={field.type === 'number' ? '0' : undefined}
                        step={field.type === 'number' ? 'any' : undefined}
                        className={cn(
                          'w-full rounded-lg border bg-navy-800 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500',
                          'transition-colors',
                          error
                            ? 'border-red-500/60 bg-red-500/5'
                            : 'border-border hover:border-text-tertiary',
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `error-${key}` : undefined}
                      />
                    )}

                    {/* Inline error message */}
                    {error && (
                      <p
                        id={`error-${key}`}
                        className="flex items-center gap-1 text-xs text-red-400"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'border border-border text-text-secondary',
              'hover:bg-surface-elevated hover:text-text-primary transition-colors',
            )}
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            Save as Draft
          </button>
          <button
            type="submit"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'bg-cyan-600 text-white',
              'hover:bg-cyan-500 transition-colors',
            )}
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            Create Asset
          </button>
        </div>
      </form>

      {/* Success toast */}
      {toast && (
        <SuccessToast
          assetId={toast.assetId}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CreateAssetForm;
