'use client';

import Link from 'next/link';

export function DashboardCTA() {
  return (
    <section className="dashboard-cta-section">
      <div className="cta-ambient-glow" />
      <div className="cta-container">
        <span className="cta-kicker">// 03 PIT WALL ACCESS · 2026 LIVE TELEMETRY</span>
        <h2 className="cta-title">READY FOR LIGHTS OUT?</h2>
        <p className="cta-sub">
          Launch the unnecessary second-screen companion for live lap times, unfiltered team radio, and pure paddock chaos.
        </p>

        <div className="cta-btn-wrapper">
          <Link
            href="/dashboard"
            className="cta-dashboard-btn"
          >
            Open Dashboard →
          </Link>
        </div>

        <div className="cta-specs">
          <span className="spec-item">22 DRIVERS</span>
          <span className="spec-dot">·</span>
          <span className="spec-item">10 TEAMS</span>
          <span className="spec-dot">·</span>
          <span className="spec-item">0 BRAINCELLS</span>
        </div>
      </div>

      <style jsx>{`
        .dashboard-cta-section {
          position: relative;
          width: 100%;
          padding: 130px 24px;
          background: radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.8) 0%, #000000 80%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .cta-ambient-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 350px;
          background: radial-gradient(ellipse at center, rgba(255, 51, 75, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-container {
          position: relative;
          z-index: 10;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        .cta-kicker {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.45);
        }

        .cta-title {
          font-family: var(--font-display);
          font-size: clamp(38px, 6.5vw, 76px);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 0.95;
          margin: 0;
          color: #ffffff;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.9);
        }

        .cta-sub {
          font-family: var(--font-body);
          font-size: 15px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
          max-width: 520px;
          margin: 0;
        }

        .cta-btn-wrapper {
          margin-top: 8px;
        }

        .cta-dashboard-btn {
          font-family: var(--font-body);
          font-size: 14px;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: transparent;
          padding: 12px 28px;
          border-radius: 2px;
          text-decoration: none;
          display: inline-block;
          letter-spacing: 0.02em;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
        }

        .cta-dashboard-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #ff334b;
          transform: translateY(-1px);
        }

        .cta-specs {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 14px;
        }

        .spec-dot {
          color: rgba(255, 51, 75, 0.6);
        }
      `}</style>
    </section>
  );
}
