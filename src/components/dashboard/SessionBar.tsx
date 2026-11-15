'use client';

import { useState } from 'react';
import type { F1DataState } from '@/types/f1';

interface SessionBarProps {
  f1State: F1DataState;
}

function formatSessionLabel(sessionType: string): string {
  const upper = sessionType.toUpperCase();
  if (upper.includes('RACE'))       return 'RACE';
  if (upper.includes('QUALIFYING')) return 'Q3';
  if (upper.includes('PRACTICE'))   return 'FP1';
  if (upper.includes('SPRINT'))     return 'SPRINT';
  return upper.slice(0, 4);
}

export function SessionBar({ f1State }: SessionBarProps) {
  const { session, positions, drivers, driverNumberMap, fastestLap, isLive, raceFinished } = f1State;
  const [showInstructions, setShowInstructions] = useState(false);

  const leader = positions[0];
  const leaderCode = leader
    ? (driverNumberMap[leader.driverNumber] ?? String(leader.driverNumber))
    : null;
  const leaderGap = 'LEADER';

  const sessionLabel = session ? formatSessionLabel(session.sessionType) : '---';
  const sessionName  = session ? session.sessionName : 'No Session';
  const circuitName  = session ? session.circuitName : '';

  return (
    <>
      <header
        style={{
          height:         '48px',
          borderBottom:   '1px solid var(--border)',
          padding:        '0 24px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexShrink:     0,
          backgroundColor: 'var(--bg)',
        }}
      >
        {/* Left — speed-link back to home + instructions + session pill + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Sleek F1 Speeding back-link */}
          <a
            href="/"
            className="speed-back-link"
            aria-label="Back to landing page"
            title="Back to landing page"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--muted)',
              transition: 'color 0.2s, transform 0.2s',
            }}
          >
            <svg
              width="28"
              height="10"
              viewBox="0 0 40 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              {/* Mirror/Face left to represent "going back" */}
              <g transform="scale(-1, 1) translate(-40, 0)">
                <path d="M2 9 L5 5 L13 4 L17 2 L26 2 L32 4 L37 6 L38 9 Z" fill="currentColor" />
                <path d="M17 2 L19 0 L24 0 L26 2 Z" fill="currentColor" opacity="0.7" />
                <path d="M36 9 L40 9 L40 11 L36 10 Z" fill="currentColor" />
                <path d="M1 6 L0 6 L0 10 L2 10 Z" fill="currentColor" />
                <circle cx="31" cy="11" r="3" fill="currentColor" />
                <circle cx="9"  cy="11" r="3" fill="currentColor" />
              </g>
            </svg>
          </a>

          {/* Instructions button */}
          <button
            onClick={() => setShowInstructions(true)}
            className="instructions-btn"
            aria-label="How to use Brainrot-GP"
            title="How to use Brainrot-GP"
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             '5px',
              background:      'transparent',
              border:          '1px solid var(--border)',
              borderRadius:    '4px',
              color:           'var(--muted)',
              fontFamily:      'var(--font-body)',
              fontSize:        '11px',
              cursor:          'pointer',
              padding:         '3px 9px',
              transition:      'color 0.2s, border-color 0.2s, background 0.2s',
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>ℹ</span>
            <span>How to use</span>
          </button>

          <span
            style={{
              backgroundColor: 'var(--surface-2)',
              border:          '1px solid var(--border)',
              borderRadius:    '2px',
              fontFamily:      'var(--font-mono)',
              fontSize:        '11px',
              color:           'var(--muted)',
              padding:         '3px 8px',
            }}
          >
            {sessionLabel}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize:   '13px',
              color:      'var(--muted)',
            }}
          >
            {circuitName || sessionName}
          </span>
        </div>

        <style>{`
          .speed-back-link:hover {
            color: var(--text) !important;
            transform: translateX(-4px);
          }
          .instructions-btn:hover {
            color: var(--text) !important;
            border-color: var(--text) !important;
            background: var(--surface-2) !important;
          }
          .instructions-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .instructions-modal {
            background: var(--bg, #0f0f0f);
            border: 1px solid var(--border, #2a2a2a);
            border-radius: 10px;
            max-width: 540px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            padding: 28px 32px;
            position: relative;
            box-shadow: 0 24px 64px rgba(0,0,0,0.6);
          }
          .instructions-modal h2 {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: var(--text, #fff);
            margin: 0 0 20px;
            letter-spacing: -0.02em;
          }
          .instructions-modal h3 {
            font-family: var(--font-display);
            font-size: 13px;
            font-weight: 700;
            color: var(--text, #fff);
            margin: 20px 0 8px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .instructions-modal p,
          .instructions-modal li {
            font-family: var(--font-body);
            font-size: 13px;
            color: var(--muted, #999);
            line-height: 1.65;
            margin: 0 0 6px;
          }
          .instructions-modal ol {
            padding-left: 20px;
            margin: 0 0 8px;
          }
          .instructions-modal ul {
            padding-left: 20px;
            margin: 0 0 8px;
            list-style: none;
          }
          .instructions-modal ul li::before {
            content: attr(data-icon) " ";
          }
          .instructions-modal .section-divider {
            border: none;
            border-top: 1px solid var(--border, #2a2a2a);
            margin: 18px 0;
          }
          .instructions-modal .close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: transparent;
            border: none;
            color: var(--muted, #999);
            font-size: 20px;
            cursor: pointer;
            line-height: 1;
            padding: 4px 8px;
            border-radius: 4px;
            transition: color 0.15s, background 0.15s;
          }
          .instructions-modal .close-btn:hover {
            color: var(--text, #fff);
            background: var(--surface-2, #1a1a1a);
          }
          .instructions-modal .tip-box {
            background: var(--surface-2, #1a1a1a);
            border: 1px solid var(--border, #2a2a2a);
            border-radius: 6px;
            padding: 10px 14px;
            margin-top: 12px;
          }
          .instructions-modal .tip-box p {
            margin: 0;
          }
        `}</style>

        {/* Center — leader display */}
        <div
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '20px',
            fontWeight:    700,
            color:         'var(--text)',
            letterSpacing: '-0.02em',
            textAlign:     'center',
          }}
          aria-live="polite"
          aria-label={raceFinished ? 'Race finished' : (leaderCode ? `P1 leader: ${leaderCode}` : 'No data')}
        >
          {raceFinished
            ? <span style={{ fontSize: '16px', letterSpacing: '0.1em' }}>🏁 RACE FINISHED</span>
            : leaderCode
              ? `P1 · ${leaderCode} · ${leaderGap}`
              : isLive ? 'WAITING FOR DATA' : 'NO SESSION'}
        </div>

        {/* Right — fastest lap */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '12px',
            color:      'var(--muted)',
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
          }}
          aria-label={fastestLap ? `Fastest lap: ${fastestLap.time} by ${fastestLap.driverCode}` : 'No fastest lap'}
        >
          {fastestLap ? (
            <>
              <span style={{ color: '#9B59B6' }}>⬣</span>
              <span>{fastestLap.time} · {fastestLap.driverCode}</span>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
      </header>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="instructions-modal-backdrop"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="instructions-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="How to use Brainrot-GP"
          >
            <button
              className="close-btn"
              onClick={() => setShowInstructions(false)}
              aria-label="Close instructions"
            >
              ×
            </button>

            <h2>🏎️ How to Use BrainrotGP</h2>
            <ol>
              <li><strong>Select Your Driver:</strong> Click your favorite driver on the leaderboard to track their position battles and custom audio triggers.</li>
              <li><strong>Enable Audio:</strong> Ensure the audio volume slider at the bottom-left is unmuted.</li>
              <li><strong>Second-Screen Companion:</strong> Keep BrainrotGP running alongside your live race broadcast (on a second monitor or in the background).</li>
            </ol>

            <hr className="section-divider" />

            <h3>🪟 Windows Desktop App</h3>
            <p>
              When running the BrainrotGP Windows App, live telemetry and driver audio play continuously in the background even when the app is minimized or you switch to other windows.
            </p>

            <hr className="section-divider" />

            <h3>⏱️ Live Timing & Broadcast Delay</h3>
            <p>
              BrainrotGP connects directly to real-time track telemetry. Because live video streams (F1 TV, Sky Sports, FanCode) typically carry a 10–25s broadcast delay, you will often <strong>hear</strong> an overtake, leader swap, or pit move right before the broadcast feed shows it!
            </p>

            <hr className="section-divider" />

            <h3>🎵 Live Audio Triggers</h3>
            <ul>
              <li data-icon="🏁"><strong>P1 Leader Changes:</strong> Instant alert and theme when a new driver takes P1.</li>
              <li data-icon="📈"><strong>Position Battles:</strong> Custom radio audio whenever your selected driver advances.</li>
              <li data-icon="⚡"><strong>Fastest Laps:</strong> Purple sector alerts when a driver sets the benchmark time.</li>
              <li data-icon="🏆"><strong>Race Finish:</strong> Checkered flag celebration for the Grand Prix winner.</li>
            </ul>

            <div className="tip-box">
              <p>
                💡 <strong>Tip for Live Races:</strong> Leave the dashboard open throughout the entire Grand Prix session. It continuously updates telemetry and triggers audio in real time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
