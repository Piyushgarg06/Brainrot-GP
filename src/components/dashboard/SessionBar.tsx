'use client';

import type { F1DataState } from '@/types/f1';

interface SessionBarProps {
  f1State: F1DataState;
}

function formatSessionLabel(sessionType: string): string {
  const upper = sessionType.toUpperCase();
  if (upper.includes('RACE'))       return 'RACE';
  if (upper.includes('QUALIFYING')) return 'Q3';
  if (upper.includes('PRACTICE'))   return 'FP1';
  if (upper.includes('SPRINT'))     return 'SPRINT';
  return upper.slice(0, 4);
}

export function SessionBar({ f1State }: SessionBarProps) {
  const { session, positions, drivers, driverNumberMap, fastestLap, isLive, raceFinished } = f1State;

  const leader = positions[0];
  const leaderCode = leader
    ? (driverNumberMap[leader.driverNumber] ?? String(leader.driverNumber))
    : null;
  const leaderGap = 'LEADER';

  const sessionLabel = session ? formatSessionLabel(session.sessionType) : '---';
  const sessionName  = session ? session.sessionName : 'No Session';
  const circuitName  = session ? session.circuitName : '';

  return (
    <header
      style={{
        height:         '48px',
        borderBottom:   '1px solid var(--border)',
        padding:        '0 24px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexShrink:     0,
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* Left — speed-link back to home + session pill + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Sleek F1 Speeding back-link */}
        <a
          href="/"
          className="speed-back-link"
          aria-label="Back to landing page"
          title="Back to landing page"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--muted)',
            transition: 'color 0.2s, transform 0.2s',
          }}
        >
          <svg
            width="28"
            height="10"
            viewBox="0 0 40 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            {/* Mirror/Face left to represent "going back" */}
            <g transform="scale(-1, 1) translate(-40, 0)">
              <path d="M2 9 L5 5 L13 4 L17 2 L26 2 L32 4 L37 6 L38 9 Z" fill="currentColor" />
              <path d="M17 2 L19 0 L24 0 L26 2 Z" fill="currentColor" opacity="0.7" />
              <path d="M36 9 L40 9 L40 11 L36 10 Z" fill="currentColor" />
              <path d="M1 6 L0 6 L0 10 L2 10 Z" fill="currentColor" />
              <circle cx="31" cy="11" r="3" fill="currentColor" />
              <circle cx="9"  cy="11" r="3" fill="currentColor" />
            </g>
          </svg>
        </a>

        <span
          style={{
            backgroundColor: 'var(--surface-2)',
            border:          '1px solid var(--border)',
            borderRadius:    '2px',
            fontFamily:      'var(--font-mono)',
            fontSize:        '11px',
            color:           'var(--muted)',
            padding:         '3px 8px',
          }}
        >
          {sessionLabel}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize:   '13px',
            color:      'var(--muted)',
          }}
        >
          {circuitName || sessionName}
        </span>
      </div>

      <style>{`
        .speed-back-link:hover {
          color: var(--text) !important;
          transform: translateX(-4px);
        }
      `}</style>

      {/* Center — leader display */}
      <div
        style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '20px',
          fontWeight:    700,
          color:         'var(--text)',
          letterSpacing: '-0.02em',
          textAlign:     'center',
        }}
        aria-live="polite"
        aria-label={raceFinished ? 'Race finished' : (leaderCode ? `P1 leader: ${leaderCode}` : 'No data')}
      >
        {raceFinished
          ? <span style={{ fontSize: '16px', letterSpacing: '0.1em' }}>🏁 RACE FINISHED</span>
          : leaderCode
            ? `P1 · ${leaderCode} · ${leaderGap}`
            : isLive ? 'WAITING FOR DATA' : 'NO SESSION'}
      </div>

      {/* Right — fastest lap */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   '12px',
          color:      'var(--muted)',
          display:    'flex',
          alignItems: 'center',
          gap:        '6px',
        }}
        aria-label={fastestLap ? `Fastest lap: ${fastestLap.time} by ${fastestLap.driverCode}` : 'No fastest lap'}
      >
        {fastestLap ? (
          <>
            <span style={{ color: '#9B59B6' }}>⬣</span>
            <span>{fastestLap.time} · {fastestLap.driverCode}</span>
          </>
        ) : (
          <span>—</span>
        )}
      </div>
    </header>
  );
}
