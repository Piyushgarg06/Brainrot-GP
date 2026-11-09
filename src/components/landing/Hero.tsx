'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { CarOrbit } from './CarOrbit';
import { useLenis } from '@/hooks/useLenis';
import { getGlobalSound, setGlobalSound, SOUND_CHANGE_EVENT } from '@/lib/soundState';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  // Lenis smooth scroll — active on landing, destroyed before dashboard
  useLenis(true);

  // Sync global sound state across the website
  useEffect(() => {
    setIsSoundOn(getGlobalSound());
    const onSoundChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      setIsSoundOn(Boolean(custom.detail?.enabled));
    };
    window.addEventListener(SOUND_CHANGE_EVENT, onSoundChange);
    return () => window.removeEventListener(SOUND_CHANGE_EVENT, onSoundChange);
  }, []);

  // Global sound toggle: controls sound for video and lineup sections (stays silent in Hero)
  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    setGlobalSound(next);
  };

  const scrollToNext = () => {
    const nextY = window.innerHeight;
    window.scrollTo({ top: nextY, behavior: 'smooth' });
  };

  return (
    <>
      <section
        ref={heroRef}
        className="hero-viewport carbon-bg"
        aria-label="BrainrotGP landing"
      >
        {/* 1. Left Vertical Label: THE 2026 F1 SEASON (pinned to the very left edge) */}
        <div className="hero-left-vertical-label">
          THE 2026 F1 SEASON
        </div>

        {/* Car orbit layer — behind content */}
        <CarOrbit />

        {/* Hero center typography content */}
        <div ref={titleRef} className="hero-center-content">
          {/* Main Title */}
          <h1 className="hero-title">
            BRAINROT
            <br />
            GP
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            The unnecessary second-screen companion for Formula 1.
          </p>

          {/* Original Open Dashboard CTA (square corners, clean border) */}
          <div className="hero-cta-wrapper">
            <Link
              href="/dashboard"
              className="original-dashboard-btn"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text, #ffffff)',
                border: '1px solid var(--border, rgba(255, 255, 255, 0.2))',
                background: 'transparent',
                padding: '12px 24px',
                borderRadius: '2px',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '8px',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2, rgba(255, 255, 255, 0.08))';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent, #ff334b)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border, rgba(255, 255, 255, 0.2))';
              }}
            >
              Open Dashboard →
            </Link>
          </div>

          {/* Mobile hint */}
          <p className="mobile-hint">
            {'// this page has secrets. desktop reveals them.'}
          </p>
        </div>

        {/* Bottom Center: SCROLL prompt */}
        <div className="hero-bottom-scroll" onClick={scrollToNext} role="button" tabIndex={0}>
          <span className="scroll-caption">SCROLL</span>
          <span className="scroll-arrow">↓</span>
        </div>

        {/* Bottom Right: Master Sound Toggle */}
        <div className="hero-bottom-right-sound">
          <button
            className={`hero-sound-toggle-btn ${isSoundOn ? 'active' : ''}`}
            onClick={toggleSound}
            title={isSoundOn ? 'Mute Audio Across Site' : 'Enable Audio Across Site'}
          >
            <span className="sound-icon">{isSoundOn ? '🔊' : '🔇'}</span>
            <span className="sound-text">{isSoundOn ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>
        </div>
      </section>

      <style jsx>{`
        .hero-viewport {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #000000;
          color: #ffffff;
          user-select: none;
        }

        /* 1. Left Vertical Label pinned to very left edge */
        .hero-left-vertical-label {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          transform-origin: center center;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(255, 255, 255, 0.4);
          white-space: nowrap;
          z-index: 25;
          pointer-events: none;
        }

        /* Center Content */
        .hero-center-content {
          position: relative;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 18px;
          max-width: 90vw;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(72px, 13vw, 170px);
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--accent, #ff334b);
          line-height: 0.88;
          text-align: center;
          margin: 0;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.9);
        }

        .hero-subtitle {
          font-family: var(--font-body);
          font-size: 16px;
          color: var(--muted, rgba(255, 255, 255, 0.6));
          letter-spacing: -0.01em;
          max-width: 440px;
          margin: 0;
          line-height: 1.4;
        }

        .hero-cta-wrapper {
          margin-top: 4px;
        }

        /* Bottom Center: SCROLL prompt */
        .hero-bottom-scroll {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          z-index: 25;
          animation: gentleFloat 2.2s infinite ease-in-out;
          transition: opacity 0.2s ease;
        }

        .hero-bottom-scroll:hover {
          opacity: 1;
        }

        .scroll-caption {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 600;
        }

        .scroll-arrow {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translate(-50%, 0);
          }
          50% {
            transform: translate(-50%, 6px);
          }
        }

        /* Bottom Right: Master Sound Button */
        .hero-bottom-right-sound {
          position: absolute;
          bottom: 28px;
          right: 36px;
          z-index: 25;
        }

        .hero-sound-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 18px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .hero-sound-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.45);
          transform: translateY(-1px);
        }

        .hero-sound-toggle-btn.active {
          background: rgba(255, 51, 75, 0.2);
          border-color: rgba(255, 51, 75, 0.6);
          color: #ffffff;
        }

        .mobile-hint {
          display: none;
        }

        @media (pointer: coarse), (max-width: 767px) {
          .mobile-hint {
            display: block;
            font-family: var(--font-mono);
            font-size: 11px;
            color: rgba(255, 255, 255, 0.4);
            margin: 0;
            margin-top: 12px;
          }
          .hero-left-vertical-label {
            display: none;
          }
          .hero-bottom-right-sound {
            bottom: 20px;
            right: 20px;
          }
          .hero-bottom-scroll {
            bottom: 24px;
          }
        }
      `}</style>
    </>
  );
}