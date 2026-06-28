'use client';

type ConnectionState = 'connected' | 'reconnecting' | 'error';

interface ConnectionStatusProps {
  state:       ConnectionState;
  lastUpdated: number;
}

export function ConnectionStatus({ state, lastUpdated }: ConnectionStatusProps) {
  const label = {
    connected:    'LIVE',
    reconnecting: 'RECONNECTING...',
    error:        'CONNECTION LOST',
  }[state];

  const dotColor = {
    connected:    'var(--green-pos)',
    reconnecting: 'var(--muted)',
    error:        '#E8002D',
  }[state];

  const isPulsing = state === 'connected';

  // "X seconds ago" for last update
  const ageSecs = lastUpdated > 0 ? Math.floor((Date.now() - lastUpdated) / 1000) : null;

  return (
    <div
      style={{
        position:   'fixed',
        bottom:     '16px',
        right:      '16px',
        display:    'flex',
        alignItems: 'center',
        gap:        '8px',
        zIndex:     50,
      }}
      aria-label={`Connection status: ${label}`}
      role="status"
    >
      {/* Dot */}
      <div
        style={{
          width:           '6px',
          height:          '6px',
          borderRadius:    '50%',
          backgroundColor: dotColor,
          animation:       isPulsing ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          flexShrink:      0,
        }}
        aria-hidden="true"
      />

      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   '11px',
          color:      'var(--muted)',
        }}
      >
        {label}
        {state === 'connected' && ageSecs !== null && ageSecs > 5 && (
          <span style={{ opacity: 0.6 }}> · {ageSecs}s ago</span>
        )}
      </span>
    </div>
  );
}
