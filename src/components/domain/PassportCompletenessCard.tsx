import React, { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import type { PassportCompletenessScore, ScoreSnapshot } from '@/types';

export interface PassportCompletenessCardProps {
  assetId: string;
  className?: string;
}

/** Color thresholds for the overall score */
function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-cyan-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-emerald-400';
  if (score >= 75) return 'bg-cyan-400';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function getScoreTrackColor(score: number): string {
  if (score >= 90) return 'bg-emerald-400/20';
  if (score >= 75) return 'bg-cyan-400/20';
  if (score >= 50) return 'bg-amber-400/20';
  return 'bg-red-400/20';
}

function getScoreStrokeColor(score: number): string {
  if (score >= 90) return '#34D399';
  if (score >= 75) return '#22D3EE';
  if (score >= 50) return '#FBBF24';
  return '#EF4444';
}

/** Trend indicator component */
function TrendIndicator({ trend }: { trend: PassportCompletenessScore['trend'] }) {
  switch (trend) {
    case 'improving':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          Improving
        </span>
      );
    case 'declining':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          Declining
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
          Stable
        </span>
      );
  }
}

/** Mini trend chart tooltip */
function MiniChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded border border-border-emphasis bg-background-elevated px-2 py-1 text-xs text-text-primary shadow-elevated">
      {payload[0].value}%
    </div>
  );
}

/**
 * PassportCompletenessCard — Shows overall passport completeness score,
 * section breakdown, blockers, pending reviews, trend, and a mini chart.
 *
 * @validates FR-DI-010 — Completeness scoring with section breakdown
 */
export const PassportCompletenessCard: React.FC<PassportCompletenessCardProps> = ({
  assetId,
  className,
}) => {
  const completenessData = useAppStore((s) => s.completenessScores[assetId]);
  const recalculateCompleteness = useAppStore((s) => s.recalculateCompleteness);

  // Track previous score to detect ≥5 point improvements
  const previousScoreRef = useRef<number | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  useEffect(() => {
    if (!completenessData) return;

    const currentScore = completenessData.overallScore;
    if (previousScoreRef.current !== null) {
      const scoreDiff = currentScore - previousScoreRef.current;
      if (scoreDiff >= 5) {
        setToast({
          message: `Score improved by +${Math.round(scoreDiff)} points!`,
          visible: true,
        });
        // Auto-dismiss toast after 4 seconds
        const timer = setTimeout(() => {
          setToast((prev) => ({ ...prev, visible: false }));
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
    previousScoreRef.current = currentScore;
  }, [completenessData]);

  // If no completeness data exists, show placeholder
  if (!completenessData) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border-default bg-background-elevated p-6',
          className
        )}
      >
        <h3 className="text-sm font-semibold text-text-primary mb-3">Passport Completeness</h3>
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-text-tertiary">Not yet calculated</p>
          <button
            onClick={() => recalculateCompleteness(assetId, 'manual_calculation')}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500"
          >
            Calculate
          </button>
        </div>
      </div>
    );
  }

  const {
    overallScore,
    sectionScores,
    pendingReviewFields,
    trend,
    scoreHistory,
  } = completenessData;

  // Collect all blockers from all sections
  const allBlockers = sectionScores.flatMap((s) => s.blockers);

  // Last 5 score snapshots for the mini chart
  const chartData: ScoreSnapshot[] = scoreHistory.slice(-5);

  return (
    <div
      className={cn(
        'rounded-xl border border-border-default bg-background-elevated p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Passport Completeness</h3>
        <TrendIndicator trend={trend} />
      </div>

      {/* Score Improvement Toast */}
      {toast.visible && (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-400/15 border border-emerald-400/30 px-3 py-2 animate-in fade-in slide-in-from-top-1"
          role="status"
          aria-live="polite"
        >
          <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-xs font-medium text-emerald-400">{toast.message}</span>
        </div>
      )}

      {/* Overall Score Gauge */}
      <div className="mb-5 flex flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Circular progress ring */}
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              strokeWidth="8"
              className="stroke-slate-700/50"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              strokeWidth="8"
              stroke={getScoreStrokeColor(overallScore)}
              strokeLinecap="round"
              strokeDasharray={`${(overallScore / 100) * 251.3} 251.3`}
            />
          </svg>
          <span className={cn('absolute text-xl font-bold', getScoreColor(overallScore))}>
            {overallScore}%
          </span>
        </div>
      </div>

      {/* Section Breakdown */}
      {sectionScores.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Section Breakdown
          </h4>
          <div className="space-y-2">
            {sectionScores.map((section) => (
              <div key={section.section} className="flex items-center gap-2">
                <span className="w-28 truncate text-xs text-text-secondary capitalize">
                  {section.section.replace(/_/g, ' ')}
                </span>
                <div className={cn('h-2 flex-1 rounded-full', getScoreTrackColor(section.score))}>
                  <div
                    className={cn('h-2 rounded-full transition-all', getScoreBgColor(section.score))}
                    style={{ width: `${section.score}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-text-tertiary">
                  {section.completedCount}/{section.totalCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {allBlockers.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Blockers
          </h4>
          <ul className="space-y-1">
            {allBlockers.slice(0, 5).map((blocker, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-red-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {blocker}
              </li>
            ))}
            {allBlockers.length > 5 && (
              <li className="text-xs text-text-tertiary">
                +{allBlockers.length - 5} more…
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Pending Reviews */}
      {pendingReviewFields > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-400/10 px-3 py-2">
          <span className="text-xs text-amber-400">Pending Review</span>
          <span className="text-sm font-semibold text-amber-400">{pendingReviewFields}</span>
        </div>
      )}

      {/* Mini Trend Chart */}
      {chartData.length >= 2 && (
        <div className="mt-3">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Score Trend
          </h4>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<MiniChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={getScoreStrokeColor(overallScore)}
                  fill={`${getScoreStrokeColor(overallScore)}20`}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassportCompletenessCard;
