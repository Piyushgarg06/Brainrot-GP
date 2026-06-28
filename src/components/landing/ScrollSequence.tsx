'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { CarOrbitHandle } from './CarOrbit';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSequenceProps {
  heroRef:        React.RefObject<HTMLElement | null>;
  titleRef:       React.RefObject<HTMLElement | null>;
  carOrbitHandle: CarOrbitHandle | null;
  onSequenceEnd:  () => void;
}

export function ScrollSequence({
  heroRef,
  titleRef,
  carOrbitHandle,
  onSequenceEnd,
}: ScrollSequenceProps) {
  const reduced      = usePrefersReducedMotion();
  const sequenceDone = useRef(false);

  useEffect(() => {
    if (reduced) return;
    if (!heroRef.current || !titleRef.current) return;

    const hero  = heroRef.current;
    const title = titleRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:    hero,
        start:      'top top',
        end:        '+=200%',
        scrub:      1,
        pin:        true,
        pinSpacing: true,
        onUpdate: (self) => {
          const p = self.progress;

          // Cars continuously accelerate (from 1x to 15x speed) as progress increases towards the break threshold
          if (p <= 0.8) {
            const mult = 1 + (p / 0.8) * 14;
            carOrbitHandle?.setSpeedMultiplier(mult);
          }

          // 0.80 → 1.00  Sequence done — destroy Lenis, hand off to dashboard
          if (p >= 0.8 && !sequenceDone.current) {
            sequenceDone.current = true;
            onSequenceEnd();
          }
        },
      },
    });

    // 0.30 → 0.50  Break formation — each car flies offscreen
    // We target the CarOrbit container's children
    const carEls = hero.querySelectorAll<HTMLDivElement>('[data-car]');
    if (carEls.length > 0) {
      tl.to(
        carEls,
        {
          x:        () => (Math.random() - 0.5) * window.innerWidth  * 3,
          y:        () => (Math.random() - 0.5) * window.innerHeight * 2,
          rotation: () => (Math.random() - 0.5) * 720,
          opacity:  0,
          ease:     'power3.in',
          stagger:  0.02,
        },
        0.3
      );
    }

    // 0.50 → 0.60  Title fades up and out
    tl.to(
      title,
      { opacity: 0, y: -40, ease: 'none' },
      0.5
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [reduced, heroRef, titleRef, carOrbitHandle, onSequenceEnd]);

  return null; // purely imperative — no DOM output
}
