'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { F1Position, F1DataState } from '@/types/f1';
import type { F1Event, EventType } from '@/types/events';
import { PRIORITY } from '@/lib/eventPriority';
import { DRIVERS } from '@/lib/drivers';

const MAX_QUEUE_DEPTH = 5;

// Cooldowns in milliseconds
const COOLDOWN_LEADER   = 30_000;
const COOLDOWN_FASTEST  = 10_000;
const COOLDOWN_POSITION = 20_000;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Resolve 3-letter code from live driverNumberMap (from OpenF1 API)
function resolveCode(driverNumber: number, map: Record<number, string>): string {
  return map[driverNumber] ?? String(driverNumber);
}

// Get driver last name for human-readable labels
function resolveLastName(code: string): string {
  const driver = DRIVERS[code];
  if (!driver) return code;
  return driver.name.split(' ').slice(1).join(' '); // everything after first name
}

interface CooldownMap {
  leader:   number;
  fastest:  number;
  position: Record<string, number>;
}

export function useEventQueue(
  f1State: F1DataState,
  favoriteDriverCode: string | null = null,
  onLocalEvent?: (event: F1Event) => void
) {
  const [queue,  setQueue]  = useState<F1Event[]>([]);
  const [toasts, setToasts] = useState<F1Event[]>([]);

  const prevPositionsRef  = useRef<F1Position[]>([]);
  const prev2PositionsRef = useRef<F1Position[]>([]);
  const cooldownRef       = useRef<CooldownMap>({
    leader:   0,
    fastest:  0,
    position: {},
  });
  const winnerFiredRef    = useRef(false);
  const prevFastestRef    = useRef<string | null>(null);

  // ── Main event detection — runs when positions or session changes ──
  useEffect(() => {
    const now = Date.now();
    const { positions, session, driverNumberMap } = f1State;

    if (positions.length === 0) return;

    const newEvents: F1Event[] = [];

    // ── Winner detection ─────────────────────────────────────────
    if (
      !winnerFiredRef.current &&
      session !== null &&
      session.dateEnd !== null &&
      new Date(session.dateEnd.endsWith('Z') ? session.dateEnd : session.dateEnd + 'Z').getTime() < now
    ) {
      winnerFiredRef.current = true;
      const winner = positions[0];
      if (winner) {
        const code = resolveCode(winner.driverNumber, driverNumberMap);
        newEvents.push({
          id:         generateId(),
          type:       'WINNER' as EventType,
          driverCode: code,
          priority:   PRIORITY.WINNER,
          label:      `Winner — ${resolveLastName(code)}`,
          timestamp:  now,
        });
      }
    }

    // ── Leader change ────────────────────────────────────────────
    const prevLeader = prevPositionsRef.current[0];
    const currLeader = positions[0];
    if (
      currLeader !== undefined &&
      prevLeader !== undefined &&
      currLeader.driverNumber !== prevLeader.driverNumber &&
      now - cooldownRef.current.leader > COOLDOWN_LEADER
    ) {
      cooldownRef.current.leader = now;
      const code = resolveCode(currLeader.driverNumber, driverNumberMap);
      newEvents.push({
        id:         generateId(),
        type:       'LEADER' as EventType,
        driverCode: code,
        priority:   PRIORITY.LEADER,
        label:      `${resolveLastName(code)} takes P1`,
        timestamp:  now,
      });
    }

    // ── Position gain detection ────────────────────────────────
    // Regular threshold: ≥3 positions
    // Favorite driver:   ≥1 position (any overtake)
    const twoPolls = prev2PositionsRef.current;
    if (twoPolls.length > 0) {
      const prevPosMap = new Map<number, number>();
      for (const p of twoPolls) prevPosMap.set(p.driverNumber, p.position);

      for (const curr of positions) {
        const prevPos = prevPosMap.get(curr.driverNumber);
        if (prevPos === undefined) continue;
        const gain = prevPos - curr.position;
        if (gain <= 0) continue;

        const code        = resolveCode(curr.driverNumber, driverNumberMap);
        const isFavorite  = favoriteDriverCode !== null && code === favoriteDriverCode;
        const threshold   = isFavorite ? 1 : 3;
        if (gain < threshold) continue;

        const lastFired = cooldownRef.current.position[code] ?? 0;
        if (now - lastFired < COOLDOWN_POSITION) continue;

        cooldownRef.current.position[code] = now;
        newEvents.push({
          id:         generateId(),
          type:       'POSITION' as EventType,
          driverCode: code,
          priority:   isFavorite ? PRIORITY.LEADER : PRIORITY.POSITION,
          label:      `${resolveLastName(code)} +${gain}`,
          timestamp:  now,
        });
      }
    }

    // Advance position history
    prev2PositionsRef.current = prevPositionsRef.current;
    prevPositionsRef.current  = positions;

    if (newEvents.length === 0) return;

    setQueue(prev => {
      const merged = [...prev, ...newEvents].sort((a, b) => b.priority - a.priority);
      return merged.slice(0, MAX_QUEUE_DEPTH);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f1State.positions, f1State.session]);

  // ── Fastest lap detection ──────────────────────────────────────
  useEffect(() => {
    if (!f1State.fastestLap) return;
    const { driverCode, time } = f1State.fastestLap;
    if (driverCode === prevFastestRef.current) return;
    prevFastestRef.current = driverCode;

    const now = Date.now();
    if (now - cooldownRef.current.fastest < COOLDOWN_FASTEST) return;
    cooldownRef.current.fastest = now;

    setQueue(prev => {
      const isFavorite = favoriteDriverCode !== null && driverCode === favoriteDriverCode;
      const event: F1Event = {
        id:         generateId(),
        type:       'FASTEST' as EventType,
        driverCode,
        priority:   isFavorite ? PRIORITY.LEADER : PRIORITY.FASTEST,
        label:      `Fastest Lap — ${resolveLastName(driverCode)} ${time}`,
        timestamp:  now,
      };
      return [...prev, event].sort((a, b) => b.priority - a.priority).slice(0, MAX_QUEUE_DEPTH);
    });
  }, [f1State.fastestLap]);

  // ── Drain queue head into toasts ──────────────────────────────
  useEffect(() => {
    if (queue.length === 0) return;
    const [head, ...rest] = queue;
    setQueue(rest);
    setToasts(prev => [head, ...prev].slice(0, 3));
    if (onLocalEvent) {
      onLocalEvent(head);
    }
  }, [queue, onLocalEvent]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Inject an event directly into the toast list.
   * Used by: BroadcastChannel (remote tab events) and the test button.
   * Skips the queue — shows immediately, capped at 3 visible.
   */
  const injectToast = useCallback((event: F1Event) => {
    console.log('[useEventQueue] injectToast called with event:', event);
    setToasts(prev => {
      const next = [event, ...prev].slice(0, 3);
      console.log('[useEventQueue] next toasts state:', next);
      return next;
    });
  }, []);

  return { toasts, queue, dismissToast, injectToast };
}
