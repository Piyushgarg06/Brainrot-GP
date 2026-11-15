'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isDesktopApp } from '@/lib/isDesktop';
import { LiveDashboard } from '@/components/dashboard/LiveDashboard';

export default function DashboardPage() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDesktop(isDesktopApp());
  }, []);

  // Mounting / initial detection state
  if (isDesktop === null) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        Initializing Telemetry Link...
      </div>
    );
  }

  // If accessed on the web, remove dashboard access and prompt download
  if (!isDesktop) {
    return (
      <div className="web-gate-wrapper">
        <div className="ambient-grid" />
        <div className="ambient-glow" />

        <div className="web-gate-card">
          <div className="gate-kicker">// 03 PIT WALL ACCESS · DESKTOP ONLY</div>
          <h1 className="gate-title">BRAINROTGP IS A WINDOWS APP</h1>
          <p className="gate-desc">
            To provide zero cloud server limits, direct real-time telemetry from OpenF1, and persistent background audio while you watch the Grand Prix, the dashboard is exclusively available on the native Windows application.
          </p>

          <div className="gate-actions">
            <a
              href="https://github.com/Piyushgarg06/Brainrot-GP/releases/latest"
              className="gate-download-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Brainrot-GP for Windows ↓
            </a>
            <Link href="/" className="gate-back-link">
              ← Return to Home
            </Link>
          </div>

          <div className="gate-specs">
            <span>DIRECT OPENF1 CONNECTION</span>
            <span>·</span>
            <span>PERSISTENT BACKGROUND AUDIO</span>
            <span>·</span>
            <span>AUTO-UPDATES</span>
          </div>
        </div>

        <style jsx>{`
          .web-gate-wrapper {
            position: relative;
            width: 100vw;
            min-height: 100vh;
            background: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #ffffff;
          }
          .ambient-grid {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(
                to right,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px
              );
            background-size: 40px 40px;
            pointer-events: none;
          }
          .ambient-glow {
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(
              circle,
              rgba(255, 51, 75, 0.12) 0%,
              transparent 70%
            );
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          }
          .web-gate-card {
            position: relative;
            z-index: 10;
            max-width: 580px;
            width: 100%;
            background: rgba(14, 14, 14, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 44px 36px;
            border-radius: 4px;
            text-align: center;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85);
          }
          .gate-kicker {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            letter-spacing: 0.16em;
            color: #ff334b;
            text-transform: uppercase;
            margin-bottom: 16px;
          }
          .gate-title {
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.03em;
            line-height: 1.1;
            margin-bottom: 16px;
            color: #ffffff;
          }
          .gate-desc {
            font-size: 14px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.65);
            margin-bottom: 32px;
          }
          .gate-actions {
            display: flex;
            flex-direction: column;
            gap: 14px;
            align-items: center;
          }
          .gate-download-btn {
            display: inline-block;
            background: #ffffff;
            color: #000000;
            font-size: 14px;
            font-weight: 700;
            padding: 14px 32px;
            border-radius: 2px;
            text-decoration: none;
            letter-spacing: 0.02em;
            transition: transform 0.15s ease, background 0.15s ease;
            width: 100%;
            max-width: 360px;
          }
          .gate-download-btn:hover {
            background: #f0f0f0;
            transform: translateY(-1px);
          }
          .gate-back-link {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.45);
            text-decoration: none;
            letter-spacing: 0.05em;
            padding: 6px 12px;
            transition: color 0.15s ease;
          }
          .gate-back-link:hover {
            color: #ffffff;
          }
          .gate-specs {
            margin-top: 36px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 0.12em;
            color: rgba(255, 255, 255, 0.35);
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    );
  }

  return <LiveDashboard />;
}
