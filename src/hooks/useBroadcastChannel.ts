'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { F1Event } from '@/types/events';

const CHANNEL_NAME = 'brainrotgp-events';

interface BroadcastMessage {
  event:    F1Event;
  sourceId: string;
}

export function useBroadcastChannel(
  onRemoteEvent: (event: F1Event) => void
) {
  const channelRef  = useRef<BroadcastChannel | null>(null);
  const tabIdRef    = useRef(`tab-${Math.random().toString(36).slice(2, 9)}`);
  // Ref keeps callback current without recreating the channel on every render
  const callbackRef = useRef(onRemoteEvent);

  // Keep the callback ref fresh — no channel teardown needed
  useEffect(() => {
    callbackRef.current = onRemoteEvent;
  }, [onRemoteEvent]);

  // Create channel exactly once — never torn down until unmount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('BroadcastChannel' in window)) {
      console.warn('[useBroadcastChannel] BroadcastChannel API not supported in this browser');
      return;
    }

    console.log('[useBroadcastChannel] Initializing BroadcastChannel on channel:', CHANNEL_NAME, 'with tabId:', tabIdRef.current);
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    const messageHandler = (e: MessageEvent<unknown>) => {
      console.log('[useBroadcastChannel] Received message raw data:', e.data);
      const data = e.data;
      if (
        typeof data !== 'object' || data === null ||
        !('sourceId' in data) || !('event' in data)
      ) {
        console.warn('[useBroadcastChannel] Received invalid message payload structure');
        return;
      }

      const msg = data as BroadcastMessage;
      if (msg.sourceId === tabIdRef.current) {
        console.log('[useBroadcastChannel] Ignored message broadcasted by self');
        return;
      }
      console.log('[useBroadcastChannel] Processing remote event from tab:', msg.sourceId, msg.event);
      callbackRef.current(msg.event);
    };

    ch.addEventListener('message', messageHandler);

    return () => {
      console.log('[useBroadcastChannel] Closing BroadcastChannel:', CHANNEL_NAME);
      ch.removeEventListener('message', messageHandler);
      ch.close();
      channelRef.current = null;
    };
  }, []);

  const broadcast = useCallback((event: F1Event) => {
    if (!channelRef.current) {
      console.warn('[useBroadcastChannel] Cannot broadcast, channel is not initialized');
      return;
    }
    console.log('[useBroadcastChannel] Broadcasting event from tab:', tabIdRef.current, event);
    const msg: BroadcastMessage = { event, sourceId: tabIdRef.current };
    channelRef.current.postMessage(msg);
  }, []);

  return { broadcast };
}
