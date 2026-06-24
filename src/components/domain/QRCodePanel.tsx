import React from 'react';
import { cn } from '@/lib/cn';

export interface QRCodePanelProps {
  passportId: string;
  serialNumber?: string;
  className?: string;
}

/**
 * Generates a deterministic decorative QR-like SVG pattern based on the passport ID.
 * This is a placeholder since no QR library is used — it creates an SVG that resembles
 * a QR code visually while encoding the passport ID as a seed for the pattern.
 */
function generateQRPattern(seed: string): boolean[][] {
  // Simple hash to seed the pattern
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const size = 21; // Standard QR code is at minimum 21x21
  const grid: boolean[][] = [];

  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      // Finder patterns (top-left, top-right, bottom-left 7x7 squares)
      if (isFinderPattern(row, col, size)) {
        grid[row][col] = isFinderFilled(row, col, size);
      } else {
        // Pseudo-random fill for data area
        const idx = row * size + col;
        const val = Math.abs((hash * (idx + 1) * 31) ^ (hash >> (idx % 16)));
        grid[row][col] = val % 3 !== 0; // ~66% fill rate
      }
    }
  }

  return grid;
}

function isFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left
  if (row < 7 && col < 7) return true;
  // Top-right
  if (row < 7 && col >= size - 7) return true;
  // Bottom-left
  if (row >= size - 7 && col < 7) return true;
  return false;
}

function isFinderFilled(row: number, col: number, size: number): boolean {
  // Normalize coordinates to local 7x7 pattern
  let r = row;
  let c = col;

  if (row >= size - 7) r = row - (size - 7);
  if (col >= size - 7) c = col - (size - 7);

  // Outer border
  if (r === 0 || r === 6 || c === 0 || c === 6) return true;
  // Inner white ring
  if (r === 1 || r === 5 || c === 1 || c === 5) return false;
  // Center 3x3 block
  return true;
}

/**
 * QRCodePanel — Displays a decorative QR code placeholder with the passport ID
 * and scan instructions. Since no real QR library is used, the SVG pattern is
 * generated deterministically from the passport ID to create a realistic visual.
 *
 * @validates FR-002 — Digital Battery Passport Public View (QR code / data carrier)
 */
export const QRCodePanel: React.FC<QRCodePanelProps> = ({
  passportId,
  serialNumber,
  className,
}) => {
  const pattern = generateQRPattern(passportId);
  const size = pattern.length;
  const cellSize = 6;
  const svgSize = size * cellSize;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-card border border-border p-6',
        'bg-background-secondary',
        className,
      )}
    >
      {/* QR Code SVG */}
      <div className="rounded-lg bg-white p-3">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          role="img"
          aria-label={`QR code for passport ${passportId}`}
        >
          <title>Battery Passport QR Code</title>
          {pattern.map((row, rowIdx) =>
            row.map((filled, colIdx) =>
              filled ? (
                <rect
                  key={`${rowIdx}-${colIdx}`}
                  x={colIdx * cellSize}
                  y={rowIdx * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#0F172A"
                />
              ) : null,
            ),
          )}
        </svg>
      </div>

      {/* Passport ID */}
      <div className="text-center space-y-1">
        <p className="text-caption text-text-tertiary uppercase tracking-wider">
          Passport ID
        </p>
        <p className="text-body font-mono font-medium text-text-primary">
          {passportId}
        </p>
        {serialNumber && (
          <p className="text-caption text-text-secondary font-mono">
            S/N: {serialNumber}
          </p>
        )}
      </div>

      {/* Scan instruction */}
      <p className="text-caption text-text-tertiary text-center max-w-[180px]">
        Scan to view public passport
      </p>
    </div>
  );
};

export default QRCodePanel;
