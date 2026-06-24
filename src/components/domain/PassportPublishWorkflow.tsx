import { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Send,
  ArrowRight,
  ArrowLeft,
  Shield,
  Globe,
  User,
  Clock,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import { createAuditEvent } from '@/lib/auditLogger';
import { classifyVisibility, FIELD_VISIBILITY_MAP } from '@/lib/visibilityClassifier';
import type { PublishStep, PublishReadinessCheck, PublicPassportData, PublishResult } from '@/types/workflow';

export interface PassportPublishWorkflowProps {
  assetId: string;
  passportId: string;
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const STEPS: { key: PublishStep; label: string; icon: typeof CheckCircle2 }[] = [
  { key: 'readiness_check', label: 'Readiness Check', icon: Shield },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'confirm', label: 'Confirm', icon: Send },
  { key: 'published', label: 'Published', icon: Globe },
];

/** Public fields that are REQUIRED for publishing */
const REQUIRED_PUBLIC_FIELDS = [
  'passport.model',
  'passport.manufacturer',
  'passport.batteryCategory',
  'asset.capacityKWh',
  'asset.chemistryCategory',
  'passport.safetySummary',
  'passport.recyclingSummary',
] as const;

/** Optional public fields that generate warnings if missing */
const OPTIONAL_PUBLIC_FIELDS = [
  'passport.productionYear',
  'asset.productFamily',
  'asset.batteryType',
  'asset.lifecycleStatus',
] as const;

/**
 * Simulates checking if a field has data populated.
 * In a real app this would check the actual passport data store.
 * For demo, we consider most fields populated except a few.
 */
function isFieldPopulated(fieldPath: string, assetId: string): boolean {
  // Demo simulation: use a deterministic hash to decide population
  const hash = (fieldPath + assetId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // Make most fields populated (roughly 85%) for a realistic demo
  return hash % 7 !== 0;
}

function getFieldLabel(fieldPath: string): string {
  const labels: Record<string, string> = {
    'passport.model': 'Battery Model',
    'passport.manufacturer': 'Manufacturer',
    'passport.batteryCategory': 'Battery Category',
    'asset.capacityKWh': 'Capacity (kWh)',
    'asset.chemistryCategory': 'Chemistry Category',
    'passport.safetySummary': 'Safety Summary',
    'passport.recyclingSummary': 'Recycling Summary',
    'passport.productionYear': 'Production Year',
    'asset.productFamily': 'Product Family',
    'asset.batteryType': 'Battery Type',
    'asset.lifecycleStatus': 'Lifecycle Status',
  };
  return labels[fieldPath] ?? fieldPath;
}

/**
 * PassportPublishWorkflow — 4-step workflow for publishing a battery passport.
 *
 * Steps:
 * 1. Readiness Check — validate public fields
 * 2. Preview — show public-only view
 * 3. Confirm — final confirmation with publisher identity
 * 4. Published — success state with QR code placeholder
 *
 * Only accessible to RIMAC_COMPLIANCE_MANAGER role.
 *
 * @validates FR-DI-011, FR-DI-012, FR-DI-014, FR-DI-015
 */
export function PassportPublishWorkflow({ assetId, passportId, className }: PassportPublishWorkflowProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const currentRole = useAppStore((s) => s.currentRole);
  const startPublishWorkflow = useAppStore((s) => s.startPublishWorkflow);
  const completePublish = useAppStore((s) => s.completePublish);
  const cancelPublish = useAppStore((s) => s.cancelPublish);

  const [currentStep, setCurrentStep] = useState<PublishStep>('readiness_check');
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  // Role guard
  if (currentRole !== 'RIMAC_COMPLIANCE_MANAGER') {
    return (
      <div className={cn('bg-slate-800/60 border border-red-500/30 rounded-lg p-6 text-center', className)}>
        <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm text-red-400 font-medium">Access Denied</p>
        <p className="text-xs text-text-tertiary mt-1">
          Only RIMAC Compliance Managers can publish passports.
        </p>
      </div>
    );
  }

  // Readiness check
  const readinessCheck: PublishReadinessCheck = useMemo(() => {
    const blockers: string[] = [];
    const warnings: string[] = [];

    for (const field of REQUIRED_PUBLIC_FIELDS) {
      const vis = classifyVisibility(field);
      if (vis === 'public' && !isFieldPopulated(field, assetId)) {
        blockers.push(`Missing required field: ${getFieldLabel(field)}`);
      }
    }

    for (const field of OPTIONAL_PUBLIC_FIELDS) {
      const vis = classifyVisibility(field);
      if (vis === 'public' && !isFieldPopulated(field, assetId)) {
        warnings.push(`Optional field not populated: ${getFieldLabel(field)}`);
      }
    }

    const totalPublicFields = REQUIRED_PUBLIC_FIELDS.length + OPTIONAL_PUBLIC_FIELDS.length;
    const populatedCount = totalPublicFields - blockers.length - warnings.length;
    const score = Math.round((populatedCount / totalPublicFields) * 100);

    return {
      isReady: blockers.length === 0,
      score,
      requiredFieldsComplete: blockers.length === 0,
      publicFieldsPopulated: blockers.length === 0 && warnings.length === 0,
      blockers,
      warnings,
    };
  }, [assetId]);

  // Public passport data for preview
  const publicPassportData: PublicPassportData = useMemo(() => ({
    passportId,
    model: 'Nevera HV-Module 800V',
    manufacturer: 'Rimac Technology d.o.o.',
    batteryCategory: 'EV Traction Battery',
    capacity: '117 kWh',
    chemistry: 'NMC 811',
    productionYear: 2024,
    publicSafetySummary: 'Meets UN ECE R100.03 safety requirements. Thermal runaway propagation prevention certified.',
    recyclingSummary: '95% recyclable materials by weight. Contains critical raw materials subject to EU Battery Regulation recovery targets.',
    complianceBadge: 'EU Battery Regulation 2023/1542 Compliant',
    publishedAt: new Date().toISOString(),
    publishedBy: currentUser?.name ?? 'Unknown',
  }), [passportId, currentUser?.name]);

  // Count public fields for summary
  const publicFieldCount = useMemo(() => {
    return Object.entries(FIELD_VISIBILITY_MAP).filter(([, vis]) => vis === 'public').length;
  }, []);

  const handleNext = useCallback(() => {
    const stepOrder: PublishStep[] = ['readiness_check', 'preview', 'confirm', 'published'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      if (currentIndex === 0) {
        startPublishWorkflow(passportId);
      }
    }
  }, [currentStep, passportId, startPublishWorkflow]);

  const handleBack = useCallback(() => {
    const stepOrder: PublishStep[] = ['readiness_check', 'preview', 'confirm', 'published'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const handlePublish = useCallback(() => {
    // Create audit event
    const auditEvent = createAuditEvent({
      action: 'PASSPORT_PUBLISHED',
      entityType: 'ASSET',
      entityId: passportId,
      actor: currentUser?.name ?? 'Unknown',
      actorRole: currentRole,
      reason: 'Passport published via compliance workflow',
      dataSource: 'manual',
      affectedFields: ['status', 'publishedAt'],
      visibility: 'public',
    });

    // Complete publish in store
    completePublish(passportId);

    // Set result
    const result: PublishResult = {
      success: true,
      publicPassport: publicPassportData,
      auditEventId: auditEvent.auditEventId,
      publishedAt: auditEvent.timestamp,
    };
    setPublishResult(result);
    setCurrentStep('published');
  }, [passportId, currentUser?.name, currentRole, completePublish, publicPassportData]);

  const handleCancel = useCallback(() => {
    cancelPublish(passportId);
    setCurrentStep('readiness_check');
    setPublishResult(null);
  }, [passportId, cancelPublish]);

  // Step indicator
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className={cn('bg-slate-800/60 border border-slate-700/50 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-text-primary">Publish Passport</h3>
        </div>

        {/* Step indicator bar */}
        <div className="flex items-center gap-1" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={4}>
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === stepIndex;
            const isComplete = idx < stepIndex;
            return (
              <div key={step.key} className="flex-1 flex items-center gap-1">
                <div className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors',
                  isActive && 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
                  isComplete && 'bg-emerald-500/10 text-emerald-400',
                  !isActive && !isComplete && 'text-text-tertiary',
                )}>
                  <StepIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-px mx-1',
                    idx < stepIndex ? 'bg-emerald-500/50' : 'bg-slate-700',
                  )} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="p-5">
        {/* Step 1: Readiness Check */}
        {currentStep === 'readiness_check' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">
                Validating that all required public fields are populated before publishing.
              </p>
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                readinessCheck.isReady
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400',
              )}>
                {readinessCheck.score}% ready
              </span>
            </div>

            {/* Blockers */}
            {readinessCheck.blockers.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-red-400 uppercase tracking-wider">
                  Blockers ({readinessCheck.blockers.length})
                </p>
                {readinessCheck.blockers.map((blocker, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-md">
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" aria-hidden="true" />
                    <span className="text-xs text-red-300">{blocker}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {readinessCheck.warnings.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
                  Warnings ({readinessCheck.warnings.length})
                </p>
                {readinessCheck.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                    <span className="text-xs text-amber-300">{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success state */}
            {readinessCheck.isReady && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="text-xs text-emerald-300">
                  All required public fields are populated. Ready to preview.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                disabled={!readinessCheck.isReady}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md transition-colors',
                  readinessCheck.isReady
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed',
                )}
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <p className="text-xs text-text-secondary">
                Public Passport Preview — this is what external viewers will see after scanning the QR code.
              </p>
            </div>

            {/* Public preview card */}
            <div className="bg-slate-900/60 border border-emerald-500/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2 mb-2">
                <Globe className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Public Passport Preview
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-tertiary">Model</span>
                  <p className="text-text-primary font-medium">{publicPassportData.model}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Manufacturer</span>
                  <p className="text-text-primary font-medium">{publicPassportData.manufacturer}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Category</span>
                  <p className="text-text-primary font-medium">{publicPassportData.batteryCategory}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Capacity</span>
                  <p className="text-text-primary font-medium">{publicPassportData.capacity}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Chemistry</span>
                  <p className="text-text-primary font-medium">{publicPassportData.chemistry}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Production Year</span>
                  <p className="text-text-primary font-medium">{publicPassportData.productionYear}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700/50">
                <div>
                  <span className="text-text-tertiary text-xs">Safety Summary</span>
                  <p className="text-xs text-text-secondary mt-0.5">{publicPassportData.publicSafetySummary}</p>
                </div>
                <div>
                  <span className="text-text-tertiary text-xs">Recycling Summary</span>
                  <p className="text-xs text-text-secondary mt-0.5">{publicPassportData.recyclingSummary}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  {publicPassportData.complianceBadge}
                </span>
              </div>
            </div>

            {/* Hidden fields notice */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/40 border border-slate-700/50 rounded-md">
              <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="text-[11px] text-text-tertiary">
                Restricted and Confidential fields are hidden from the public view.
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary border border-slate-700 rounded-md hover:bg-slate-700/50 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-cyan-600 text-white hover:bg-cyan-500 rounded-md transition-colors"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <p className="text-xs text-text-secondary">
                Review and confirm passport publication.
              </p>
            </div>

            {/* Confirmation details */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <User className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-text-tertiary">Publisher</span>
                  <p className="text-text-primary font-medium">{currentUser?.name ?? 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Clock className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-text-tertiary">Publish Timestamp</span>
                  <p className="text-text-primary font-medium">
                    {new Date().toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Globe className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-text-tertiary">Publication Summary</span>
                  <p className="text-text-primary font-medium">
                    {publicFieldCount} public fields will be visible via QR code
                  </p>
                </div>
              </div>
            </div>

            {/* Warning notice */}
            <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-[11px] text-amber-300">
                Once published, the passport data will be accessible to anyone with the QR code or public URL.
                This action creates a permanent audit trail entry.
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/30 rounded-md hover:bg-red-500/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 rounded-md transition-colors"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                Publish Passport
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Published */}
        {currentStep === 'published' && publishResult && (
          <div className="space-y-4 text-center">
            {/* Success indicator */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-emerald-400">Passport Published Successfully</p>
              <p className="text-xs text-text-tertiary">
                The battery passport is now publicly accessible.
              </p>
            </div>

            {/* QR Code placeholder */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center bg-slate-900/40">
                <QrCode className="h-8 w-8 text-slate-500 mb-1" aria-hidden="true" />
                <span className="text-[10px] text-text-tertiary">QR Code</span>
              </div>
            </div>

            {/* Public URL */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
              <p className="text-[11px] text-text-tertiary mb-1">Public URL</p>
              <div className="flex items-center gap-2 justify-center">
                <ExternalLink className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                <span className="text-xs text-cyan-400 font-mono">
                  https://passport.battery-demo.eu/public/{passportId}
                </span>
              </div>
            </div>

            {/* Audit reference */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-left">
              <p className="text-[11px] text-text-tertiary mb-1">Audit Trail Reference</p>
              <p className="text-xs text-text-secondary font-mono">{publishResult.auditEventId}</p>
              <p className="text-[10px] text-text-tertiary mt-1">
                Published at: {new Date(publishResult.publishedAt).toLocaleString('en-GB')}
              </p>
            </div>

            {/* Done button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-xs font-medium bg-cyan-600 text-white hover:bg-cyan-500 rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
