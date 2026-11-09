'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
  dissipateAngle: number;
  dissipateDist: number;
  dissipateSpeed: number;
}

export function StippleTitle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    // Mouse interactive coordinates relative to canvas
    const mouse = {
      x: -9999,
      y: -9999,
      radius: 95, // cursor interaction radius
      isHovered: false,
    };

    let scrollFraction = 0; // 0 (in hero) to 1 (scrolled past hero)

    const initParticles = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.min(window.innerWidth * 0.92, 920);
      const height = Math.min(window.innerHeight * 0.44, 400);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Virtual offscreen canvas to sample text pixels
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.fillStyle = '#000000';
      offCtx.fillRect(0, 0, width, height);

      // Render crisp text
      const fontSize = Math.min(width / 5.1, 145);
      offCtx.font = `900 ${fontSize}px "Barlow Condensed", sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';

      const lineGap = fontSize * 0.88;
      const centerY = height / 2;

      offCtx.fillText('BRAINROT', width / 2, centerY - lineGap / 2);
      offCtx.fillText('GP', width / 2, centerY + lineGap / 2);

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      particles = [];

      // Sampling grid for ultra crisp dots
      const step = 3;
      // Vibrant flaming Ferrari red color palette
      // Core Ferrari Red: #EF1A2D, Deep Racing Crimson: #C80815, Fiery Flame Ember: #FF2E34, Flash Orange Red: #FF4500
      const colors = [
        '#FF1801', // Scuderia Rosso Corsa
        '#E80020',
        '#FF2E38',
        '#D4001A',
        '#FF4D4D',
      ];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const brightness = data[idx];

          if (brightness > 45) {
            // Sampling probability
            if (Math.random() < 0.65) {
              const radius = Math.random() * 1.5 + 0.8;
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * 320 + 80;
              const color = colors[Math.floor(Math.random() * colors.length)];

              particles.push({
                originX: x + (Math.random() - 0.5) * 1.5,
                originY: y + (Math.random() - 0.5) * 1.5,
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                radius,
                baseAlpha: Math.random() * 0.35 + 0.65,
                color,
                dissipateAngle: angle,
                dissipateDist: dist,
                dissipateSpeed: Math.random() * 0.6 + 0.7,
              });
            }
          }
        }
      }
    };

    initParticles();

    // Mouse events
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.isHovered = false;
    };

    // Scroll tracking: calculate how far user has scrolled through/past hero
    const onScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      // Fraction from 0 (at top of page) to 1 (scrolled 1 screen down)
      const fraction = Math.min(Math.max(scrolled / (windowHeight * 0.85), 0), 1);
      scrollFraction = fraction;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', initParticles);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // Animation loop
    const animate = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const easeScroll = scrollFraction * scrollFraction; // Quadratic acceleration on scroll

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Calculate Target position based on scroll dissipation
        // As scroll fraction increases, particles fly outwards across the screen
        let targetX = p.originX + Math.cos(p.dissipateAngle) * p.dissipateDist * easeScroll * p.dissipateSpeed;
        let targetY = p.originY + Math.sin(p.dissipateAngle) * p.dissipateDist * easeScroll * p.dissipateSpeed;

        // 2. Interactive Cursor Distortion (Ferrari Fluid Hover Displace)
        if (mouse.isHovered) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            const force = (1 - distance / mouse.radius) * 35; // gentle, fluid displacement
            const angle = Math.atan2(dy, dx);
            // Repel away from cursor
            p.vx -= Math.cos(angle) * force * 0.18;
            p.vy -= Math.sin(angle) * force * 0.18;
          }
        }

        // Apply friction & spring back to target
        p.vx += (targetX - p.x) * 0.12;
        p.vy += (targetY - p.y) * 0.12;
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        // Opacity drops smoothly as they scatter outwards
        const alpha = Math.max(p.baseAlpha * (1 - easeScroll * 0.85), 0.05);

        // Draw clean crisp particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', initParticles);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="stipple-title-container"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'crosshair',
        userSelect: 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
