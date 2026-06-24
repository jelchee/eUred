import { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import { createAuditEvent } from '@/lib/auditLogger';
import type { ReviewableItem, ReviewAction, ReviewStatus } from '@/types/workflow';

export interface ComplianceReviewPanelProps {
  assetId: string;
  className?: string;
}

const STATUS_STYLES: Record<ReviewStatus, { label: string; className: string }> = {
  pending_review: { label: 'Pending Review', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  approved: { label: 'Approved', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  changes_requested: { label: 'Changes Requested', className: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
};

const TYPE_LABELS: Record<ReviewableItem['type'], string> = {
  supplier_declaration: 'Supplier Declaration',
  document: 'Document',
  passport_attribute: 'Passport Attribute',
};

const TYPE_BADGE_STYLES: Record<ReviewableItem['type'], string> = {
  supplier_declaration: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  document: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  passport_attribute: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * ComplianceReviewPanel — Lists items pending compliance review for a selected asset.
 * Allows a reviewer to Approve, Reject, or Request Changes on each item.
 * Each action requires a non-empty comment and creates an audit trail event.
 *
 * Validates: Requirements FR-DI-009, FR-DI-014
 */
export function ComplianceReviewPanel({ assetId, className }: ComplianceReviewPanelProps) {
  const reviewQueue = useAppStore((s) => s.reviewQueue);
  const processReview = useAppStore((s) => s.processReview);
  const recalculateCompleteness = useAppStore((s) => s.recalculateCompleteness);
  const approveDeclaration = useAppStore((s) => s.approveDeclaration);
  const currentUser = useAppStore((s) => s.currentUser);
  const currentRole = useAppStore((s) => s.currentRole);

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{
    itemId: string;
    action: 'approve' | 'reject' | 'request_changes';
  } | null>(null);
  const [comment, setComment] = useState('');

  // Filter review queue for items associated with this asset
  const assetItems = useMemo(() => {
    return reviewQueue.filter(
      (item) =>
        item.content?.assetId === assetId ||
        item.itemId.includes(assetId)
    );
  }, [reviewQueue, assetId]);

  const pendingCount = useMemo(
    () => assetItems.filter((item) => item.status === 'pending_review').length,
    [assetItems]
  );

  const toggleExpand = (itemId: string) => {
    setExpandedItemId((prev) => (prev === itemId ? null : itemId));
    // Reset action state when collapsing
    if (expandedItemId === itemId) {
      setActiveAction(null);
      setComment('');
    }
  };

  const handleActionClick = (itemId: string, action: 'approve' | 'reject' | 'request_changes') => {
    if (activeAction?.itemId === itemId && activeAction.action === action) {
      setActiveAction(null);
      setComment('');
    } else {
      setActiveAction({ itemId, action });
      setComment('');
    }
  };

  const handleSubmitReview = (item: ReviewableItem) => {
    if (!activeAction || comment.trim() === '') return;

    const reviewer = currentUser?.name ?? 'Unknown Reviewer';
    const now = new Date().toISOString();

    const reviewAction: ReviewAction = {
      action: activeAction.action,
      reviewer,
      timestamp: now,
      comment: comment.trim(),
    };

    // Process the review in the workflow store
    processReview(item.itemId, reviewAction);

    // Handle specific actions
    if (activeAction.action === 'approve') {
      // If it's a supplier declaration, also approve in the supplier slice
      if (item.type === 'supplier_declaration' && item.content?.declarationId) {
        approveDeclaration(item.content.declarationId as string, comment.trim());
      }
      // Recalculate completeness after approval
      recalculateCompleteness(assetId, `compliance_review_approved: ${item.title}`);

      // Create audit event for approval
      createAuditEvent({
        action: 'COMPLIANCE_REVIEW_APPROVED',
        entityType: 'ASSET',
        entityId: item.itemId,
        actor: reviewer,
        actorRole: currentRole,
        reason: comment.trim(),
        dataSource: item.source,
        affectedFields: ['status', 'verifiedFields'],
      });
    } else if (activeAction.action === 'reject') {
      // Create audit event for rejection
      createAuditEvent({
        action: 'COMPLIANCE_REVIEW_REJECTED',
        entityType: 'ASSET',
        entityId: item.itemId,
        actor: reviewer,
        actorRole: currentRole,
        reason: comment.trim(),
        dataSource: item.source,
      });
    } else if (activeAction.action === 'request_changes') {
      // Create audit event for request changes
      createAuditEvent({
        action: 'COMPLIANCE_CHANGES_REQUESTED',
        entityType: 'ASSET',
        entityId: item.itemId,
        actor: reviewer,
        actorRole: currentRole,
        reason: comment.trim(),
        dataSource: item.source,
      });
    }

    // Reset UI state
    setActiveAction(null);
    setComment('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-text-primary">Compliance Review</h3>
        </div>
        <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
          {pendingCount} pending
        </span>
      </div>

      {/* Items list */}
      {assetItems.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          No items pending compliance review for this asset.
        </div>
      ) : (
        <div className="space-y-2">
          {assetItems.map((item) => {
            const isExpanded = expandedItemId === item.itemId;
            const statusInfo = STATUS_STYLES[item.status];

            return (
              <div
                key={item.itemId}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden"
              >
                {/* Card header — clickable to expand */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.itemId)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700/30 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`review-item-${item.itemId}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" aria-hidden="true" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-primary truncate">
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 text-[10px] font-medium border rounded shrink-0',
                          TYPE_BADGE_STYLES[item.type]
                        )}
                      >
                        {TYPE_LABELS[item.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" aria-hidden="true" />
                        {item.submittedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatDate(item.submittedAt)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'px-2 py-0.5 text-[10px] font-medium border rounded-full shrink-0',
                      statusInfo.className
                    )}
                  >
                    {statusInfo.label}
                  </span>
                </button>

                {/* Expandable content */}
                {isExpanded && (
                  <div
                    id={`review-item-${item.itemId}`}
                    className="border-t border-slate-700/50 p-3 space-y-3"
                  >
                    {/* Content preview */}
                    {item.content && Object.keys(item.content).length > 0 && (
                      <div className="bg-slate-900/50 rounded p-2">
                        <p className="text-[11px] text-text-tertiary mb-1 font-medium">Content</p>
                        <div className="text-xs text-text-secondary space-y-0.5">
                          {Object.entries(item.content)
                            .filter(([key]) => key !== 'assetId' && key !== 'declarationId')
                            .slice(0, 4)
                            .map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-text-tertiary capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="truncate">{String(value)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Linked document */}
                    {item.linkedDocumentId && (
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <FileText className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                        <span>Linked document: {item.linkedDocumentId}</span>
                      </div>
                    )}

                    {/* Review history timeline */}
                    {item.reviewHistory.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-text-tertiary font-medium">Review History</p>
                        <div className="relative pl-4 space-y-2">
                          {item.reviewHistory.length > 0 && (
                            <div
                              className="absolute left-[5px] top-1 bottom-1 w-px bg-slate-700"
                              aria-hidden="true"
                            />
                          )}
                          {item.reviewHistory.map((historyAction, idx) => (
                            <div key={idx} className="relative flex items-start gap-2">
                              <div
                                className={cn(
                                  'absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border border-slate-900',
                                  historyAction.action === 'approve' && 'bg-emerald-500',
                                  historyAction.action === 'reject' && 'bg-red-500',
                                  historyAction.action === 'request_changes' && 'bg-amber-500'
                                )}
                                aria-hidden="true"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="font-medium text-text-primary capitalize">
                                    {historyAction.action.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-text-tertiary">by {historyAction.reviewer}</span>
                                  <span className="text-text-tertiary">
                                    {formatDateTime(historyAction.timestamp)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
                                  {historyAction.comment}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review actions — only show for items still pending or with changes requested */}
                    {(item.status === 'pending_review' || item.status === 'changes_requested') && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleActionClick(item.itemId, 'approve')}
                            className={cn(
                              'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                              activeAction?.itemId === item.itemId && activeAction.action === 'approve'
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            )}
                          >
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Approve
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleActionClick(item.itemId, 'reject')}
                            className={cn(
                              'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                              activeAction?.itemId === item.itemId && activeAction.action === 'reject'
                                ? 'bg-red-600 text-white border-red-500'
                                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            )}
                          >
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              Reject
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleActionClick(item.itemId, 'request_changes')}
                            className={cn(
                              'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                              activeAction?.itemId === item.itemId && activeAction.action === 'request_changes'
                                ? 'bg-amber-600 text-white border-amber-500'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                            )}
                          >
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                              Request Changes
                            </span>
                          </button>
                        </div>

                        {/* Comment textarea — appears when an action is selected */}
                        {activeAction?.itemId === item.itemId && (
                          <div className="space-y-2">
                            <label
                              htmlFor={`review-comment-${item.itemId}`}
                              className="text-[11px] text-text-tertiary"
                            >
                              Comment (required)
                            </label>
                            <textarea
                              id={`review-comment-${item.itemId}`}
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder={
                                activeAction.action === 'approve'
                                  ? 'Provide approval justification...'
                                  : activeAction.action === 'reject'
                                    ? 'Provide rejection reason...'
                                    : 'Describe what changes are needed...'
                              }
                              rows={3}
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitReview(item)}
                              disabled={comment.trim() === ''}
                              className={cn(
                                'px-4 py-1.5 text-xs font-medium rounded-md transition-colors',
                                comment.trim() === ''
                                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                  : 'bg-cyan-600 text-white hover:bg-cyan-500'
                              )}
                            >
                              Submit Review
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
