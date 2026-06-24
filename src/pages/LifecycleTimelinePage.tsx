import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Battery, Plus } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { useRole } from '@/hooks/useRole';
import { LifecycleEventForm, LifecycleTimeline, RoleAccessBanner } from '@/components/domain';
import { DemoDisclaimer } from '@/components/shared';
import { useAppStore } from '@/store';
import { lifecycleEvents } from '@/data/lifecycleEvents';
import type { LifecycleEvent } from '@/types';

// ============================================================
// NOT FOUND STATE
// ============================================================

function AssetNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Battery className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
      <h1 className="text-heading-2 text-text-primary">Asset Not Found</h1>
      <p className="text-body text-text-secondary max-w-md text-center">
        The asset you're looking for doesn't exist or you don't have access to view it.
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
// LIFECYCLE TIMELINE PAGE
// ============================================================

/**
 * LifecycleTimelinePage — Full lifecycle event history for a single asset.
 * Displays the LifecycleTimeline component with filter tabs for
 * All, Production, Operational, Service, and Compliance categories.
 *
 * @validates FR-006 — Lifecycle Timeline
 */
export function LifecycleTimelinePage() {
  const { assetId } = useParams<{ assetId: string }>();
  const { getAssetById } = useAssets();
  const { hasPermission } = useRole();
  const storeEvents = useAppStore((s) => s.lifecycleEvents);

  const [showEventForm, setShowEventForm] = useState(false);

  const asset = assetId ? getAssetById(assetId) : undefined;

  if (!asset) {
    return <AssetNotFound />;
  }

  const canCreateEvents = hasPermission('create_lifecycle_events');

  // Filter static lifecycle events for this asset
  const staticAssetEvents = lifecycleEvents.filter((e) => e.assetId === asset.assetId);

  // Merge static events with dynamic events from the store
  // Dynamic events from the form have source='manual' and no assetId, so we assign one
  const assetEvents = useMemo(() => {
    const dynamicAssetEvents: LifecycleEvent[] = storeEvents.map((e, idx) => ({
      id: `DYN-${idx}`,
      assetId: asset.assetId,
      type: e.type as LifecycleEvent['type'],
      category: e.category,
      timestamp: e.timestamp,
      actor: e.actor,
      source: e.source,
      description: e.description,
      ...(e.documentId ? { documentId: e.documentId } : {}),
      ...(e.metadata ? { metadata: e.metadata } : {}),
    }));
    return [...staticAssetEvents, ...dynamicAssetEvents];
  }, [staticAssetEvents, storeEvents, asset.assetId]);

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic lifecycle data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Header */}
      <header className="flex flex-col gap-3">
        <Link
          to={`/assets/${asset.assetId}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to {asset.model}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-cyan/10">
              <Clock className="w-5 h-5 text-accent-cyan" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-heading-1 text-text-primary">
                Lifecycle Timeline
              </h1>
              <p className="text-body text-text-secondary">
                {asset.model} · {asset.location.city}, {asset.location.country}
              </p>
            </div>
          </div>

          {/* Event count badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-text-tertiary">Total events:</span>
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                {assetEvents.length}
              </span>
            </div>

            {canCreateEvents && (
              <button
                type="button"
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-colors text-sm font-medium"
                aria-label="Add lifecycle event"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add Event
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Lifecycle Event Form (shown when Add Event is clicked) */}
      {showEventForm && (
        <section aria-label="Add lifecycle event form">
          <LifecycleEventForm
            onCancel={() => setShowEventForm(false)}
            onSaved={() => setShowEventForm(false)}
          />
        </section>
      )}

      {/* Lifecycle Timeline */}
      <section aria-label="Lifecycle events timeline">
        <LifecycleTimeline events={assetEvents} />
      </section>
    </div>
  );
}
