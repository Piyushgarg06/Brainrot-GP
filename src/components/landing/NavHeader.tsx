'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function NavHeader() {
  const [currentSection, setCurrentSection] = useState(1);
  const sections = ['01', '02', '03', '04', '05', '06', '07', '08'];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      const clipEl = document.getElementById('interview-clip');
      const lineupEl = document.getElementById('lineup');
      const memesEl = document.getElementById('memes');

      const clipTop = clipEl ? clipEl.offsetTop : windowH;
      const lineupTop = lineupEl ? lineupEl.offsetTop : windowH * 3;
      const memesTop = memesEl ? memesEl.offsetTop : windowH * 10;

      if (scrollY < clipTop - windowH * 0.3) {
        setCurrentSection(1);
      } else if (scrollY < lineupTop - windowH * 0.3) {
        setCurrentSection(2);
      } else if (scrollY < memesTop - windowH * 0.3) {
        setCurrentSection(3);
      } else {
        setCurrentSection(4);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="cafeteria-header">
        <div className="header-pill">
          {/* Logo */}
          <Link href="/" className="header-brand">
            <span className="brand-dot" />
            <span className="brand-bracket">[</span>
            <span className="brand-name">brainrot gp</span>
            <span className="brand-bracket">]</span>
          </Link>

          {/* Center Links */}
          <nav className="header-nav">
            <button className="nav-item" onClick={() => scrollTo('interview-clip')}>
              interlagos 2026 ↓
            </button>
            <button className="nav-item" onClick={() => scrollTo('lineup')}>
              lineup
            </button>
            <button className="nav-item" onClick={() => scrollTo('memes')}>
              memes
            </button>
            <Link href="/dashboard" className="nav-item">
              telemetry
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            <Link href="/dashboard" className="client-login">
              live stream
            </Link>
            <Link href="/dashboard" className="btn-accent">
              open dashboard
            </Link>
          </div>
        </div>

        {/* Section Indicators (Top Right in inspo) */}
        <div className="section-tracker">
          <div className="section-numbers">
            {sections.map((num, i) => (
              <span
                key={num}
                className={`tracker-num ${i + 1 === currentSection ? 'active' : ''}`}
              >
                {num}
              </span>
            ))}
          </div>
          <div className="tracker-sublabel">2026 F1 REPORT</div>
        </div>
      </header>

      <style jsx>{`
        .cafeteria-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 24px 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
          pointer-events: none;
        }

        .header-pill {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(14, 14, 14, 0.78);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 6px 10px 6px 18px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 13px;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        .brand-dot {
          width: 6px;
          height: 6px;
          background: #ff334b;
          border-radius: 50%;
          box-shadow: 0 0 8px #ff334b;
          animation: dotBlink 2s infinite ease-in-out;
        }

        @keyframes dotBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .brand-bracket {
          color: rgba(255, 255, 255, 0.35);
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-item {
          font-family: var(--font-body, -apple-system, BlinkMacSystemFont, sans-serif);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.18s;
        }

        .nav-item:hover {
          color: #ffffff;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .client-login {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.18s;
        }

        .client-login:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .btn-accent {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          color: #080808;
          background: #ffffff;
          text-decoration: none;
          padding: 7px 16px;
          border-radius: 999px;
          transition: transform 0.15s, background-color 0.15s;
        }

        .btn-accent:hover {
          background: #ff334b;
          color: #ffffff;
          transform: scale(1.02);
        }

        .section-tracker {
          position: fixed;
          top: 32px;
          right: 36px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          font-family: var(--font-mono);
          pointer-events: auto;
        }

        .section-numbers {
          display: flex;
          gap: 8px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 0.05em;
        }

        .tracker-num.active {
          color: #ffffff;
          border-bottom: 1.5px solid #ff334b;
          padding-bottom: 2px;
          font-weight: 700;
        }

        .tracker-sublabel {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.12em;
        }

        @media (max-width: 900px) {
          .header-nav {
            display: none;
          }
          .section-tracker {
            display: none;
          }
        }
      `}</style>
    </>
  );
}