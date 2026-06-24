import { useState } from 'react';
import { RotateCcw, Zap, Database, Users, FileText, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';
import { KPICard } from '@/components/shared';

export interface DemoDataControlPanelProps {
  className?: string;
}

interface DatasetStats {
  assets: number;
  users: number;
  documents: number;
  telemetryDays: number;
  auditEvents: number;
  tasks: number;
}

const DATASET_STATS: DatasetStats = {
  assets: 3,
  users: 7,
  documents: 12,
  telemetryDays: 90,
  auditEvents: 40,
  tasks: 8,
};

/**
 * DemoDataControlPanel — Reset demo data and generate telemetry buttons.
 * Displays current dataset statistics and provides demo management actions.
 *
 * Validates: Requirements FR-014
 */
export function DemoDataControlPanel({ className }: DemoDataControlPanelProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [generatingTelemetry, setGeneratingTelemetry] = useState(false);
  const [telemetryGenerated, setTelemetryGenerated] = useState(false);

  const handleReset = () => {
    setShowResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  const handleGenerateTelemetry = () => {
    setGeneratingTelemetry(true);
    // Simulate async generation
    setTimeout(() => {
      setGeneratingTelemetry(false);
      setTelemetryGenerated(true);
      setTimeout(() => setTelemetryGenerated(false), 3000);
    }, 1500);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h3 className="text-heading-3 text-text-primary">Demo Data Management</h3>
        <p className="text-xs text-text-tertiary mt-1">
          Manage the synthetic demo dataset for the Battery Passport pilot.
        </p>
      </div>

      {/* Dataset Statistics */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">
          Current Dataset
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="Assets"
            value={DATASET_STATS.assets}
            icon={Database}
            accentColor="cyan"
          />
          <KPICard
            label="Users"
            value={DATASET_STATS.users}
            icon={Users}
            accentColor="emerald"
          />
          <KPICard
            label="Documents"
            value={DATASET_STATS.documents}
            icon={FileText}
            accentColor="cyan"
          />
          <KPICard
            label="Telemetry Days"
            value={DATASET_STATS.telemetryDays}
            icon={Activity}
            accentColor="emerald"
          />
          <KPICard
            label="Audit Events"
            value={DATASET_STATS.auditEvents}
            icon={Activity}
            accentColor="amber"
          />
          <KPICard
            label="Tasks"
            value={DATASET_STATS.tasks}
            icon={Zap}
            accentColor="amber"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-secondary">Actions</h4>

        <div className="flex flex-wrap gap-4">
          {/* Reset Demo Data */}
          <div className="space-y-2">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset Demo Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">Are you sure?</span>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-md bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-md bg-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            {resetDone && (
              <p className="text-xs text-emerald-400">
                ✓ Demo data has been reset to initial state.
              </p>
            )}
          </div>

          {/* Generate New Telemetry */}
          <div className="space-y-2">
            <button
              onClick={handleGenerateTelemetry}
              disabled={generatingTelemetry}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                generatingTelemetry
                  ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400/50 cursor-not-allowed'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              )}
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              {generatingTelemetry ? 'Generating...' : 'Generate New Telemetry'}
            </button>
            {telemetryGenerated && (
              <p className="text-xs text-emerald-400">
                ✓ New telemetry data generated for all assets.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-400/80">
          <strong>Note:</strong> All data in this platform is synthetic and for demonstration purposes only.
          Resetting will restore the original 3 assets, 7 users, 12 documents, 90 days of telemetry, and 40 audit events.
        </p>
      </div>
    </div>
  );
}
