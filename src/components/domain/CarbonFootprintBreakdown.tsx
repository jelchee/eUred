import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/cn';
import { DemoDisclaimer } from '@/components/shared/DemoDisclaimer';
import type { CarbonLifecycleStage } from '@/types';

interface CarbonFootprintBreakdownProps {
  data: CarbonLifecycleStage[];
  totalKgCO2e: number;
  className?: string;
}

const STAGE_COLORS: Record<string, string> = {
  'raw materials': '#00D4FF',
  'cell manufacturing': '#34D399',
  'module assembly': '#F59E0B',
  'system assembly': '#A78BFA',
  logistics: '#FB923C',
  'operation estimate': '#38BDF8',
  'end-of-life estimate': '#F87171',
};

const DEFAULT_COLORS = [
  '#00D4FF',
  '#34D399',
  '#F59E0B',
  '#A78BFA',
  '#FB923C',
  '#38BDF8',
  '#F87171',
  '#818CF8',
];

function getStageColor(stage: string, index: number): string {
  const normalized = stage.toLowerCase();
  return STAGE_COLORS[normalized] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export function CarbonFootprintBreakdown({
  data,
  totalKgCO2e,
  className,
}: CarbonFootprintBreakdownProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Total prominently displayed */}
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Total Product Carbon Footprint
        </p>
        <p className="mt-1 font-mono text-2xl font-bold text-slate-100 tabular-nums">
          {totalKgCO2e.toLocaleString()}
          <span className="ml-1 text-sm font-normal text-slate-400">
            kgCO₂e
          </span>
        </p>
      </div>

      {/* Pie chart */}
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="h-48 w-48 shrink-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="kgCO2e"
                nameKey="stage"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                strokeWidth={1}
                stroke="#0D1321"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.stage}
                    fill={getStageColor(entry.stage, index)}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A2332',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F1F5F9',
                }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} kgCO₂e`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / breakdown list */}
        <ul className="flex-1 space-y-2" aria-label="Carbon footprint by lifecycle stage">
          {data.map((stage, index) => (
            <li
              key={stage.stage}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getStageColor(stage.stage, index) }}
                  aria-hidden="true"
                />
                <span className="text-slate-300">{stage.stage}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-slate-400">
                  {stage.percentage}%
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-200">
                  {stage.kgCO2e.toLocaleString()} kgCO₂e
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <DemoDisclaimer variant="inline" className="justify-center" />
      <p className="text-center text-[11px] text-amber-500/60">
        Demo values — not externally verified
      </p>
    </div>
  );
}
