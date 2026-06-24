import type { StateCreator } from 'zustand';
import type {
  PassportCompletenessScore,
  PublishStep,
  ReviewableItem,
  ReviewAction,
  NewLifecycleEvent,
} from '@/types';

// ============================================================
// WORKFLOW SLICE
// ============================================================

export interface WorkflowSlice {
  // Completeness scoring
  completenessScores: Record<string, PassportCompletenessScore>;
  recalculateCompleteness: (assetId: string, trigger?: string) => void;

  // Passport publishing
  publishingState: Record<string, PublishStep>;
  startPublishWorkflow: (passportId: string) => void;
  completePublish: (passportId: string) => void;
  cancelPublish: (passportId: string) => void;

  // Review queue
  reviewQueue: ReviewableItem[];
  addToReviewQueue: (item: ReviewableItem) => void;
  processReview: (itemId: string, action: ReviewAction) => void;

  // Lifecycle events (new entries)
  lifecycleEvents: NewLifecycleEvent[];
  addLifecycleEvent: (event: NewLifecycleEvent) => void;
}

export const createWorkflowSlice: StateCreator<
  WorkflowSlice,
  [['zustand/immer', never]],
  [],
  WorkflowSlice
> = (set, get) => ({
  // Completeness scoring
  completenessScores: {},

  recalculateCompleteness: (assetId: string, trigger?: string) => {
    set((state) => {
      const existing = state.completenessScores[assetId];
      const now = new Date().toISOString();
      const triggerDescription = trigger ?? 'manual_recalculation';

      if (existing) {
        // Recalculate — in a real app this would reference other slices via get()
        // For the demo, bump the score slightly and update timestamp
        const previousScore = existing.overallScore;
        const newScore = Math.min(100, previousScore + 1);
        existing.overallScore = newScore;
        existing.lastUpdated = now;
        existing.scoreHistory.push({ timestamp: now, score: newScore, trigger: triggerDescription });
        existing.trend = newScore > previousScore ? 'improving' : 'stable';
      } else {
        // Initialize a new completeness score for the asset
        state.completenessScores[assetId] = {
          assetId,
          overallScore: 0,
          sectionScores: [],
          completedFields: 0,
          totalRequiredFields: 40,
          verifiedFields: 0,
          pendingReviewFields: 0,
          lastUpdated: now,
          trend: 'stable',
          scoreHistory: [{ timestamp: now, score: 0, trigger: triggerDescription || 'initial_calculation' }],
        };
      }
    });
  },

  // Passport publishing
  publishingState: {},

  startPublishWorkflow: (passportId: string) => {
    set((state) => {
      state.publishingState[passportId] = 'readiness_check';
    });
  },

  completePublish: (passportId: string) => {
    set((state) => {
      state.publishingState[passportId] = 'published';
    });
  },

  cancelPublish: (passportId: string) => {
    set((state) => {
      delete state.publishingState[passportId];
    });
  },

  // Review queue
  reviewQueue: [],

  addToReviewQueue: (item: ReviewableItem) => {
    set((state) => {
      state.reviewQueue.push(item);
    });
  },

  processReview: (itemId: string, action: ReviewAction) => {
    set((state) => {
      const item = state.reviewQueue.find((i) => i.itemId === itemId);
      if (item) {
        item.reviewHistory.push(action);
        switch (action.action) {
          case 'approve':
            item.status = 'approved';
            break;
          case 'reject':
            item.status = 'rejected';
            break;
          case 'request_changes':
            item.status = 'changes_requested';
            break;
        }
      }
    });

    // After approval, recalculate completeness for linked asset if available
    if (action.action === 'approve') {
      const state = get() as unknown as { reviewQueue: ReviewableItem[]; recalculateCompleteness: (id: string, trigger?: string) => void };
      const item = state.reviewQueue.find((i: ReviewableItem) => i.itemId === itemId);
      if (item && item.content?.assetId) {
        state.recalculateCompleteness(
          item.content.assetId as string,
          `compliance_review_approved: ${item.title}`
        );
      }
    }
  },

  // Lifecycle events
  lifecycleEvents: [],

  addLifecycleEvent: (event: NewLifecycleEvent) => {
    set((state) => {
      state.lifecycleEvents.push(event);
    });
  },
});
