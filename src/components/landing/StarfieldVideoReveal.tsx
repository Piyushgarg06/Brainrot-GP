'use client';

import { useEffect, useRef, useState } from 'react';
import { getGlobalSound, setGlobalSound, SOUND_CHANGE_EVENT } from '@/lib/soundState';

interface StarfieldVideoRevealProps {
  onEnteringSection?: () => void;
  onExitingSection?: () => void;
}

export function StarfieldVideoReveal({
  onEnteringSection,
  onExitingSection,
}: StarfieldVideoRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [isMuted, setIsMuted] = useState(true);
  const isMutedRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const wasInSection = useRef(false);
  const isUserInteracting = useRef(false);
  const userScrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync with global sound state toggled in Hero or anywhere
  useEffect(() => {
    const isGlobalOn = getGlobalSound();
    setIsMuted(!isGlobalOn);
    isMutedRef.current = !isGlobalOn;
    if (videoRef.current) {
      videoRef.current.muted = !isGlobalOn;
    }

    const onSoundChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      const enabled = Boolean(custom.detail?.enabled);
      setIsMuted(!enabled);
      isMutedRef.current = !enabled;
      if (videoRef.current) {
        videoRef.current.muted = !enabled;
      }
    };

    window.addEventListener(SOUND_CHANGE_EVENT, onSoundChange);
    return () => window.removeEventListener(SOUND_CHANGE_EVENT, onSoundChange);
  }, []);

  // Background star speckles animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const count = 350;
    interface Star {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      speedX: number;
      speedY: number;
    }
    const stars: Star[] = [];

    const init = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      stars.length = 0;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2 + 0.6,
          baseAlpha: Math.random() * 0.75 + 0.25,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: (Math.random() - 0.5) * 0.35,
        });
      }
    };

    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      for (const s of stars) {
        s.x += s.speedX;
        s.y += s.speedY;

        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.baseAlpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', init);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animId);
    };
  }, []);

  const hasStartedPlayback = useRef(false);
  const hasFinishedPlayback = useRef(false);

  // Safe video playback handler
  const startVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasStartedPlayback.current) {
      video.currentTime = 0;
      hasStartedPlayback.current = true;
    }
    video.muted = isMutedRef.current;

    const prom = video.play();
    if (prom !== undefined) {
      prom
        .then(() => setIsPlaying(true))
        .catch(() => {
          video.muted = true;
          isMutedRef.current = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }
  };

  const stopVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
  };

  // Scroll tracking across the pinned track:
  // Phase 1 (0 to 0.25): Heading "// INTERLAGOS 2026 — here's what they said." is front and center
  // Phase 2 (0.25 to 0.55): Video emerges and scales up from center as user scrolls or auto-scrolls
  // Phase 3 (0.55 to 1.0): Video is full size, plays audio clip to completion, then auto-scrolls to LINEUP
  useEffect(() => {
    const onUserGesture = () => {
      isUserInteracting.current = true;
      if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current);
      userScrollTimeout.current = setTimeout(() => {
        isUserInteracting.current = false;
      }, 2000);
    };

    window.addEventListener('wheel', onUserGesture, { passive: true });
    window.addEventListener('touchmove', onUserGesture, { passive: true });

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const total = rect.height - windowHeight;

      const currentlyIn = rect.top <= 10 && rect.bottom >= 10;

      if (currentlyIn && !wasInSection.current) {
        wasInSection.current = true;
        hasStartedPlayback.current = false;
        hasFinishedPlayback.current = false;
        onEnteringSection?.();
      } else if (!currentlyIn && wasInSection.current) {
        wasInSection.current = false;
        stopVideo();
        onExitingSection?.();
      }

      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const p = Math.min(Math.max(-rect.top / total, 0), 1);
        setScrollProgress(p);

        // Start video playback ONLY once the video card has emerged via scroll (p >= 0.40)
        if (p >= 0.40 && !hasStartedPlayback.current) {
          startVideo();
        }
      } else if (rect.top > 0) {
        setScrollProgress(0);
      } else {
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Stop video and audio immediately when tab changes or window loses focus
    const handleVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
        setIsPlaying(false);
      } else if (wasInSection.current && hasStartedPlayback.current && !hasFinishedPlayback.current) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    const handleWindowBlur = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleWindowFocus = () => {
      const video = videoRef.current;
      if (video && wasInSection.current && hasStartedPlayback.current && !hasFinishedPlayback.current && !document.hidden) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Auto-scroll logic:
    // 1. When entering section, auto-scroll through the heading to bring the video in view
    // 2. Pause while clip is playing until it finishes
    // 3. Once clip finishes, auto-scroll to the next section (lineup)
    let animId: number;
    const autoScrollLoop = () => {
      const video = videoRef.current;
      const container = containerRef.current;

      if (container && wasInSection.current && !isUserInteracting.current) {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const total = rect.height - windowHeight;
        const currentP = Math.min(Math.max(-rect.top / total, 0), 1);

        // If video is still emerging (p < 0.50), auto-scroll smoothly down so video card pops in view
        if (currentP < 0.50) {
          window.scrollBy({ top: 2.8, behavior: 'instant' });
        } else if (currentP >= 0.50) {
          // Check if video finished
          const isFinished = video ? (video.ended || hasFinishedPlayback.current || (video.duration > 0 && video.currentTime >= video.duration - 0.2)) : false;
          if (isFinished) {
            // Video is done: auto-scroll to the next section (Lineup)
            window.scrollBy({ top: 3.5, behavior: 'instant' });
          }
        }
      }
      animId = requestAnimationFrame(autoScrollLoop);
    };

    animId = requestAnimationFrame(autoScrollLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', onUserGesture);
      window.removeEventListener('touchmove', onUserGesture);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      cancelAnimationFrame(animId);
      stopVideo();
      if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current);
    };
  }, [onEnteringSection, onExitingSection]);

  // Compute scroll-linked emergence transforms
  // Heading: visible first (p < 0.25), fades out as video emerges (0.2 to 0.45)
  const headingOpacity = Math.max(1 - (scrollProgress / 0.35), 0);
  const headingScale = 1 + scrollProgress * 0.3;
  const headingY = -scrollProgress * 80;

  // Video Card: starts small & hidden, emerges from center between p=0.18 and p=0.50
  const videoProgress = Math.min(Math.max((scrollProgress - 0.18) / 0.32, 0), 1);
  const videoScale = 0.5 + videoProgress * 0.5;
  const videoOpacity = videoProgress;
  const videoY = 80 * (1 - videoProgress);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    setGlobalSound(!nextMuted);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <section id="interview-clip" ref={containerRef} className="starfield-section">
      <div className="sticky-stage">
        {/* Star speckles canvas */}
        <canvas ref={canvasRef} className="stars-canvas" />

        {/* Heading: "here's what they said." - DISPLAYED FIRST BEFORE VIDEO */}
        <div
          className="center-statement"
          style={{
            opacity: headingOpacity,
            transform: `scale(${headingScale}) translateY(${headingY}px)`,
            pointerEvents: headingOpacity > 0.1 ? 'auto' : 'none',
          }}
        >
          <span className="statement-sub">// INTERLAGOS 2026</span>
          <h2 className="statement-text">here&apos;s what they said.</h2>
        </div>

        {/* Video Card: Pure clip with no enclosing box */}
        <div
          className="video-portal-card"
          onClick={togglePlay}
          style={{
            opacity: videoOpacity,
            transform: `scale(${videoScale}) translateY(${videoY}px)`,
            pointerEvents: videoOpacity > 0.2 ? 'auto' : 'none',
          }}
        >
          <video
            ref={videoRef}
            src="/videos/maxClip.mp4"
            muted={isMuted}
            playsInline
            preload="auto"
            onEnded={() => {
              hasFinishedPlayback.current = true;
            }}
            className="clip-video"
          />
        </div>

        {/* Cafeteria Bottom pill bar */}
        <div className="bottom-pill-bar">
          <div className="pill-left-meta">
            VOICE &nbsp;<strong>MAX VERSTAPPEN</strong> &nbsp;·&nbsp; 2026 INTERLAGOS
            <br />
            <span className="timecode">00:00:20:26</span>
          </div>

          <div className="audio-capsule">
            <button className="capsule-play-dot" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
              <div className={`color-wheel-dot ${isPlaying ? 'pulse' : ''}`} />
            </button>
            <span className="music-icon">♫</span>
            <span className="capsule-caption">
              MAX VERSTAPPEN · RADIO ARCHIVE
            </span>
            <span className="capsule-duration">0:00 / 0:10</span>
          </div>

          <button className="sound-button" onClick={toggleMute}>
            <span>{isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .starfield-section {
          position: relative;
          width: 100%;
          height: 260vh; /* Pinned scroll length for smooth emergence */
          background-color: #000000;
        }

        .sticky-stage {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
        }

        .stars-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .center-statement {
          position: absolute;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          transition: transform 0.08s linear, opacity 0.08s linear;
        }

        .statement-sub {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.45);
        }

        .statement-text {
          font-family: var(--font-body);
          font-size: clamp(28px, 4.5vw, 48px);
          font-weight: 400;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .video-portal-card {
          position: relative;
          z-index: 20;
          width: min(820px, 90vw);
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: transparent;
          border: none;
          box-shadow: none;
          cursor: pointer;
          transition: transform 0.08s linear, opacity 0.08s linear;
        }

        .clip-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          border: none;
          outline: none;
          box-shadow: none;
        }

        .bottom-pill-bar {
          position: absolute;
          bottom: 28px;
          left: 0;
          right: 0;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 30;
          pointer-events: none;
        }

        .pill-left-meta {
          pointer-events: auto;
          font-family: var(--font-mono);
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.1em;
          line-height: 1.5;
        }

        .timecode {
          color: rgba(255, 255, 255, 0.35);
        }

        .audio-capsule {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(18, 18, 18, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 8px 20px 8px 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
        }

        .capsule-play-dot {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .color-wheel-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: conic-gradient(from 180deg at 50% 50%, #ff3b30, #ff9500, #34c759, #007aff, #af52de, #ff2d55);
          filter: blur(0.5px);
        }

        .color-wheel-dot.pulse {
          animation: spinPulse 2s linear infinite;
        }

        @keyframes spinPulse {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }

        .music-icon {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .capsule-caption {
          font-family: var(--font-body);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          max-width: 260px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .capsule-duration {
          font-family: var(--font-mono);
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }

        .sound-button {
          pointer-events: auto;
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sound-button:hover {
          background: rgba(30, 30, 30, 0.9);
          color: #ffffff;
        }

        @media (max-width: 800px) {
          .pill-left-meta, .sound-button {
            display: none;
          }
          .bottom-pill-bar {
            justify-content: center;
          }
          .video-portal-card {
            width: 92vw;
          }
        }
      `}</style>
    </section>
  );
}
