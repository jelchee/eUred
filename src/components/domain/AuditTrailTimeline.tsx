import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Hash,
  Save,
  FileSpreadsheet,
  Plug,
  Send,
  CheckCircle,
  XCircle,
  Globe,
  CalendarClock,
  Link,
  Eye,
  Calculator,
  Database,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { AuditEvent, UserRole, ExtendedAuditAction, EnhancedAuditEvent, DataSource, VisibilityLevel } from '@/types';

export interface AuditTrailTimelineProps {
  events: (AuditEvent | EnhancedAuditEvent)[];
  className?: string;
}

const ACTION_LABELS: Record<ExtendedAuditAction, string> = {
  ATTRIBUTE_CREATED: 'Attribute Created',
  ATTRIBUTE_UPDATED: 'Attribute Updated',
  ATTRIBUTE_STATUS_CHANGED: 'Status Changed',
  ATTRIBUTE_VERIFIED: 'Attribute Verified',
  DOCUMENT_UPLOADED: 'Document Uploaded',
  DOCUMENT_VERIFIED: 'Document Verified',
  DOCUMENT_EXPIRED: 'Document Expired',
  ROLE_ACCESS_GRANTED: 'Access Granted',
  TELEMETRY_INGESTED: 'Telemetry Ingested',
  TASK_CREATED: 'Task Created',
  TASK_RESOLVED: 'Task Resolved',
  PASSPORT_CREATED: 'Passport Created',
  EXPORT_GENERATED: 'Export Generated',
  ASSET_DRAFT_SAVED: 'Asset Draft Saved',
  CSV_IMPORT_COMPLETED: 'CSV Import Completed',
  MOCK_API_IMPORT: 'Mock API Import',
  TELEMETRY_SIMULATOR_STARTED: 'Telemetry Simulator Started',
  TELEMETRY_SIMULATOR_STOPPED: 'Telemetry Simulator Stopped',
  TELEMETRY_SCENARIO_CHANGED: 'Telemetry Scenario Changed',
  SUPPLIER_DECLARATION_SUBMITTED: 'Supplier Declaration Submitted',
  COMPLIANCE_REVIEW_APPROVED: 'Compliance Review Approved',
  COMPLIANCE_REVIEW_REJECTED: 'Compliance Review Rejected',
  COMPLIANCE_CHANGES_REQUESTED: 'Compliance Changes Requested',
  PASSPORT_PUBLISHED: 'Passport Published',
  PASSPORT_UNPUBLISHED: 'Passport Unpublished',
  LIFECYCLE_EVENT_ADDED: 'Lifecycle Event Added',
  DOCUMENT_LINKED: 'Document Linked',
  VISIBILITY_CHANGED: 'Visibility Changed',
  COMPLETENESS_RECALCULATED: 'Completeness Recalculated',
};

const ACTION_COLORS: Record<ExtendedAuditAction, string> = {
  ATTRIBUTE_CREATED: 'bg-cyan-500',
  ATTRIBUTE_UPDATED: 'bg-blue-500',
  ATTRIBUTE_STATUS_CHANGED: 'bg-amber-500',
  ATTRIBUTE_VERIFIED: 'bg-emerald-500',
  DOCUMENT_UPLOADED: 'bg-cyan-500',
  DOCUMENT_VERIFIED: 'bg-emerald-500',
  DOCUMENT_EXPIRED: 'bg-red-500',
  ROLE_ACCESS_GRANTED: 'bg-purple-500',
  TELEMETRY_INGESTED: 'bg-blue-400',
  TASK_CREATED: 'bg-amber-500',
  TASK_RESOLVED: 'bg-emerald-500',
  PASSPORT_CREATED: 'bg-cyan-400',
  EXPORT_GENERATED: 'bg-slate-400',
  ASSET_DRAFT_SAVED: 'bg-slate-500',
  CSV_IMPORT_COMPLETED: 'bg-green-500',
  MOCK_API_IMPORT: 'bg-indigo-500',
  TELEMETRY_SIMULATOR_STARTED: 'bg-teal-500',
  TELEMETRY_SIMULATOR_STOPPED: 'bg-orange-500',
  TELEMETRY_SCENARIO_CHANGED: 'bg-teal-400',
  SUPPLIER_DECLARATION_SUBMITTED: 'bg-violet-500',
  COMPLIANCE_REVIEW_APPROVED: 'bg-emerald-600',
  COMPLIANCE_REVIEW_REJECTED: 'bg-red-600',
  COMPLIANCE_CHANGES_REQUESTED: 'bg-amber-600',
  PASSPORT_PUBLISHED: 'bg-cyan-600',
  PASSPORT_UNPUBLISHED: 'bg-slate-500',
  LIFECYCLE_EVENT_ADDED: 'bg-blue-600',
  DOCUMENT_LINKED: 'bg-purple-400',
  VISIBILITY_CHANGED: 'bg-amber-400',
  COMPLETENESS_RECALCULATED: 'bg-sky-500',
};

const ALL_ACTIONS: ExtendedAuditAction[] = [
  'ATTRIBUTE_CREATED',
  'ATTRIBUTE_UPDATED',
  'ATTRIBUTE_STATUS_CHANGED',
  'ATTRIBUTE_VERIFIED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_VERIFIED',
  'DOCUMENT_EXPIRED',
  'ROLE_ACCESS_GRANTED',
  'TELEMETRY_INGESTED',
  'TASK_CREATED',
  'TASK_RESOLVED',
  'PASSPORT_CREATED',
  'EXPORT_GENERATED',
  'ASSET_DRAFT_SAVED',
  'CSV_IMPORT_COMPLETED',
  'MOCK_API_IMPORT',
  'TELEMETRY_SIMULATOR_STARTED',
  'TELEMETRY_SIMULATOR_STOPPED',
  'TELEMETRY_SCENARIO_CHANGED',
  'SUPPLIER_DECLARATION_SUBMITTED',
  'COMPLIANCE_REVIEW_APPROVED',
  'COMPLIANCE_REVIEW_REJECTED',
  'COMPLIANCE_CHANGES_REQUESTED',
  'PASSPORT_PUBLISHED',
  'PASSPORT_UNPUBLISHED',
  'LIFECYCLE_EVENT_ADDED',
  'DOCUMENT_LINKED',
  'VISIBILITY_CHANGED',
  'COMPLETENESS_RECALCULATED',
];

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatRoleLabel(role: UserRole): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ActionIcon({ action }: { action: ExtendedAuditAction }) {
  const className = 'h-3.5 w-3.5';
  switch (action) {
    case 'ASSET_DRAFT_SAVED':
      return <Save className={className} aria-hidden="true" />;
    case 'CSV_IMPORT_COMPLETED':
      return <FileSpreadsheet className={className} aria-hidden="true" />;
    case 'MOCK_API_IMPORT':
      return <Plug className={className} aria-hidden="true" />;
    case 'TELEMETRY_SIMULATOR_STARTED':
    case 'TELEMETRY_SIMULATOR_STOPPED':
    case 'TELEMETRY_SCENARIO_CHANGED':
      return <Activity className={className} aria-hidden="true" />;
    case 'SUPPLIER_DECLARATION_SUBMITTED':
      return <Send className={className} aria-hidden="true" />;
    case 'COMPLIANCE_REVIEW_APPROVED':
      return <CheckCircle className={className} aria-hidden="true" />;
    case 'COMPLIANCE_REVIEW_REJECTED':
    case 'COMPLIANCE_CHANGES_REQUESTED':
      return <XCircle className={className} aria-hidden="true" />;
    case 'PASSPORT_PUBLISHED':
    case 'PASSPORT_UNPUBLISHED':
      return <Globe className={className} aria-hidden="true" />;
    case 'LIFECYCLE_EVENT_ADDED':
      return <CalendarClock className={className} aria-hidden="true" />;
    case 'DOCUMENT_LINKED':
      return <Link className={className} aria-hidden="true" />;
    case 'VISIBILITY_CHANGED':
      return <Eye className={className} aria-hidden="true" />;
    case 'COMPLETENESS_RECALCULATED':
      return <Calculator className={className} aria-hidden="true" />;
    default:
      return null;
  }
}

function isEnhancedEvent(event: AuditEvent | EnhancedAuditEvent): event is EnhancedAuditEvent {
  return 'dataSource' in event;
}

function formatDataSource(source: DataSource): string {
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatVisibility(vis: VisibilityLevel): string {
  return vis.charAt(0).toUpperCase() + vis.slice(1);
}

/**
 * AuditTrailTimeline — Searchable audit timeline with filters.
 * Displays each event with timestamp, actor, action, entity, and reason.
 * Read-only styling per FR-010.
 *
 * Validates: Requirements FR-010
 */
export function AuditTrailTimeline({
  events,
  className,
}: AuditTrailTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ExtendedAuditAction | 'all'>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const uniqueActors = useMemo(() => {
    const actors = new Set(events.map((e) => e.actor));
    return Array.from(actors).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.actor.toLowerCase().includes(query) ||
          e.reason.toLowerCase().includes(query) ||
          e.entityId.toLowerCase().includes(query) ||
          e.auditEventId.toLowerCase().includes(query) ||
          e.traceId.toLowerCase().includes(query)
      );
    }

    if (actionFilter !== 'all') {
      result = result.filter((e) => e.action === actionFilter);
    }

    if (actorFilter !== 'all') {
      result = result.filter((e) => e.actor === actorFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((e) => new Date(e.timestamp) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((e) => new Date(e.timestamp) <= to);
    }

    return result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events, searchQuery, actionFilter, actorFilter, dateFrom, dateTo]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search audit events..."
          aria-label="Search audit events"
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-text-tertiary" aria-hidden="true" />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ExtendedAuditAction | 'all')}
          aria-label="Filter by action type"
          className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Actions</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]}
            </option>
          ))}
        </select>

        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          aria-label="Filter by actor"
          className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Actors</option>
          {uniqueActors.map((actor) => (
            <option key={actor} value={actor}>
              {actor}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <label htmlFor="audit-date-from" className="text-xs text-text-tertiary">
            From:
          </label>
          <input
            id="audit-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1">
          <label htmlFor="audit-date-to" className="text-xs text-text-tertiary">
            To:
          </label>
          <input
            id="audit-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-text-tertiary">
        {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
      </p>

      {/* Timeline */}
      <div className="relative space-y-0">
        {/* Vertical line */}
        {filteredEvents.length > 0 && (
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-700" aria-hidden="true" />
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No audit events match the current filters.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.auditEventId}
              className="relative pl-8 py-3 group"
            >
              {/* Dot indicator */}
              <div
                className={cn(
                  'absolute left-1.5 top-4 w-4 h-4 rounded-full border-2 border-slate-900',
                  ACTION_COLORS[event.action]
                )}
                aria-hidden="true"
              />

              {/* Event card */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-primary">
                    <ActionIcon action={event.action} />
                    {ACTION_LABELS[event.action]}
                  </span>
                  <div className="flex items-center gap-1 text-text-tertiary">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <time className="text-[11px]" dateTime={event.timestamp}>
                      {formatTimestamp(event.timestamp)}
                    </time>
                  </div>
                </div>

                {/* Body */}
                <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                  {event.reason}
                </p>

                {/* Enhanced details — dataSource, affectedFields, scoreImpact */}
                {isEnhancedEvent(event) && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {event.dataSource && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/50 text-[11px] text-text-secondary">
                        <Database className="h-3 w-3" aria-hidden="true" />
                        {formatDataSource(event.dataSource)}
                      </span>
                    )}
                    {event.scoreImpact != null && event.scoreImpact !== 0 && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]',
                          event.scoreImpact > 0
                            ? 'bg-emerald-900/30 text-emerald-400'
                            : 'bg-red-900/30 text-red-400'
                        )}
                      >
                        {event.scoreImpact > 0 ? (
                          <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <TrendingDown className="h-3 w-3" aria-hidden="true" />
                        )}
                        {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}% score
                      </span>
                    )}
                    {event.visibility && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/50 text-[11px] text-text-secondary">
                        <Eye className="h-3 w-3" aria-hidden="true" />
                        {formatVisibility(event.visibility)}
                      </span>
                    )}
                  </div>
                )}

                {/* Affected fields */}
                {isEnhancedEvent(event) && event.affectedFields && event.affectedFields.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[11px] text-text-tertiary">Affected fields: </span>
                    <span className="text-[11px] text-text-secondary">
                      {event.affectedFields.join(', ')}
                    </span>
                  </div>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" aria-hidden="true" />
                    {event.actor}
                    <span className="text-text-tertiary/60">
                      ({formatRoleLabel(event.actorRole)})
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" aria-hidden="true" />
                    {event.entityType}/{event.entityId}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" aria-hidden="true" />
                    {event.traceId}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
