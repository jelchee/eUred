import { Info } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DemoDisclaimerProps {
  variant?: 'badge' | 'banner' | 'inline';
  className?: string;
}

export function DemoDisclaimer({
  variant = 'badge',
  className,
}: DemoDisclaimerProps) {
  if (variant === 'badge') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20',
          className
        )}
        role="status"
        aria-label="Demo Mode"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
        Demo Mode — Synthetic Data
      </span>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5',
          className
        )}
        role="status"
        aria-label="Demo Mode Banner"
      >
        <Info className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-xs text-amber-300">
          <span className="font-medium">Demo Mode</span> — All data shown is
          synthetic and for demonstration purposes only. No real battery data is
          displayed.
        </p>
      </div>
    );
  }

  // inline variant
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] text-amber-500/70',
        className
      )}
      role="status"
      aria-label="Demo data disclaimer"
    >
      <Info className="h-3 w-3" aria-hidden="true" />
      Synthetic demo data
    </span>
  );
}
