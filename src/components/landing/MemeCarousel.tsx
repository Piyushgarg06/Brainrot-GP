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
    .toUpperCase() || 'VAULT ARTIFACT';
}

export function MemeCarousel({ images }: MemeCarouselProps) {
  const reduced = usePrefersReducedMotion();

  if (images.length === 0) return null;

  // Seamless duplication for infinite loop
  const displayImages = [...images, ...images, ...images];

  return (
    <section id="memes" className="vault-marquee-section" aria-label="Paddock Meme Vault">
      <div className="vault-header">
        <div className="header-meta-left">
          <span className="vault-kicker">// 04 PADDOCK ARCHIVE</span>
          <h3 className="vault-heading">INSHEDENT ARCHIVES</h3>
        </div>
        <div className="header-meta-right">
          <span>{images.length} ARTIFACTS RECORDED</span>
          <span className="live-dot-pulse">● LIVE STREAM</span>
        </div>
      </div>

      {/* Single, pristine continuous marquee stream with pause-on-hover */}
      <div className="marquee-wrapper">
        <div className={`marquee-stream ${reduced ? 'static' : ''}`}>
          {displayImages.map((img, i) => {
            const caption = formatCaption(img);
            return (
              <div key={`${img}-${i}`} className="vault-card">
                <div className="card-image-box">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${img}`}
                    alt={caption}
                    loading="lazy"
                    className="card-img"
                  />
                  <div className="card-scanline" />
                </div>
                <div className="card-caption-bar">
                  <span className="caption-text">{caption}</span>
                  <span className="caption-idx">#{String((i % images.length) + 1).padStart(2, '0')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .vault-marquee-section {
          position: relative;
          width: 100%;
          padding: 80px 0 100px;
          background: #000000;
          overflow: hidden;
          user-select: none;
        }

        .vault-header {
          max-width: 1300px;
          margin: 0 auto 36px;
          padding: 0 36px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 18px;
        }

        .header-meta-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vault-kicker {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          color: rgba(255, 255, 255, 0.45);
        }

        .vault-heading {
          font-family: var(--font-display);
          font-size: clamp(24px, 3.5vw, 36px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0;
        }

        .header-meta-right {
          display: flex;
          align-items: center;
          gap: 16px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
        }

        .live-dot-pulse {
          color: #ff334b;
          font-weight: 600;
        }

        .marquee-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          display: flex;
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        .marquee-stream {
          display: flex;
          gap: 20px;
          animation: marqueeScroll 65s linear infinite;
          will-change: transform;
        }

        .marquee-wrapper:hover .marquee-stream {
          animation-play-state: paused;
        }

        @keyframes marqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }

        .vault-card {
          width: 270px;
          flex-shrink: 0;
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .vault-card:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: rgba(255, 51, 75, 0.5);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 51, 75, 0.15);
        }

        .card-image-box {
          position: relative;
          width: 100%;
          height: 190px;
          border-radius: 2px;
          overflow: hidden;
          background: #141414;
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(40%) contrast(115%);
          transition: filter 0.3s ease, transform 0.3s ease;
        }

        .vault-card:hover .card-img {
          filter: grayscale(0%) contrast(100%);
          transform: scale(1.04);
        }

        .card-scanline {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.12) 0px,
            rgba(0, 0, 0, 0.12) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
        }

        .card-caption-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2px 4px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.55);
        }

        .caption-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .caption-idx {
          color: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 768px) {
          .vault-card {
            width: 210px;
          }
          .card-image-box {
            height: 150px;
          }
          .vault-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </section>
  );
}
