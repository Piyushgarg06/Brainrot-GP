'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Simple side-profile F1 car silhouette — 40px wide, monochrome.
// Direction: facing right (natural). Mirrored when heading left via CSS scaleX.
function CarSVG() {
  return (
    <svg
      width="40"
      height="14"
      viewBox="0 0 40 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main body */}
      <path
        d="M2 9 L5 5 L13 4 L17 2 L26 2 L32 4 L37 6 L38 9 Z"
        fill="currentColor"
      />
      {/* Cockpit */}
      <path
        d="M17 2 L19 0 L24 0 L26 2 Z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Front wing */}
      <path
        d="M36 9 L40 9 L40 11 L36 10 Z"
        fill="currentColor"
      />
      {/* Rear wing */}
      <path
        d="M1 6 L0 6 L0 10 L2 10 Z"
        fill="currentColor"
      />
      {/* Front wheel */}
      <circle cx="31" cy="11" r="3" fill="currentColor" />
      {/* Rear wheel */}
      <circle cx="9"  cy="11" r="3" fill="currentColor" />
    </svg>
  );
}

interface CarState {
  angle:     number;
  prevAngle: number;
  el:        HTMLDivElement | null;
}

const CAR_COUNT    = 6;
const RX           = 0.42; // fraction of viewport width
const RY           = 0.18; // fraction of viewport width (compressed for depth)
const BASE_SPEED   = 0.003;

export interface CarOrbitHandle {
  setSpeedMultiplier: (m: number) => void;
}

interface CarOrbitProps {
  onReady?: (handle: CarOrbitHandle) => void;
}

export function CarOrbit({ onReady }: CarOrbitProps) {
  const containerRef     = useRef<HTMLDivElement>(null);
  const carRefs          = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef         = useRef<CarState[]>([]);
  const speedMultiplier  = useRef(1);
  const tickerRef        = useRef<gsap.TickerCallback | null>(null);
  const reduced          = usePrefersReducedMotion();

  useEffect(() => {
    // Expose speed control handle to parent (for scroll sequence)
    if (onReady) {
      onReady({
        setSpeedMultiplier: (m: number) => { speedMultiplier.current = m; },
      });
    }
  }, [onReady]);

  useEffect(() => {
    if (reduced) return; // static render — no animation
    if (!containerRef.current) return;

    // Init car states with evenly spaced angles
    stateRef.current = Array.from({ length: CAR_COUNT }, (_, i) => ({
      angle:     i * ((Math.PI * 2) / CAR_COUNT),
      prevAngle: i * ((Math.PI * 2) / CAR_COUNT) - BASE_SPEED,
      el:        carRefs.current[i],
    }));

    const tick = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      const rx   = rect.width  * RX;
      const ry   = rect.width  * RY;

      // All Y values for depth scaling bounds
      const minY = cy - ry * 0.35;
      const maxY = cy + ry * 0.35;
      const yRange = maxY - minY || 1;

      // Sort cars by y for z-index
      const positions = stateRef.current.map((car, i) => {
        const x = cx + rx * Math.cos(car.angle);
        const y = cy + ry * Math.sin(car.angle) * 0.35;
        return { i, x, y };
      });
      positions.sort((a, b) => a.y - b.y);

      stateRef.current.forEach((car, i) => {
        car.prevAngle = car.angle;
        car.angle    += BASE_SPEED * speedMultiplier.current;

        const x = cx + rx * Math.cos(car.angle);
        const y = cy + ry * Math.sin(car.angle) * 0.35;

        const t       = (y - minY) / yRange;
        const scale   = 0.6 + 0.4 * t;
        const opacity = 0.3 + 0.7 * t;
        const zIndex  = positions.findIndex(p => p.i === i);

        // Heading: angle in orbit tangent (dx/dt, dy/dt)
        const dx = -rx * Math.sin(car.angle);
        const dy =  ry * Math.cos(car.angle) * 0.35;
        const heading = Math.atan2(dy, dx) * (180 / Math.PI);

        const el = car.el;
        if (!el) return;

        el.style.transform   = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${heading}deg) scaleX(${scale})`;
        el.style.opacity     = String(opacity);
        el.style.zIndex      = String(zIndex);
        // Mirror if heading left (heading magnitude > 90°)
        const absHeading = Math.abs(heading);
        if (absHeading > 90) {
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${heading}deg) scaleX(${-scale})`;
        }
      });
    };

    gsap.ticker.add(tick);
    tickerRef.current = tick;

    return () => {
      if (tickerRef.current) {
        gsap.ticker.remove(tickerRef.current);
      }
    };
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      style={{
        position:        'absolute',
        inset:           0,
        pointerEvents:   'none',
        overflow:        'hidden',
      }}
      aria-hidden="true"
    >
      {Array.from({ length: CAR_COUNT }, (_, i) => (
        <div
          key={i}
          ref={el => { carRefs.current[i] = el; }}
          style={{
            position:    'absolute',
            top:         0,
            left:        0,
            color:       'var(--muted)',
            willChange:  'transform, opacity',
            opacity:     reduced ? 0.3 : 0,
            // Static position when reduced motion — spread around center
            ...(reduced && {
              top:       `${50 + Math.sin(i * Math.PI / 3) * 18}%`,
              left:      `${50 + Math.cos(i * Math.PI / 3) * 38}%`,
              transform: 'translate(-50%, -50%)',
            }),
          }}
        >
          <CarSVG />
        </div>
      ))}
    </div>
  );
}
