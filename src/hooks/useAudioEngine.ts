'use client';

import { useState, useCallback, useRef } from 'react';
import { AudioEngine } from '@/lib/audioEngine';

// Module-level singleton — one engine for the lifetime of the app.
let engineSingleton: AudioEngine | null = null;

function getEngine(): AudioEngine {
  if (!engineSingleton) {
    engineSingleton = new AudioEngine();
  }
  return engineSingleton;
}

export function useAudioEngine() {
  const engine = useRef(getEngine());
  const [volume, setVolumeState] = useState(engine.current.volume);
  const [muted,  setMutedState]  = useState(engine.current.muted);
  const [ready,  setReady]       = useState(false);

  // Must be called on first user gesture to unlock AudioContext
  const init = useCallback(async () => {
    await engine.current.init();
    setReady(true);
  }, []);

  const play = useCallback(
    (
      audioFile:   string,
      priority:    number,
      isWin:       boolean,
      offset:      number,
      duration:    number,
      hasWinTheme: boolean
    ) => {
      engine.current.play(audioFile, priority, isWin, offset, duration, hasWinTheme);
    },
    []
  );

  const preload = useCallback((key: string, path: string) => {
    engine.current.preload(key, path).catch(() => {/* silent */});
  }, []);

  const setVolume = useCallback((v: number) => {
    engine.current.setVolume(v);
    setVolumeState(v);
  }, []);

  const toggleMute = useCallback(() => {
    engine.current.toggleMute();
    setMutedState(engine.current.muted);
  }, []);

  return { init, play, preload, setVolume, toggleMute, volume, muted, ready };
}
