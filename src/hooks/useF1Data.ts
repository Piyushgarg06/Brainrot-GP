'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { F1DataState, F1Position, F1Driver } from '@/types/f1';
import {
  getLatestSession,
  getPositions,
  getLaps,
  getDrivers,
} from '@/lib/f1Client';

const BACKOFF_STEPS = [2000, 4000, 8000, 16000, 30000];
const POLL_ACTIVE   = 2000;
const POLL_INACTIVE = 10000;

function isSessionLive(dateStart: string, dateEnd: string | null): boolean {
  const now   = Date.now();
  const start = new Date(dateStart).getTime();
  const end   = dateEnd ? new Date(dateEnd).getTime() : null;
  if (now < start) return false;
  if (end !== null && now > end + 60_000) return false;
  return true;
}

function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${mins}:${secs}`;
}

const initialState: F1DataState = {
  session:         null,
  positions:       [],
  drivers:         {},
  driverNumberMap: {},   // built from OpenF1 /drivers — driverNumber → nameAcronym
  fastestLap:      null,
  isLive:          false,
  lastUpdated:     0,
  error:           null,
};

export function useF1Data() {
  const [state, setState] = useState<F1DataState>(initialState);

  const backoffIndexRef     = useRef(0);
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef       = useRef(false);
  const lastPollDateRef     = useRef<string | null>(null);
  const tabVisibleRef       = useRef(true);
  const bestLapTimeRef      = useRef<number | null>(null);
  const driversFetchedRef   = useRef(false);   // fetch drivers once per session

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback((delayMs: number, fn: () => void) => {
    clearTimer();
    timerRef.current = setTimeout(fn, delayMs);
  }, [clearTimer]);

  const poll = useCallback(async () => {
    if (isFetchingRef.current || !tabVisibleRef.current) return;
    isFetchingRef.current = true;

    try {
      // ── 1. Get / refresh session ─────────────────────────────
      const session = await getLatestSession();
      const isLive  = session
        ? isSessionLive(session.dateStart, session.dateEnd)
        : false;

      if (!session) {
        backoffIndexRef.current = 0;
        setState(prev => ({ ...prev, session: null, isLive: false, error: null }));
        isFetchingRef.current = false;
        scheduleNext(POLL_INACTIVE, poll);
        return;
      }

      const key = session.sessionKey;

      // Reset driver fetch flag if session changed
      setState(prev => {
        if (prev.session?.sessionKey !== key) {
          driversFetchedRef.current = false;
          lastPollDateRef.current   = null;
          bestLapTimeRef.current    = null;
        }
        return prev;
      });

      // ── 2. Fetch drivers once per session ────────────────────
      // nameAcronym from OpenF1 is the 3-letter code (VER, NOR, etc.)
      // Use it to build driverNumberMap: driverNumber → nameAcronym
      let currentDriverMap: Record<string, F1Driver>  = {};
      let currentNumberMap: Record<number, string>    = {};

      if (!driversFetchedRef.current) {
        const driverList = await getDrivers(key);
        for (const d of driverList) {
          currentDriverMap[String(d.driverNumber)] = d;
          // nameAcronym IS the driver code (VER, HAM, NOR…)
          if (d.nameAcronym) {
            currentNumberMap[d.driverNumber] = d.nameAcronym;
          }
        }
        driversFetchedRef.current = true;
      } else {
        // Use existing maps from state without re-fetching
        setState(prev => {
          currentDriverMap = prev.drivers;
          currentNumberMap = prev.driverNumberMap;
          return prev;
        });
      }

      // ── 3. Fetch positions (incremental after first poll) ────
      const rawPositions = await getPositions(key, lastPollDateRef.current);

      // ── 4. Fetch laps (incremental) ─────────────────────────
      const laps = await getLaps(key, lastPollDateRef.current);

      // Advance the poll date cursor
      lastPollDateRef.current = new Date().toISOString();

      // ── 5. Compute fastest lap ───────────────────────────────
      let fastestLapUpdate: { driverCode: string; time: string } | null = null;
      for (const lap of laps) {
        if (lap.lapDuration === null) continue;
        if (bestLapTimeRef.current === null || lap.lapDuration < bestLapTimeRef.current) {
          bestLapTimeRef.current = lap.lapDuration;
          // Use live driverNumberMap to resolve code
          const code = currentNumberMap[lap.driverNumber]
            ?? currentDriverMap[String(lap.driverNumber)]?.nameAcronym
            ?? String(lap.driverNumber);
          fastestLapUpdate = { driverCode: code, time: formatLapTime(lap.lapDuration) };
        }
      }

      // Reset backoff on success
      backoffIndexRef.current = 0;

      setState(prev => {
        // Merge positions — keep latest entry per driver
        const positionMap = new Map<number, F1Position>();
        for (const p of prev.positions)  positionMap.set(p.driverNumber, p);
        for (const p of rawPositions)    positionMap.set(p.driverNumber, p);
        const merged = Array.from(positionMap.values())
          .sort((a, b) => a.position - b.position);

        // Merge driver maps (new data wins)
        const mergedDrivers = Object.keys(currentDriverMap).length > 0
          ? currentDriverMap
          : prev.drivers;
        const mergedNumberMap = Object.keys(currentNumberMap).length > 0
          ? currentNumberMap
          : prev.driverNumberMap;

        return {
          session,
          positions:       merged,
          drivers:         mergedDrivers,
          driverNumberMap: mergedNumberMap,
          fastestLap:      fastestLapUpdate ?? prev.fastestLap,
          isLive,
          lastUpdated:     Date.now(),
          error:           null,
        };
      });

      scheduleNext(isLive ? POLL_ACTIVE : POLL_INACTIVE, poll);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: message }));

      const delay = BACKOFF_STEPS[Math.min(backoffIndexRef.current, BACKOFF_STEPS.length - 1)];
      backoffIndexRef.current = Math.min(backoffIndexRef.current + 1, BACKOFF_STEPS.length - 1);
      scheduleNext(delay, poll);
    } finally {
      isFetchingRef.current = false;
    }
  }, [scheduleNext]);

  // Tab visibility — pause on hidden, resume + immediate fetch on visible
  useEffect(() => {
    const onVisibilityChange = () => {
      tabVisibleRef.current = document.visibilityState === 'visible';
      if (tabVisibleRef.current) {
        clearTimer();
        poll();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [poll, clearTimer]);

  // Initial poll on mount
  useEffect(() => {
    poll();
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
