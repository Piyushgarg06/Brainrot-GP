'use client';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface MemeCarouselProps {
  images: string[];
}

function formatCaption(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[#_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase() || 'IMAGE';
}

export function MemeCarousel({ images }: MemeCarouselProps) {
  const reduced = usePrefersReducedMotion();

  if (images.length === 0) return null;

  // Split images into two rows for dynamic visual depth
  // Row 1 goes left, Row 2 goes right
  const half = Math.ceil(images.length / 2);
  const row1 = images.slice(0, half);
  const row2 = images.slice(half);

  // Triple the items to ensure seamless wrapping without gaps on wide displays
  const row1Items = [...row1, ...row1, ...row1];
  const row2Items = [...row2, ...row2, ...row2];

  return (
    <section
      style={{
        padding: '80px 0',
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-label="Meme marquee carousel"
    >
      {/* Header Info */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--muted)',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        <span>// PIT LANE INVENTORY</span>
        <span>LIVE AUTOMATIC STREAM ({images.length} TOTAL)</span>
      </div>

      {/* Row 1: Scrolling Left */}
      <div
        className="marquee-container"
        style={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          // Edge fade effect using CSS masking
          maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
        }}
      >
        <div
          className="marquee-track left"
          style={{
            display: 'flex',
            gap: '16px',
            animation: reduced ? 'none' : 'scroll-left 45s linear infinite',
            // Allow wrapping
            flexShrink: 0,
          }}
        >
          {row1Items.map((img, i) => {
            const caption = formatCaption(img);
            return (
              <div
                key={`r1-${img}-${i}`}
                style={{
                  width: '240px',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '2px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flexShrink: 0,
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--text)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div
                  className="carbon-bg"
                  style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${img}`}
                    alt={caption}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--muted)',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  // {caption}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Scrolling Right */}
      <div
        className="marquee-container"
        style={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
        }}
      >
        <div
          className="marquee-track right"
          style={{
            display: 'flex',
            gap: '16px',
            animation: reduced ? 'none' : 'scroll-right 45s linear infinite',
            flexShrink: 0,
          }}
        >
          {row2Items.map((img, i) => {
            const caption = formatCaption(img);
            return (
              <div
                key={`r2-${img}-${i}`}
                style={{
                  width: '240px',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '2px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flexShrink: 0,
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--text)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div
                  className="carbon-bg"
                  style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${img}`}
                    alt={caption}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--muted)',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  // {caption}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(calc(-100% / 3));
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
