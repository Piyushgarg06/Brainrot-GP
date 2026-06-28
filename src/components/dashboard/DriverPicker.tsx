'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DRIVERS, type Driver } from '@/lib/drivers';
import { springs } from '@/lib/springs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const STORAGE_KEY = 'brainrotgp-favorite-driver';

// Group drivers by team preserving insertion order
const TEAM_GROUPS: Record<string, Driver[]> = {};
for (const driver of Object.values(DRIVERS)) {
  if (!TEAM_GROUPS[driver.team]) TEAM_GROUPS[driver.team] = [];
  TEAM_GROUPS[driver.team].push(driver);
}

interface DriverPickerProps {
  value:    string | null;   // selected driver code
  onChange: (code: string | null) => void;
}

export function DriverPicker({ value, onChange }: DriverPickerProps) {
  const [open, setOpen]      = useState(false);
  const panelRef             = useRef<HTMLDivElement>(null);
  const reduced              = usePrefersReducedMotion();
  const selectedDriver       = value ? DRIVERS[value] : null;

  const [apiKey, setApiKey]  = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('brainrotgp-openf1-key') || '');
    }
  }, []);

  const updateApiKey = (val: string) => {
    setApiKey(val);
    if (typeof window !== 'undefined') {
      if (val.trim()) {
        localStorage.setItem('brainrotgp-openf1-key', val.trim());
      } else {
        localStorage.removeItem('brainrotgp-openf1-key');
      }
      window.dispatchEvent(new Event('brainrotgp-key-updated'));
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = (code: string | null) => {
    onChange(code);
    setOpen(false);
    if (code) {
      localStorage.setItem(STORAGE_KEY, code);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div
      ref={panelRef}
      style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}
    >
      {/* Trigger button */}
      <button
        id="customize-driver-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={selectedDriver ? `Your driver: ${selectedDriver.code}` : 'Pick your driver'}
        style={{
          fontFamily:      'var(--font-mono)',
          fontSize:        '10px',
          color:           selectedDriver ? 'var(--text)' : 'var(--muted)',
          backgroundColor: 'var(--surface-2)',
          border:          `1px solid ${selectedDriver ? selectedDriver.teamColor : 'var(--border)'}`,
          borderRadius:    '2px',
          padding:         '5px 12px',
          cursor:          'pointer',
          letterSpacing:   '0.06em',
          display:         'flex',
          alignItems:      'center',
          gap:             '8px',
          transition:      'border-color 0.15s',
          whiteSpace:      'nowrap',
        }}
      >
        {selectedDriver ? (
          <>
            <span
              style={{
                width:           '6px',
                height:          '6px',
                borderRadius:    '50%',
                backgroundColor: selectedDriver.teamColor,
                flexShrink:      0,
              }}
            />
            {selectedDriver.code} · YOUR DRIVER
          </>
        ) : (
          '⊕ PICK YOUR DRIVER'
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 8, scale: 0.98 }}
            animate={reduced ? {} : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced   ? {} : { opacity: 0, y: 8, scale: 0.98 }}
            transition={springs.snappy}
            style={{
              position:        'absolute',
              bottom:          'calc(100% + 8px)',
              left:            '50%',
              transform:       'translateX(-50%)',
              width:           '280px',
              maxHeight:       '420px',
              overflowY:       'auto',
              backgroundColor: 'var(--surface)',
              border:          '1px solid var(--border)',
              borderRadius:    '2px',
            }}
            role="listbox"
            aria-label="Select your driver"
          >
            {/* API Key configuration */}
            <div
              style={{
                padding:       '12px 14px',
                borderBottom:  '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
              }}
            >
              <div
                style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '9px',
                  color:         'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom:  '6px',
                  display:       'flex',
                  justifyContent: 'space-between',
                  alignItems:    'center',
                }}
              >
                <span>OpenF1 API Key (Live Race)</span>
                {apiKey && (
                  <button
                    onClick={() => updateApiKey('')}
                    style={{
                      background: 'none',
                      border:     'none',
                      color:      'var(--accent)',
                      fontSize:   '8px',
                      cursor:     'pointer',
                      padding:    0,
                      textTransform: 'uppercase',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="Paste Stripe Token..."
                value={apiKey}
                onChange={e => updateApiKey(e.target.value)}
                style={{
                  width:           '100%',
                  backgroundColor: 'var(--surface)',
                  border:          '1px solid var(--border)',
                  borderRadius:    '2px',
                  color:           'var(--text)',
                  fontFamily:      'var(--font-mono)',
                  fontSize:        '10px',
                  padding:         '6px 8px',
                  outline:         'none',
                }}
              />
            </div>

            {/* Clear selection */}
            {value && (
              <button
                onClick={() => select(null)}
                style={{
                  width:         '100%',
                  padding:       '10px 14px',
                  textAlign:     'left',
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '10px',
                  color:         'var(--muted)',
                  borderBottom:  '1px solid var(--border)',
                  letterSpacing: '0.05em',
                  cursor:        'pointer',
                }}
              >
                ✕  CLEAR SELECTION
              </button>
            )}

            {/* Teams + drivers */}
            {Object.entries(TEAM_GROUPS).map(([team, drivers]) => (
              <div key={team}>
                {/* Team header */}
                <div
                  style={{
                    padding:       '6px 14px 4px',
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '9px',
                    color:         'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    borderBottom:  '1px solid var(--border)',
                    backgroundColor: 'var(--surface-2)',
                  }}
                >
                  {team}
                </div>

                {/* Driver rows */}
                {drivers.map(driver => {
                  const isSelected = value === driver.code;
                  return (
                    <button
                      key={driver.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => select(driver.code)}
                      style={{
                        width:           '100%',
                        padding:         '9px 14px',
                        textAlign:       'left',
                        display:         'flex',
                        alignItems:      'center',
                        gap:             '10px',
                        borderBottom:    '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--surface-2)' : 'transparent',
                        cursor:          'pointer',
                        transition:      'background 0.1s',
                        borderLeft:      isSelected ? `2px solid ${driver.teamColor}` : '2px solid transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Team color dot */}
                      <span
                        style={{
                          width:           '5px',
                          height:          '5px',
                          borderRadius:    '50%',
                          backgroundColor: driver.teamColor,
                          flexShrink:      0,
                        }}
                      />
                      {/* Driver code */}
                      <span
                        style={{
                          fontFamily:    'var(--font-display)',
                          fontSize:      '14px',
                          fontWeight:    700,
                          color:         isSelected ? 'var(--text)' : 'var(--text)',
                          letterSpacing: '-0.01em',
                          width:         '40px',
                          flexShrink:    0,
                        }}
                      >
                        {driver.code}
                      </span>
                      {/* Full name */}
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize:   '12px',
                          color:      'var(--muted)',
                        }}
                      >
                        {driver.name}
                      </span>
                      {/* Selected checkmark */}
                      {isSelected && (
                        <span style={{ marginLeft: 'auto', color: driver.teamColor, fontSize: '12px' }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Read saved favorite from localStorage — call on mount */
export function loadFavoriteDriver(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored || !DRIVERS[stored]) return null;
  return stored;
}
