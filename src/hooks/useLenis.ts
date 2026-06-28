'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Lenis types — imported conditionally to stay SSR-safe
type LenisInstance = {
  on: (event: string, cb: (e: { scroll: number; progress: number; velocity: number; direction: number }) => void) => void;
  destroy: () => void;
  raf: (time: number) => void;
};

type LenisConstructor = new (options?: {
  duration?: number;
  easing?: (t: number) => number;
  smoothWheel?: boolean;
}) => LenisInstance;

export function useLenis(enabled: boolean = true) {
  const lenisRef = useRef<LenisInstance | null>(null);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let Lenis: LenisConstructor;
    try {
      // Dynamic import at runtime — SSR safe
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Lenis = (require('lenis') as { default: LenisConstructor }).default;
    } catch {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Connect Lenis scroll position to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP ticker drives Lenis RAF
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  const destroy = () => {
    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current = null;
    }
  };

  return { destroy };
}
