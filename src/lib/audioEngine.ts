// ─────────────────────────────────────────────────────────────────
// BrainrotGP Audio Engine — Web Audio API, no libraries.
//
// Drop real songs into /public/audio/ when ready.
// Naming:  FileName.mp3  (matching audioFile field in drivers.ts)
// Win:     FileName_win.mp3  (optional per driver)
// Then set audioOffset, audioDuration, audioOffsetWin,
// audioDurationWin, and hasWinTheme in src/lib/drivers.ts
// ─────────────────────────────────────────────────────────────────

export class AudioEngine {
  private cache:           Map<string, AudioBuffer> = new Map();
  private currentSource:   AudioBufferSourceNode | null = null;
  private gainNode:        GainNode | null = null;
  private ctx:             AudioContext | null = null;
  public  volume:          number = 0.75;
  public  muted:           boolean = false;
  private currentPriority: number = 0;
  private initialized:     boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = this.muted ? 0 : this.volume;
        this.gainNode.connect(this.ctx.destination);
      } catch (e) {
        console.warn("[AudioEngine] Failed to create AudioContext in constructor:", e);
      }
    }
  }

  // ── init ────────────────────────────────────────────────────
  // Must be called after a user gesture (click/keydown).
  // Idempotent — safe to call multiple times.
  async init(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.initialized = true;
  }

  // ── preload ─────────────────────────────────────────────────
  // Fetch + decode + cache. Silent on failure — missing files expected.
  async preload(key: string, path: string): Promise<void> {
    if (this.cache.has(key)) return;
    if (!this.ctx) return; // not yet initialized, skip silently

    try {
      const res = await fetch(path);
      if (!res.ok) {
        console.warn(`[AudioEngine] preload skipped (${res.status}): ${path}`);
        return;
      }
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.cache.set(key, audioBuffer);
    } catch (err) {
      console.warn(`[AudioEngine] preload failed: ${path}`, err);
    }
  }

  // ── play ────────────────────────────────────────────────────
  play(
    audioFile:   string,
    priority:    number,
    isWin:       boolean,
    offset:      number,
    duration:    number,
    hasWinTheme: boolean
  ): void {
    if (!this.ctx || !this.gainNode) return;

    // Resolve path and cache key
    // If win was requested but hasWinTheme is false, silently use regular song.
    const useWin = isWin && hasWinTheme;
    const cacheKey = useWin ? `${audioFile}_win` : audioFile;

    const buffer = this.cache.get(cacheKey);
    if (!buffer) {
      // Not cached — attempt preload for future, return silently
      const path = useWin
        ? `/audio/${audioFile}_win.mp3`
        : `/audio/${audioFile}.mp3`;
      this.preload(cacheKey, path).catch(() => {/* silent */});
      return;
    }

    // Priority gate — lower priority does not interrupt current
    if (this.currentSource !== null && priority <= this.currentPriority) {
      return;
    }

    // Interrupt current source if higher priority incoming
    if (this.currentSource !== null) {
      this._rampAndStop(0.15);
    }

    // Start new source
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);

    // Restore gain (ramp may have zeroed it)
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.muted ? 0 : this.volume, now);

    // Clamp offset + duration to buffer bounds
    const safeOffset = Math.min(offset, buffer.duration);
    const safeDuration = Math.min(duration, buffer.duration - safeOffset);

    source.start(0, safeOffset, safeDuration > 0 ? safeDuration : undefined);

    this.currentSource = source;
    this.currentPriority = priority;

    source.onended = () => {
      this.currentSource = null;
      this.currentPriority = 0;
    };
  }

  // ── setVolume ───────────────────────────────────────────────
  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.gainNode) {
      this.gainNode.gain.value = this.muted ? 0 : this.volume;
    }
  }

  // ── toggleMute ──────────────────────────────────────────────
  toggleMute(): void {
    this.muted = !this.muted;
    if (this.gainNode) {
      this.gainNode.gain.value = this.muted ? 0 : this.volume;
    }
  }

  // ── fadeOut ─────────────────────────────────────────────────
  fadeOut(durationSecs: number): void {
    if (!this.gainNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.gainNode.gain.linearRampToValueAtTime(0, now + durationSecs);
  }

  // ── private helpers ─────────────────────────────────────────
  private _rampAndStop(durationSecs: number): void {
    if (!this.gainNode || !this.ctx || !this.currentSource) return;
    const source = this.currentSource;
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + durationSecs);
    setTimeout(() => {
      try { source.stop(); } catch { /* already stopped */ }
    }, durationSecs * 1000);
    this.currentSource = null;
    this.currentPriority = 0;
  }
}
