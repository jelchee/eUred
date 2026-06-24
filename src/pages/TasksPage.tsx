import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ListChecks,
  AlertTriangle,
  ArrowUpCircle,
  MinusCircle,
  ArrowDownCircle,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { RoleAccessBanner } from '@/components/domain';
import { DemoDisclaimer } from '@/components/shared';
import { tasks as allTasks } from '@/data/tasks';
import type { Task } from '@/types';

// ============================================================
// CONSTANTS
// ============================================================

const PRIORITY_ORDER: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

const PRIORITY_CONFIG: Record<
  Task['priority'],
  { label: string; icon: typeof AlertTriangle; color: string; badgeColor: string }
> = {
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    color: 'text-red-400',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  high: {
    label: 'High',
    icon: ArrowUpCircle,
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  medium: {
    label: 'Medium',
    icon: MinusCircle,
    color: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  low: {
    label: 'Low',
    icon: ArrowDownCircle,
    color: 'text-slate-400',
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
};

const STATUS_CONFIG: Record<Task['status'], { label: string; color: string }> = {
  open: { label: 'Open', color: 'text-amber-400' },
  in_progress: { label: 'In Progress', color: 'text-cyan-400' },
  resolved: { label: 'Resolved', color: 'text-emerald-400' },
  dismissed: { label: 'Dismissed', color: 'text-slate-400' },
};

type FilterStatus = 'all' | 'open' | 'in_progress' | 'resolved' | 'dismissed';

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isOverdue(dueDate: string, status: Task['status']): boolean {
  if (status === 'resolved' || status === 'dismissed') return false;
  return new Date(dueDate) < new Date('2026-06-24'); // Demo "now" date
}

function getAssetShortId(assetId: string): string {
  // ASSET-SEST-ZG-0001 → ZG-0001
  const parts = assetId.split('-');
  return parts.slice(-2).join('-');
}

// ============================================================
// TASKS PAGE
// ============================================================

/**
 * TasksPage — Displays tasks grouped by priority (critical, high, medium, low).
 * Supports "Mark as resolved" in demo mode (local state only).
 * Links to related assets.
 *
 * @validates FR-012 — Notifications & Tasks
 */
export function TasksPage() {
  const [localTasks, setLocalTasks] = useState<Task[]>(allTasks);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return localTasks;
    return localTasks.filter((t) => t.status === statusFilter);
  }, [localTasks, statusFilter]);

  // Group by priority
  const groupedTasks = useMemo(() => {
    const groups: Record<Task['priority'], Task[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    for (const task of filteredTasks) {
      groups[task.priority].push(task);
    }

    return groups;
  }, [filteredTasks]);

  // Task count summaries
  const counts = useMemo(() => {
    const openTasks = localTasks.filter(
      (t) => t.status !== 'resolved' && t.status !== 'dismissed'
    );
    return {
      total: localTasks.length,
      open: openTasks.length,
      critical: openTasks.filter((t) => t.priority === 'critical').length,
      high: openTasks.filter((t) => t.priority === 'high').length,
      medium: openTasks.filter((t) => t.priority === 'medium').length,
      low: openTasks.filter((t) => t.priority === 'low').length,
    };
  }, [localTasks]);

  // Mark as resolved handler (demo: updates local state only)
  const handleMarkResolved = (taskId: string) => {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.taskId === taskId
          ? { ...t, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
          : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic task data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-1 text-text-primary flex items-center gap-2">
            <ListChecks className="w-7 h-7 text-cyan-400" aria-hidden="true" />
            Tasks
          </h1>
          <p className="text-body text-text-secondary mt-1">
            {counts.open} open tasks across all assets
          </p>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {counts.critical > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-badge font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              {counts.critical} Critical
            </span>
          )}
          {counts.high > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-badge font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {counts.high} High
            </span>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg w-fit" role="tablist">
        {(['all', 'open', 'in_progress', 'resolved', 'dismissed'] as FilterStatus[]).map(
          (filter) => (
            <button
              key={filter}
              role="tab"
              aria-selected={statusFilter === filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                statusFilter === filter
                  ? 'bg-slate-700 text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              {filter === 'all'
                ? 'All'
                : filter === 'in_progress'
                ? 'In Progress'
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Grouped Task Lists */}
      <div className="space-y-8">
        {PRIORITY_ORDER.map((priority) => {
          const tasksInGroup = groupedTasks[priority];
          if (tasksInGroup.length === 0) return null;

          const config = PRIORITY_CONFIG[priority];
          const Icon = config.icon;

          return (
            <section key={priority} aria-label={`${config.label} priority tasks`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn('w-5 h-5', config.color)} aria-hidden="true" />
                <h2 className={cn('text-heading-3', config.color)}>{config.label}</h2>
                <span className="ml-2 text-caption text-text-tertiary">
                  ({tasksInGroup.length})
                </span>
              </div>

              <div className="space-y-3">
                {tasksInGroup.map((task) => (
                  <TaskCard
                    key={task.taskId}
                    task={task}
                    onMarkResolved={handleMarkResolved}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-body text-text-secondary">
              No tasks match the current filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TASK CARD COMPONENT
// ============================================================

interface TaskCardProps {
  task: Task;
  onMarkResolved: (taskId: string) => void;
}

function TaskCard({ task, onMarkResolved }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];
  const overdue = isOverdue(task.dueDate, task.status);
  const canResolve = task.status === 'open' || task.status === 'in_progress';

  return (
    <div
      className={cn(
        'card p-4 border transition-colors',
        overdue && 'border-red-500/30',
        !overdue && 'border-slate-700/50'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title + Status */}
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
                priorityConfig.badgeColor
              )}
            >
              {priorityConfig.label}
            </span>
            <span className={cn('text-[11px] font-medium', statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
            {task.description}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {/* Assignee */}
            <span className="inline-flex items-center gap-1 text-[11px] text-text-tertiary">
              <User className="w-3 h-3" aria-hidden="true" />
              {task.assignee}
            </span>

            {/* Due date */}
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px]',
                overdue ? 'text-red-400' : 'text-text-tertiary'
              )}
            >
              <Clock className="w-3 h-3" aria-hidden="true" />
              {overdue && 'Overdue: '}
              {formatDate(task.dueDate)}
            </span>

            {/* Related asset link */}
            <Link
              to={`/assets/${task.assetId}`}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              Asset {getAssetShortId(task.assetId)}
            </Link>
          </div>
        </div>

        {/* Actions */}
        {canResolve && (
          <button
            onClick={() => onMarkResolved(task.taskId)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            aria-label={`Mark task "${task.title}" as resolved`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Resolve
          </button>
        )}

        {/* Resolved indicator */}
        {task.status === 'resolved' && (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Resolved
          </span>
        )}
      </div>
    </div>
  );
}

export default TasksPage;
