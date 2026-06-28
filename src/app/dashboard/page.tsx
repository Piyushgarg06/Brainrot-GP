'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useF1Data }             from '@/hooks/useF1Data';
import { useAudioEngine }        from '@/hooks/useAudioEngine';
import { useEventQueue }         from '@/hooks/useEventQueue';
import { useBroadcastChannel }   from '@/hooks/useBroadcastChannel';
import { SessionBar }            from '@/components/dashboard/SessionBar';
import { DriverGrid }            from '@/components/dashboard/DriverGrid';
import { EventToast }            from '@/components/dashboard/EventToast';
import { VolumeControl }         from '@/components/dashboard/VolumeControl';
import { ConnectionStatus }      from '@/components/dashboard/ConnectionStatus';
import { DriverPicker, loadFavoriteDriver } from '@/components/dashboard/DriverPicker';
import { DRIVERS }               from '@/lib/drivers';
import { PRIORITY }              from '@/lib/eventPriority';
import type { F1Event }          from '@/types/events';

type ConnectionState = 'connected' | 'reconnecting' | 'error' | 'restricted';

// ── Dashboard page ─────────────────────────────────────────────
export default function DashboardPage() {
  // Favorite driver — loaded from localStorage on mount
  const [favoriteCode, setFavoriteCode] = useState<string | null>(null);
  useEffect(() => { setFavoriteCode(loadFavoriteDriver()); }, []);

  const f1State = useF1Data();
  const audio   = useAudioEngine();

  const [audioReady, setAudioReady] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const preloadedRef                = useRef(false);

  const connectionState: ConnectionState =
    f1State.error         ? (f1State.error.includes('401') ? 'restricted' : 'error')
    : f1State.isLive      ? 'connected'
    : f1State.lastUpdated ? 'reconnecting'
    : 'reconnecting';

  // Refs to break circular dependency: useEventQueue <-> useBroadcastChannel
  const injectToastRef = useRef<(event: F1Event) => void>(() => {});
  const playAudioRef   = useRef<(event: F1Event) => void>(() => {});

  // ── Audio playback helper ─────────────────────────────────────
  const playAudio = useCallback((event: F1Event) => {
    const driver = DRIVERS[event.driverCode];
    if (!driver || !audioReady) return;
    const isWin = event.type === 'WINNER';
    audio.play(
      driver.audioFile,
      event.priority,
      isWin,
      isWin ? driver.audioOffsetWin   : driver.audioOffset,
      isWin ? driver.audioDurationWin : driver.audioDuration,
      driver.hasWinTheme
    );
    setActiveCode(event.driverCode);
    setTimeout(() => setActiveCode(null), 400);
  }, [audio, audioReady]);

  // Keep playAudioRef updated with the fresh callback
  useEffect(() => {
    playAudioRef.current = playAudio;
  }, [playAudio]);

  // ── BroadcastChannel — receive events from OTHER tabs ─────────
  const onRemoteEvent = useCallback((event: F1Event) => {
    injectToastRef.current(event);
    playAudioRef.current(event);
  }, []);

  const { broadcast } = useBroadcastChannel(onRemoteEvent);

  // ── handleLocalEvent — callback for queue-detected events ─────
  const handleLocalEvent = useCallback((event: F1Event) => {
    playAudio(event);
    broadcast(event);
  }, [playAudio, broadcast]);

  // Initialize event queue hook with callback
  const { toasts, dismissToast, injectToast } = useEventQueue(f1State, favoriteCode, handleLocalEvent);

  // Keep injectToastRef updated
  useEffect(() => {
    injectToastRef.current = injectToast;
  }, [injectToast]);

  // ── Init AudioContext on first user gesture ──────────────────
  useEffect(() => {
    const init = async () => { await audio.init(); setAudioReady(true); };
    const h = () => { void init(); };
    window.addEventListener('click',   h, { once: true });
    window.addEventListener('keydown', h, { once: true });
    return () => {
      window.removeEventListener('click',   h);
      window.removeEventListener('keydown', h);
    };
  }, [audio]);

  // ── Preload all driver audio once ────────────────────────────
  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    for (const driver of Object.values(DRIVERS)) {
      audio.preload(driver.audioFile, `/audio/${driver.audioFile}.mp3`);
      if (driver.hasWinTheme) {
        audio.preload(`${driver.audioFile}_win`, `/audio/${driver.audioFile}_win.mp3`);
      }
    }
  }, [audio]);

  // ── Mobile banner ─────────────────────────────────────────────
  const [showMobileBanner, setShowMobileBanner] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('mobile-banner-dismissed')) setShowMobileBanner(true);
  }, []);
  const dismissMobileBanner = () => {
    sessionStorage.setItem('mobile-banner-dismissed', '1');
    setShowMobileBanner(false);
  };

  const fastestCode = f1State.fastestLap?.driverCode ?? null;

  return (
    <div
      style={{
        width:           '100vw',
        height:          '100vh',
        overflow:        'hidden',
        display:         'flex',
        flexDirection:   'column',
        backgroundColor: 'var(--bg)',
      }}
    >
      <SessionBar f1State={f1State} />

      {showMobileBanner && (
        <div
          className="mobile-only"
          style={{
            borderBottom: '1px solid var(--border)', padding: '8px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
            best experienced as a second screen on desktop
          </span>
          <button
            onClick={dismissMobileBanner}
            aria-label="Dismiss banner"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main split layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left — Driver Grid 65% */}
        <div
          className="col-left"
          style={{ flex: '0 0 65%', overflowY: 'auto', borderRight: '1px solid var(--border)' }}
        >
          <DriverGrid
            f1State={f1State}
            fastestDriverCode={fastestCode}
            activeEventCode={activeCode}
            favoriteDriverCode={favoriteCode}
          />
        </div>

        {/* Right — Event Feed 35% */}
        <div
          className="col-right"
          style={{ flex: '0 0 35%', overflowY: 'auto', padding: '16px' }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)',
            marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Event Log
          </div>
          {toasts.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', opacity: 0.45 }}>
              — waiting for events
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {toasts.map(event => (
                <div key={event.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {event.type}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text)' }}>
                    {event.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed overlays */}
      <EventToast toasts={toasts} onDismiss={dismissToast} />
      <VolumeControl
        volume={audio.volume}
        muted={audio.muted}
        onVolume={audio.setVolume}
        onToggleMute={audio.toggleMute}
      />
      <ConnectionStatus state={connectionState} lastUpdated={f1State.lastUpdated} />

      {/* Favorite driver picker — bottom-center */}
      <DriverPicker value={favoriteCode} onChange={setFavoriteCode} />

      <style>{`
        .mobile-only { display: none; }
        @media (max-width: 767px) {
          .mobile-only { display: flex; }
          .col-left  { flex: 0 0 100% !important; border-right: none !important; }
          .col-right { display: none; }
        }
      `}</style>
    </div>
  );
}
