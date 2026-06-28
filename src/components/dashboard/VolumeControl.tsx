'use client';

interface VolumeControlProps {
  volume:      number;
  muted:       boolean;
  onVolume:    (v: number) => void;
  onToggleMute: () => void;
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: muted ? 'var(--text)' : 'var(--muted)', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Speaker body */}
      <path
        d="M2 5.5H4.5L8 2.5V13.5L4.5 10.5H2V5.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Sound waves (hidden when muted) */}
      {!muted && (
        <>
          <path d="M10 5.5C10.8 6.1 11.3 7 11.3 8S10.8 9.9 10 10.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M12 3.5C13.6 4.8 14.5 6.3 14.5 8S13.6 11.2 12 12.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* Muted strikethrough */}
      {muted && (
        <line x1="10" y1="5" x2="14" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function VolumeControl({ volume, muted, onVolume, onToggleMute }: VolumeControlProps) {
  const percentage = Math.round(muted ? 0 : volume * 100);

  return (
    <div
      style={{
        position:   'fixed',
        bottom:     '16px',
        left:       '16px',
        display:    'flex',
        alignItems: 'center',
        gap:        '10px',
        zIndex:     50,
      }}
      aria-label="Volume control"
    >
      {/* Mute toggle */}
      <button
        onClick={onToggleMute}
        style={{ display: 'flex', alignItems: 'center' }}
        aria-label={muted ? 'Unmute' : 'Mute'}
        title={muted ? 'Unmute' : 'Mute'}
      >
        <SpeakerIcon muted={muted} />
      </button>

      {/* Custom range slider */}
      <div style={{ position: 'relative', width: '80px', height: '16px', display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div
          style={{
            position:        'absolute',
            left:            0,
            right:           0,
            height:          '2px',
            backgroundColor: 'var(--border)',
          }}
        />
        {/* Filled portion */}
        <div
          style={{
            position:        'absolute',
            left:            0,
            width:           `${muted ? 0 : volume * 100}%`,
            height:          '2px',
            backgroundColor: 'var(--text)',
            transition:      'width 0.1s',
          }}
        />
        {/* The actual range input (transparent, covers track) */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={e => {
            const v = parseFloat(e.target.value);
            onVolume(v);
            if (muted && v > 0) onToggleMute(); // auto-unmute on drag
          }}
          aria-label="Volume"
          style={{
            position:        'absolute',
            left:            0,
            right:           0,
            width:           '100%',
            appearance:      'none',
            WebkitAppearance:'none',
            background:      'transparent',
            cursor:          'pointer',
            height:          '16px',
            margin:          0,
            padding:         0,
          }}
        />
      </div>

      {/* Percentage label */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   '11px',
          color:      'var(--muted)',
          width:      '30px',
          flexShrink: 0,
        }}
        aria-live="polite"
      >
        {percentage}%
      </span>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance:         none;
          width:              10px;
          height:             10px;
          border-radius:      50%;
          background:         var(--text);
          cursor:             pointer;
          border:             none;
        }
        input[type=range]::-moz-range-thumb {
          width:              10px;
          height:             10px;
          border-radius:      50%;
          background:         var(--text);
          cursor:             pointer;
          border:             none;
        }
        input[type=range]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
