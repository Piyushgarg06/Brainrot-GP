'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { F1Event, EventType } from '@/types/events';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const TOAST_DISMISS_MS = 5000;

const EVENT_META: Record<EventType, { emoji: string; label: string; color: string }> = {
  LEADER:   { emoji: '👑', label: 'LEADER CHANGE',  color: 'var(--accent)' },
  FASTEST:  { emoji: '🟣', label: 'FASTEST LAP',    color: '#9B59B6'       },
  POSITION: { emoji: '📈', label: 'POSITION GAIN',  color: '#27AE60'       },
  WINNER:   { emoji: '🏆', label: 'RACE WINNER',    color: '#F1C40F'       },
};

interface EventToastProps {
  toasts:        F1Event[];
  onDismiss:     (id: string) => void;
}

function Toast({
  event,
  onDismiss,
}: {
  event:     F1Event;
  onDismiss: (id: string) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const meta    = EVENT_META[event.type];

  // Auto-dismiss after 5s
  useEffect(() => {
    const t = setTimeout(() => onDismiss(event.id), TOAST_DISMISS_MS);
    return () => clearTimeout(t);
  }, [event.id, onDismiss]);

  const enterVariant  = reduced ? {} : { x: 320, opacity: 0 };
  const centerVariant = reduced ? {} : { x: 0,   opacity: 1 };
  const exitVariant   = reduced ? {} : { x: 320, opacity: 0 };

  return (
    <motion.div
      key={event.id}
      initial={enterVariant}
      animate={centerVariant}
      exit={exitVariant}
      transition={
        reduced
          ? { duration: 0 }
          : { type: 'spring', stiffness: 300, damping: 30 }
      }
      style={{
        width:           '280px',
        backgroundColor: 'var(--surface-2)',
        border:          '1px solid var(--border)',
        borderRadius:    '2px',
        borderLeft:      `3px solid ${meta.color}`,
        padding:         '12px 16px',
        display:         'flex',
        flexDirection:   'column',
        gap:             '4px',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Top row — event type label */}
      <div
        style={{
          fontFamily:    'var(--font-body)',
          fontSize:      '11px',
          color:         'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display:       'flex',
          alignItems:    'center',
          gap:           '6px',
        }}
      >
        <span>{meta.emoji}</span>
        <span>{meta.label}</span>
      </div>

      {/* Bottom row — driver label */}
      <div
        style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '18px',
          fontWeight:    700,
          color:         'var(--text)',
          letterSpacing: '-0.02em',
        }}
      >
        {event.label}
      </div>
    </motion.div>
  );
}

export function EventToast({ toasts, onDismiss }: EventToastProps) {
  return (
    <div
      style={{
        position:      'fixed',
        top:           '64px',    // below session bar (48px) + 16px gap
        right:         '16px',
        zIndex:        100,
        display:       'flex',
        flexDirection: 'column',
        gap:           '8px',
        pointerEvents: 'none',
      }}
      aria-label="Live race events"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(event => (
          <Toast key={event.id} event={event} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
