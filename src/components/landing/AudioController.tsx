'use client';

import { useState, useEffect } from 'react';

interface AudioControllerProps {
  currentTrackLabel?: string;
  progressPercent?: number; // 0 to 100
  timeString?: string;
  hasAudioSource?: boolean;
}

export function AudioController({
  currentTrackLabel = "max ver_radio.mp3",
  progressPercent = 35,
  timeString = "0:14 / 0:20",
  hasAudioSource = false,
}: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      <div className="cafeteria-bottom-bar">
        {/* Left Telemetry/Voice tag */}
        <div className="meta-left">
          <span className="meta-dim">RADIO</span> MAX VERSTAPPEN · RED BULL RACING
          <br />
          <span className="meta-code">00:00:2026 // INTERLAGOS GP</span>
        </div>

        {/* Center Pill Player */}
        <div className="audio-pill-wrap">
          <div className="audio-pill">
            {/* Colorful wave / pulse dot */}
            <div className={`audio-dot-ring ${isPlaying ? 'playing' : ''}`}>
              <div className="audio-gradient-dot" />
            </div>

            {/* Note / waveform icon */}
            <span className="audio-note-icon">♫</span>

            {/* Track / Radio quote snippet */}
            <span className="audio-label">{currentTrackLabel}</span>

            {/* Time */}
            <span className="audio-timer">{timeString}</span>

            {/* Little progress bar in pill */}
            <div className="audio-pill-progress">
              <div
                className="audio-pill-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Sound on / Mute toggle */}
        <div className="meta-right">
          <button
            className="sound-toggle-btn"
            onClick={() => setIsMuted(!isMuted)}
            title="Toggle sound"
          >
            <span className="sound-icon">
              {isMuted ? '🔇' : '🔊'}
            </span>
            <span className="sound-text">
              {isMuted ? 'SOUND OFF' : 'SOUND ON'}
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .cafeteria-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          pointer-events: none;
          z-index: 999;
        }

        .meta-left {
          font-family: var(--font-mono);
          font-size: 10px;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          line-height: 1.6;
          pointer-events: auto;
        }

        .meta-dim {
          color: rgba(255, 255, 255, 0.25);
        }

        .meta-code {
          color: rgba(255, 255, 255, 0.3);
        }

        .audio-pill-wrap {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .audio-pill {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(18, 18, 18, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          padding: 8px 24px 8px 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          min-width: 320px;
          max-width: 480px;
          overflow: hidden;
        }

        .audio-pill-progress {
          position: absolute;
          bottom: 0;
          left: 18px;
          right: 18px;
          height: 2px;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 2px;
          overflow: hidden;
        }

        .audio-pill-progress-fill {
          height: 100%;
          background: #ffffff;
          transition: width 0.15s ease-out;
        }

        .audio-dot-ring {
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .audio-gradient-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: conic-gradient(from 180deg at 50% 50%, #ff3b30, #ff9500, #34c759, #007aff, #af52de, #ff2d55);
          filter: blur(1px);
        }

        .audio-note-icon {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .audio-label {
          font-family: var(--font-body);
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .audio-timer {
          font-family: var(--font-mono);
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.05em;
        }

        .meta-right {
          pointer-events: auto;
        }

        .sound-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(18, 18, 18, 0.7);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 16px;
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          transition: all 0.2s ease;
        }

        .sound-toggle-btn:hover {
          background: rgba(28, 28, 28, 0.9);
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
          transform: translateY(-1px);
        }

        .sound-icon {
          font-size: 12px;
        }

        @media (max-width: 800px) {
          .meta-left, .meta-right {
            display: none;
          }
          .cafeteria-bottom-bar {
            justify-content: center;
            padding: 0 16px;
          }
          .audio-pill {
            min-width: 280px;
          }
        }
      `}</style>
    </>
  );
}

