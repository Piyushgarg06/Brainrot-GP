'use client';

import Link from 'next/link';
import { useRef, useCallback, useState } from 'react';
import { CarOrbit, type CarOrbitHandle } from './CarOrbit';
import { ScrollSequence } from './ScrollSequence';
import { useLenis } from '@/hooks/useLenis';

export function Hero() {
  const heroRef    = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const [orbitHandle, setOrbitHandle] = useState<CarOrbitHandle | null>(null);

  // Lenis smooth scroll — active on landing, destroyed before dashboard
  const { destroy: destroyLenis } = useLenis(true);

  const handleOrbitReady = useCallback((handle: CarOrbitHandle) => {
    setOrbitHandle(handle);
  }, []);

  const handleSequenceEnd = useCallback(() => {
    // Keep Lenis active so user can scroll down to the carousel and footer.
    // It will auto-destroy when Next.js unmounts this page and navigates to the dashboard.
  }, []);

  return (
    <>
      <section
        ref={heroRef}
        style={{
          position:       'relative',
          width:          '100%',
          height:         '100vh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          overflow:       'hidden',
        }}
        className="carbon-bg"
        aria-label="BrainrotGP landing"
      >
        {/* Car orbit layer — behind content */}
        <CarOrbit onReady={handleOrbitReady} />

        {/* Hero content */}
        <div
          ref={titleRef}
          style={{
            position:      'relative',
            zIndex:        10,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           '20px',
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(72px, 12vw, 160px)',
              fontWeight:    700,
              letterSpacing: '-0.03em',
              color:         'var(--accent)',
              lineHeight:    0.9,
              textAlign:     'center',
              margin:        0,
            }}
          >
            BRAINROT
            <br />
            GP
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize:   '16px',
              color:      'var(--muted)',
              maxWidth:   '420px',
              textAlign:  'center',
              margin:     0,
            }}
          >
            The unnecessary second-screen companion for Formula 1.
          </p>

          {/* CTA */}
          <Link
            href="/dashboard"
            style={{
              fontFamily:   'var(--font-body)',
              fontSize:     '14px',
              color:        'var(--text)',
              border:       '1px solid var(--border)',
              background:   'transparent',
              padding:      '12px 24px',
              borderRadius: '2px',
              textDecoration: 'none',
              display:      'inline-block',
              marginTop:    '8px',
              transition:   'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background    = 'var(--surface-2)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor   = 'var(--accent)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background    = 'transparent';
              (e.currentTarget as HTMLAnchorElement).style.borderColor   = 'var(--border)';
            }}
          >
            Open Dashboard →
          </Link>

          {/* Mobile hint — hidden on desktop via CSS */}
          <p
            className="mobile-hint"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '11px',
              color:      'var(--muted)',
              opacity:    0.45,
              margin:     0,
              marginTop:  '32px',
              alignSelf:  'flex-start',
            }}
          >
            {'// this page has secrets. desktop reveals them.'}
          </p>
        </div>
      </section>

      {/* Scroll sequence — purely imperative, renders null */}
      <ScrollSequence
        heroRef={heroRef}
        titleRef={titleRef}
        carOrbitHandle={orbitHandle}
        onSequenceEnd={handleSequenceEnd}
      />

      <style>{`
        /* Mobile hint: hidden on desktop, visible on coarse-pointer or narrow screen */
        .mobile-hint {
          display: none;
        }
        @media (pointer: coarse), (max-width: 767px) {
          .mobile-hint {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
