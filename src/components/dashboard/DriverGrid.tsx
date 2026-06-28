'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { F1DataState, F1Position } from '@/types/f1';
import { DRIVERS } from '@/lib/drivers';
import { springs } from '@/lib/springs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface DriverGridProps {
  f1State:           F1DataState;
  fastestDriverCode: string | null;
  activeEventCode:   string | null;
  favoriteDriverCode: string | null;
}

function formatGap(position: number, gap: number | null): string {
  if (position === 1) return 'LEADER';
  if (gap === null)   return '—';
  return `+${gap.toFixed(3)}`;
}

interface RowData {
  driverNumber:  number;
  code:          string;
  position:      number;
  teamColor:     string;
  gap:           number | null;
  isP1:          boolean;
  isFastest:     boolean;
  isEventActive: boolean;
  isFavorite:    boolean;
}

export function DriverGrid({ f1State, fastestDriverCode, activeEventCode, favoriteDriverCode }: DriverGridProps) {
  const { positions, driverNumberMap, drivers } = f1State;
  const reduced = usePrefersReducedMotion();

  // Track previous gap values to animate changes
  const prevGapsRef = useRef<Record<string, number | null>>({});
  const [changedCodes, setChangedCodes] = useState<Set<string>>(new Set());

  const rows: RowData[] = positions.map((pos, idx) => {
    const code = driverNumberMap[pos.driverNumber] ?? String(pos.driverNumber);
    const localDriver  = DRIVERS[code];
    const apiDriver    = drivers[String(pos.driverNumber)];
    const teamColor    = localDriver?.teamColor
      ?? (apiDriver?.teamColour ? `#${apiDriver.teamColour}` : 'var(--muted)');

    // Compute gap: time to P1 from position deltas (simplified — use index gap)
    // In real data, gap would come from interval endpoint; here we use position rank
    const gap: number | null = idx === 0 ? null : null; // real gap from API not available in position endpoint

    return {
      driverNumber:  pos.driverNumber,
      code,
      position:      pos.position,
      teamColor,
      gap,
      isP1:          pos.position === 1,
      isFastest:     code === fastestDriverCode,
      isEventActive: code === activeEventCode,
      isFavorite:    code === favoriteDriverCode,
    };
  });

  // Detect gap changes for color animation
  useEffect(() => {
    const newChanged = new Set<string>();
    for (const row of rows) {
      const prev = prevGapsRef.current[row.code];
      if (prev !== undefined && prev !== row.gap) {
        newChanged.add(row.code);
      }
    }
    prevGapsRef.current = Object.fromEntries(rows.map(r => [r.code, r.gap]));

    if (newChanged.size > 0) {
      setChangedCodes(newChanged);
      const t = setTimeout(() => setChangedCodes(new Set()), 2000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding:    '24px',
          fontFamily: 'var(--font-mono)',
          fontSize:   '12px',
          color:      'var(--muted)',
        }}
      >
        {/* Skeleton rows */}
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              height:       '44px',
              borderBottom: '1px solid var(--border)',
              display:      'flex',
              alignItems:   'center',
              gap:          '16px',
            }}
          >
            <div
              style={{
                width:           '32px',
                height:          '12px',
                backgroundColor: 'var(--surface-2)',
                borderRadius:    '2px',
              }}
            />
            <div
              style={{
                width:           '48px',
                height:          '16px',
                backgroundColor: 'var(--surface-2)',
                borderRadius:    '2px',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="Driver standings"
      style={{ overflow: 'hidden' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {rows.map(row => (
          <motion.div
            key={row.driverNumber}
            layoutId={`driver-row-${row.driverNumber}`}
            layout
            role="listitem"
            transition={reduced ? { duration: 0 } : springs.snappy}
            style={{
              height:          '44px',
              borderBottom:    '1px solid var(--border)',
              display:         'flex',
              alignItems:      'center',
              paddingLeft:     '8px',
              paddingRight:    '24px',
              gap:             '12px',
              backgroundColor: row.isP1 ? 'var(--surface)' : 'transparent',
              animation:       row.isEventActive ? 'row-flash 0.3s ease-out' : 'none',
              position:        'relative',
              cursor:          'default',
            }}
          >
            {/* Left team color border */}
            <div
              style={{
                position:        'absolute',
                left:            0,
                top:             0,
                bottom:          0,
                width:           '2px',
                backgroundColor: row.teamColor,
                flexShrink:      0,
              }}
            />

            {/* Position */}
            <span
              style={{
                fontFamily:  'var(--font-mono)',
                fontSize:    '13px',
                color:       'var(--muted)',
                width:       '32px',
                flexShrink:  0,
                paddingLeft: '8px',
              }}
            >
              P{row.position}
            </span>

            {/* Driver code */}
            <span
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '16px',
                fontWeight:    700,
                color:         'var(--text)',
                letterSpacing: '-0.02em',
                flexShrink:    0,
              }}
            >
              {row.code}
            </span>

            {/* Fastest lap indicator */}
            {row.isFastest && (
              <span
                style={{
                  color:      '#9B59B6',
                  fontSize:   '12px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                aria-label="Fastest lap"
              >
                ⬣
              </span>
            )}

            {/* Favorite driver star */}
            {row.isFavorite && (
              <span
                style={{
                  color:      row.teamColor,
                  fontSize:   '10px',
                  lineHeight: 1,
                  flexShrink: 0,
                  opacity:    0.9,
                }}
                aria-label="Your driver"
                title="Your driver"
              >
                ★
              </span>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Gap to leader */}
            <span
              style={{
                fontFamily:  'var(--font-mono)',
                fontSize:    '12px',
                color:       changedCodes.has(row.code) ? 'var(--accent)' : 'var(--muted)',
                transition:  'color 2s ease-out',
                flexShrink:  0,
              }}
            >
              {formatGap(row.position, row.gap)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
