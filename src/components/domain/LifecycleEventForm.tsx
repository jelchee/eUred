import { useState, useCallback, useMemo } from 'react';
import { CalendarClock, Plus, Trash2, Save, X, Link2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import { useRole } from '@/hooks/useRole';
import { documents } from '@/data/documents';
import { createAuditEvent } from '@/lib/auditLogger';
import type { ExtendedLifecycleEventType, NewLifecycleEvent } from '@/types/workflow';
import type { EventCategory } from '@/types/audit';

export interface LifecycleEventFormProps {
  className?: string;
  onCancel?: () => void;
  onSaved?: () => void;
}

/** Event type groupings by category */
const EVENT_TYPE_GROUPS: Record<EventCategory, { label: string; types: ExtendedLifecycleEventType[] }> = {
  production: {
    label: 'Production',
    types: ['design_freeze', 'production_batch_created', 'module_assembly', 'factory_acceptance_test'],
  },
  operational: {
    label: 'Operational',
    types: [
      'commissioning',
      'firmware_update',
      'alarm_event',
      'capacity_test',
      'software_update',
      'site_relocation',
      'ownership_transfer',
    ],
  },
  service: {
    label: 'Service',
    types: ['service_inspection', 'maintenance_performed', 'warranty_review'],
  },
  compliance: {
    label: 'Compliance',
    types: ['passport_created', 'shipment', 'repurposing_assessment', 'recycling_handover'],
  },
};

/** Human-readable labels for event types */
const EVENT_TYPE_LABELS: Record<ExtendedLifecycleEventType, string> = {
  design_freeze: 'Design Freeze',
  production_batch_created: 'Production Batch Created',
  module_assembly: 'Module Assembly',
  factory_acceptance_test: 'Factory Acceptance Test',
  commissioning: 'Commissioning',
  firmware_update: 'Firmware Update',
  alarm_event: 'Alarm Event',
  capacity_test: 'Capacity Test',
  software_update: 'Software Update',
  site_relocation: 'Site Relocation',
  ownership_transfer: 'Ownership Transfer',
  service_inspection: 'Service Inspection',
  maintenance_performed: 'Maintenance Performed',
  warranty_review: 'Warranty Review',
  passport_created: 'Passport Created',
  shipment: 'Shipment',
  repurposing_assessment: 'Repurposing Assessment',
  recycling_handover: 'Recycling Handover',
  insurance_assessment: 'Insurance Assessment',
  performance_certification: 'Performance Certification',
};

/** Determine category from event type */
function getCategoryForType(type: ExtendedLifecycleEventType): EventCategory {
  for (const [category, group] of Object.entries(EVENT_TYPE_GROUPS)) {
    if ((group.types as string[]).includes(type)) {
      return category as EventCategory;
    }
  }
  return 'operational';
}

/**
 * LifecycleEventForm — Form for adding lifecycle events to the battery timeline.
 * Accessible to RIMAC_OPERATOR and RIMAC_SERVICE_USER roles.
 *
 * Validates: Requirements FR-DI-013, FR-DI-014
 */
export function LifecycleEventForm({ className, onCancel, onSaved }: LifecycleEventFormProps) {
  const { currentRole, currentUser, hasPermission } = useRole();
  const addLifecycleEvent = useAppStore((s) => s.addLifecycleEvent);

  // Form state
  const [eventType, setEventType] = useState<ExtendedLifecycleEventType | ''>('');
  const [timestamp, setTimestamp] = useState(() => {
    // Default to current date/time in local ISO format for datetime-local input
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [metadataEntries, setMetadataEntries] = useState<{ key: string; value: string }[]>([]);

  // Check role access
  const canCreateEvents = hasPermission('create_lifecycle_events');

  // Available documents for linking
  const availableDocuments = useMemo(() => {
    return documents.filter((d) => d.status === 'verified' || d.status === 'draft');
  }, []);

  // Add a new metadata key-value pair
  const addMetadataEntry = useCallback(() => {
    setMetadataEntries((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  // Remove a metadata entry by index
  const removeMetadataEntry = useCallback((index: number) => {
    setMetadataEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Update a metadata entry
  const updateMetadataEntry = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setMetadataEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: val } : entry))
    );
  }, []);

  // Form validation
  const isValid = eventType !== '' && description.trim().length > 0 && timestamp.length > 0;

  // Handle save
  const handleSave = useCallback(() => {
    if (!eventType || !isValid) return;

    const category = getCategoryForType(eventType);

    // Build metadata record from entries (filter out empty keys)
    const metadata: Record<string, string> = {};
    for (const entry of metadataEntries) {
      if (entry.key.trim()) {
        metadata[entry.key.trim()] = entry.value;
      }
    }

    const newEvent: NewLifecycleEvent = {
      type: eventType,
      category,
      description: description.trim(),
      actor: currentUser?.name ?? 'Unknown',
      timestamp: new Date(timestamp).toISOString(),
      source: 'manual',
      ...(documentId ? { documentId } : {}),
      ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
    };

    // Add lifecycle event to store
    addLifecycleEvent(newEvent);

    // Create audit event for traceability
    createAuditEvent({
      action: 'LIFECYCLE_EVENT_ADDED',
      entityType: 'ASSET',
      entityId: 'current-asset',
      actor: currentUser?.name ?? 'Unknown',
      actorRole: currentRole,
      reason: `Lifecycle event added: ${EVENT_TYPE_LABELS[eventType] ?? eventType}`,
      dataSource: 'manual',
    });

    onSaved?.();
  }, [
    eventType,
    isValid,
    description,
    timestamp,
    documentId,
    metadataEntries,
    currentUser,
    currentRole,
    addLifecycleEvent,
    onSaved,
  ]);

  if (!canCreateEvents) {
    return (
      <div className={cn('p-4 rounded-lg bg-red-500/10 border border-red-500/30', className)}>
        <p className="text-sm text-red-400">
          Access denied. Only RIMAC_OPERATOR and RIMAC_SERVICE_USER roles can create lifecycle events.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 text-cyan-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-text-primary">Add Lifecycle Event</h3>
      </div>

      <div className="space-y-4 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        {/* Event Type Dropdown (grouped by category) */}
        <div className="space-y-1.5">
          <label htmlFor="event-type" className="block text-sm font-medium text-slate-300">
            Event Type <span className="text-red-400">*</span>
          </label>
          <select
            id="event-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as ExtendedLifecycleEventType)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            aria-required="true"
          >
            <option value="">Select event type…</option>
            {Object.entries(EVENT_TYPE_GROUPS).map(([category, group]) => (
              <optgroup key={category} label={group.label}>
                {group.types.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_LABELS[type] ?? type}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Date/Time Picker */}
        <div className="space-y-1.5">
          <label htmlFor="event-timestamp" className="block text-sm font-medium text-slate-300">
            Date &amp; Time <span className="text-red-400">*</span>
          </label>
          <input
            id="event-timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            aria-required="true"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="event-description" className="block text-sm font-medium text-slate-300">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the lifecycle event…"
            rows={3}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y"
            aria-required="true"
          />
        </div>

        {/* Document Link Dropdown (optional) */}
        <div className="space-y-1.5">
          <label htmlFor="event-document" className="block text-sm font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              Link Document <span className="text-slate-500 text-xs">(optional)</span>
            </span>
          </label>
          <select
            id="event-document"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">None</option>
            {availableDocuments.map((doc) => (
              <option key={doc.documentId} value={doc.documentId}>
                {doc.title} ({doc.documentId})
              </option>
            ))}
          </select>
        </div>

        {/* Key-Value Metadata Fields */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              Metadata <span className="text-slate-500 text-xs">(optional)</span>
            </span>
            <button
              type="button"
              onClick={addMetadataEntry}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition-colors text-xs font-medium"
              aria-label="Add metadata field"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Add Field
            </button>
          </div>

          {metadataEntries.length > 0 && (
            <div className="space-y-2">
              {metadataEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(e) => updateMetadataEntry(index, 'key', e.target.value)}
                    placeholder="Key"
                    aria-label={`Metadata key ${index + 1}`}
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={entry.value}
                    onChange={(e) => updateMetadataEntry(index, 'value', e.target.value)}
                    placeholder="Value"
                    aria-label={`Metadata value ${index + 1}`}
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetadataEntry(index)}
                    className="p-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                    aria-label={`Remove metadata field ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save / Cancel Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Event
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
