'use client';

import { useEffect, useRef, useState } from 'react';

export function InterlagosHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const scrolled = -rect.top;
        const p = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
        setScrollProgress(p);

        // Control video playback or scrub smoothly
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
          }
        }
      } else if (rect.top > 0) {
        setScrollProgress(0);
      } else {
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute transform styles based on scroll progress:
  // Phase 1 (0 to 0.4): Giant grainy "INTERLAGOS 2026" zooms in, opacity fades
  // Phase 2 (0.2 to 0.8): Video card expands from small rounded window in the center to full viewport background
  // Phase 3 (0.7 to 1.0): Video settles, bottom telemetry fades in, cue scroll down to lineup

  const introScale = 1 + scrollProgress * 3;
  const introOpacity = Math.max(1 - scrollProgress * 2.8, 0);

  // Video card width / height calculation
  // Start around 340px x 420px (or 40vw x 45vh) and expand to 100vw x 100vh
  const videoProgress = Math.min(Math.max((scrollProgress - 0.1) / 0.7, 0), 1);
  const videoWidth = 360 + videoProgress * (typeof window !== 'undefined' ? window.innerWidth - 360 : 1200);
  const videoHeight = 440 + videoProgress * (typeof window !== 'undefined' ? window.innerHeight - 440 : 800);
  const videoRadius = Math.max(28 * (1 - videoProgress), 0);
  const videoOpacity = Math.min(scrollProgress * 2.5, 1);

  return (
    <section ref={containerRef} className="interlagos-hero-section">
      <div className="hero-sticky-stage">
        {/* Particle / Grain overlay */}
        <div className="film-grain" />

        {/* Phase 1: Giant 2026 / INTERLAGOS headline */}
        <div
          className="intro-headline-container"
          style={{
            transform: `scale(${introScale})`,
            opacity: introOpacity,
            pointerEvents: introOpacity > 0.05 ? 'auto' : 'none',
          }}
        >
          <div className="stippled-text-wrapper">
            <h1 className="stippled-headline">2026</h1>
            <div className="circuit-name">INTERLAGOS</div>
          </div>

          <div className="intro-meta-stats">
            <span className="meta-stat">71 LAPS · 4.309 KM · AUTÓDROMO JOSÉ CARLOS PACE</span>
            <span className="meta-quote">"here is what they said."</span>
          </div>

          <div className="scroll-indicator">
            <span className="scroll-arrow">↓</span>
            <span className="scroll-text">SCROLL TO TAKE OVER</span>
          </div>
        </div>

        {/* Phase 2: Expanding Video Player (maxClip) */}
        <div
          className="video-expanding-container"
          style={{
            width: `${videoWidth}px`,
            height: `${videoHeight}px`,
            borderRadius: `${videoRadius}px`,
            opacity: videoOpacity,
          }}
        >
          <video
            ref={videoRef}
            src="/videos/maxClip.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
          />

          {/* Vignette & cinematic overlay */}
          <div className="video-vignette" />

          {/* In-video title card overlay */}
          <div
            className="video-floating-card"
            style={{
              opacity: Math.min(Math.max((videoProgress - 0.4) * 2, 0), 1),
            }}
          >
            <div className="card-tag">BRAZILIAN GRAND PRIX</div>
            <div className="card-headline">MAX VERSTAPPEN RADIO CLIP</div>
            <div className="card-desc">"So we have nothing on a switch..."</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .interlagos-hero-section {
          position: relative;
          height: 320vh; /* 3 screens worth of scroll distance */
          background: #000000;
        }

        .hero-sticky-stage {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #000000;
        }

        /* Subtle film grain effect like cafeteria report */
        .film-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
          opacity: 0.15;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        /* Giant textured intro */
        .intro-headline-container {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          z-index: 20;
          transition: transform 0.08s linear, opacity 0.08s linear;
        }

        .stippled-text-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stippled-headline {
          font-family: var(--font-display);
          font-size: clamp(120px, 22vw, 320px);
          font-weight: 900;
          line-height: 0.85;
          letter-spacing: -0.05em;
          margin: 0;
          color: #f5f5f5;
          /* Texture matching cafeteria stipple/grain */
          background-image: radial-gradient(circle, #ffffff 40%, rgba(255,255,255,0.2) 100%);
          -webkit-background-clip: text;
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.2);
        }

        .circuit-name {
          font-family: var(--font-mono);
          font-size: clamp(20px, 3.5vw, 42px);
          letter-spacing: 0.35em;
          color: rgba(255, 255, 255, 0.9);
          margin-top: -10px;
          text-transform: uppercase;
        }

        .intro-meta-stats {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
        }

        .meta-quote {
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
          letter-spacing: normal;
        }

        .scroll-indicator {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          animation: floatSlow 2s ease-in-out infinite;
        }

        .scroll-arrow {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
        }

        .scroll-text {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Expanding Video Player */
        .video-expanding-container {
          position: absolute;
          z-index: 10;
          overflow: hidden;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.08s linear, height 0.08s linear, border-radius 0.08s linear;
        }

        .hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 100%),
                      linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.8) 100%);
          pointer-events: none;
        }

        .video-floating-card {
          position: absolute;
          bottom: 120px;
          left: 60px;
          z-index: 15;
          pointer-events: none;
        }

        .card-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.15em;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 6px;
        }

        .card-headline {
          font-family: var(--font-display);
          font-size: clamp(28px, 4vw, 54px);
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
        }

        .card-desc {
          font-family: var(--font-body);
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 8px;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        @media (max-width: 768px) {
          .video-floating-card {
            bottom: 90px;
            left: 24px;
            right: 24px;
          }
        }
      `}</style>
    </section>
  );
}

