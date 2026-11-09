'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { getGlobalSound, setGlobalSound, SOUND_CHANGE_EVENT } from '@/lib/soundState';

interface DriverItem {
  id: string;
  name: string;
  team: string;
  number: string;
  image: string;
  audioFile?: string;
  audioOffset?: number;
}

// All 22 drivers with exact names, numbers, images & audio configuration
const LINEUP_DRIVERS: DriverItem[] = [
  {
    id: 'ver',
    name: 'MAX VERSTAPPEN',
    team: 'RED BULL RACING',
    number: '3',
    image: '/lineup/Max Verstappen 3.jpg',
    audioFile: 'Max_Verstappen',
    audioOffset: 14,
  },
  {
    id: 'nor',
    name: 'LANDO NORRIS',
    team: 'MCLAREN F1',
    number: '4',
    image: '/lineup/Lando Norris 4.jpg',
    audioFile: 'Lando_Norris',
    audioOffset: 0,
  },
  {
    id: 'lec',
    name: 'CHARLES LECLERC',
    team: 'SCUDERIA FERRARI',
    number: '16',
    image: '/lineup/Charles Leclerc 16.jpg',
    audioFile: 'Charles_Leclerc',
    audioOffset: 16,
  },
  {
    id: 'ham',
    name: 'LEWIS HAMILTON',
    team: 'SCUDERIA FERRARI',
    number: '44',
    image: '/lineup/Lewis Hamilton 44.webp',
    audioFile: 'Lewis_Hamilton',
    audioOffset: 2,
  },
  {
    id: 'rus',
    name: 'GEORGE RUSSELL',
    team: 'MERCEDES-AMG',
    number: '63',
    image: '/lineup/George Russell 63.jpg',
    audioFile: 'George_Russel',
    audioOffset: 0,
  },
  {
    id: 'pia',
    name: 'OSCAR PIASTRI',
    team: 'MCLAREN F1',
    number: '81',
    image: '/lineup/Oscar Piastri 81.jpg',
    audioFile: 'Oscar_Piastri',
    audioOffset: 0,
  },
  {
    id: 'alo',
    name: 'FERNANDO ALONSO',
    team: 'ASTON MARTIN',
    number: '14',
    image: '/lineup/Fernandio Alonso 14.webp',
    audioFile: 'Fernando_Alonso',
    audioOffset: 20,
  },
  {
    id: 'sai',
    name: 'CARLOS SAINZ',
    team: 'WILLIAMS RACING',
    number: '55',
    image: '/lineup/Carlos Sainz 55.jpg',
    audioFile: 'Carlos_Sainz',
    audioOffset: 79,
  },
  {
    id: 'ant',
    name: 'KIMI ANTONELLI',
    team: 'MERCEDES-AMG',
    number: '1',
    image: '/lineup/Kimi Antonelli 1.jpg',
    audioFile: 'Kimi_Antonelli',
    audioOffset: 0,
  },
  {
    id: 'gas',
    name: 'PIERRE GASLY',
    team: 'ALPINE F1',
    number: '10',
    image: '/lineup/Pierre Gasly 10.jpg',
    audioFile: 'Pierre_Gassly',
    audioOffset: 5,
  },
  {
    id: 'col',
    name: 'FRANCO COLAPINTO',
    team: 'ALPINE F1',
    number: '43',
    image: '/lineup/Franco Colapinto 43.jpg',
    audioFile: 'Franco_Colapinto',
    audioOffset: 14,
  },
  {
    id: 'alb',
    name: 'ALEX ALBON',
    team: 'WILLIAMS RACING',
    number: '23',
    image: '/lineup/Alex Albon 23.jpg',
    audioFile: 'Alex_Albon',
    audioOffset: 0,
  },
  {
    id: 'law',
    name: 'LIAM LAWSON',
    team: 'RACING BULLS',
    number: '30',
    image: '/lineup/Liam Lawson 30.jpg',
    audioFile: 'Liam_Lawson',
    audioOffset: 0,
  },
  {
    id: 'had',
    name: 'ISACK HADJAR',
    team: 'RED BULL RACING',
    number: '6',
    image: '/lineup/Isack Hadjar 6.jpg',
    audioFile: 'Isack_Hadjar',
    audioOffset: 3,
  },
  {
    id: 'lin',
    name: 'ARVID LINDBLAD',
    team: 'RACING BULLS',
    number: '41',
    image: '/lineup/Arvid Lindblad 41.jpg',
    audioFile: 'Arvid_Lindblad',
    audioOffset: 7,
  },
  {
    id: 'bor',
    name: 'GABRIEL BORTOLETO',
    team: 'AUDI F1',
    number: '5',
    image: '/lineup/Gabriel Bortoleto 5.webp',
    audioFile: 'Gabriel_Bortoleto',
    audioOffset: 4,
  },
  {
    id: 'hul',
    name: 'NICO HULKENBERG',
    team: 'AUDI F1',
    number: '27',
    image: '/lineup/Nico Hulkenberg 27.jpg',
    audioFile: 'Nico_Hulkenberg',
    audioOffset: 0,
  },
  {
    id: 'bea',
    name: 'OLIVER BEARMAN',
    team: 'HAAS F1 TEAM',
    number: '87',
    image: '/lineup/Oliver Bearman 87.webp',
    audioFile: 'Oliver_Bearman',
    audioOffset: 0,
  },
  {
    id: 'cam',
    name: 'RAFAEL CÂMARA',
    team: 'HAAS F1 TEAM',
    number: '50',
    image: encodeURI('/lineup/Rafael Câmara 50.jpg'),
    audioFile: 'Oliver_Bearman',
    audioOffset: 0,
  },
  {
    id: 'str',
    name: 'LANCE STROLL',
    team: 'ASTON MARTIN',
    number: '18',
    image: '/lineup/Lance Stroll 18.webp',
    audioFile: 'Lance_Stroll',
    audioOffset: 7,
  },
  {
    id: 'per',
    name: 'SERGIO PEREZ',
    team: 'CADILLAC F1',
    number: '11',
    image: '/lineup/Sergio Perez 11.jpg',
    audioFile: 'Sergio_Perez',
    audioOffset: 25,
  },
  {
    id: 'bot',
    name: 'VALTTERI BOTTAS',
    team: 'CADILLAC F1',
    number: '77',
    image: '/lineup/Valterri Bottas 77.jpg',
    audioFile: 'Valterri_Bottas',
    audioOffset: 100,
  },
];

// Peripheral gallery slots pinned strictly around the outer corners/edges
// so the central horizontal band of driver names is 100% clear with zero overlap
const GALLERY_SLOTS = [
  { top: '10%', left: '4%', width: '240px', height: '290px' },
  { bottom: '12%', right: '4%', width: '250px', height: '300px' },
  { bottom: '12%', left: '4%', width: '250px', height: '300px' },
  { top: '14%', right: '4%', width: '230px', height: '280px' },
  { top: '8%', left: '26%', width: '220px', height: '260px' },
  { bottom: '8%', left: '28%', width: '220px', height: '260px' },
  { bottom: '8%', right: '28%', width: '220px', height: '260px' },
  { top: '8%', right: '24%', width: '210px', height: '250px' },
];

export function HalftoneLineup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const driverAudioRef = useRef<HTMLAudioElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevDriver, setPrevDriver] = useState<DriverItem | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down'>('up');
  const [revealedList, setRevealedList] = useState<string[]>([]);

  const [hoveredDriver, setHoveredDriver] = useState<string | null>(null);
  const [activeSnippetDriver, setActiveSnippetDriver] = useState<string | null>(null);
  const activeSnippetDriverRef = useRef<string | null>(null);

  const [isThemePlaying, setIsThemePlaying] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const wasInSection = useRef(false);
  const transitionTimer = useRef<NodeJS.Timeout | null>(null);
  const activeIndexRef = useRef(0);

  // Play F1 Theme audio from 10s ONLY
  const playTheme = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stop any active driver voice snippet first
    const driverAudio = driverAudioRef.current;
    if (driverAudio) {
      driverAudio.pause();
      setActiveSnippetDriver(null);
      activeSnippetDriverRef.current = null;
    }

    if (audio.currentTime < 9.8 || audio.currentTime > 10.5) {
      audio.currentTime = 10;
    }
    audio.volume = 0.85;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsThemePlaying(true))
        .catch(() => setIsThemePlaying(false));
    }
  }, []);

  const pauseTheme = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsThemePlaying(false);
    }
  }, []);

  const pauseAllAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsThemePlaying(false);
    }
    const driverAudio = driverAudioRef.current;
    if (driverAudio) {
      driverAudio.pause();
      setActiveSnippetDriver(null);
      activeSnippetDriverRef.current = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Focus on Driver & Play Song:
  // THEME COMPLETELY STOPS AND DOES NOT RESUME AUTOMATICALLY
  // ─────────────────────────────────────────────────────────────────
  const playDriverSnippet = useCallback((driver: DriverItem) => {
    const themeAudio = audioRef.current;
    const driverAudio = driverAudioRef.current;

    // 1. Theme must completely stop immediately
    if (themeAudio) {
      themeAudio.pause();
      setIsThemePlaying(false);
    }

    if (!driver.audioFile || !driverAudio) return;

    // If currently playing this driver, clicking toggles pause
    if (activeSnippetDriverRef.current === driver.id && !driverAudio.paused) {
      driverAudio.pause();
      setActiveSnippetDriver(null);
      activeSnippetDriverRef.current = null;
      return;
    }

    // 2. Stop any current playback on driverAudio
    driverAudio.pause();

    const offset = driver.audioOffset || 0;
    const audioSrc = `/audio/${driver.audioFile}.mp3`;

    // 3. Set clean audio src and volume
    driverAudio.src = audioSrc;
    driverAudio.volume = 0.95;

    // Seek helper for start offset
    const applySeek = () => {
      if (offset > 0) {
        try {
          driverAudio.currentTime = offset;
        } catch {}
      }
    };

    if (driverAudio.readyState >= 1) {
      applySeek();
    } else {
      driverAudio.addEventListener('loadedmetadata', applySeek, { once: true });
      driverAudio.addEventListener('canplay', applySeek, { once: true });
    }

    // 4. Play directly inside trusted user click handler
    const playPromise = driverAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setActiveSnippetDriver(driver.id);
          activeSnippetDriverRef.current = driver.id;
          if (offset > 0 && Math.abs(driverAudio.currentTime - offset) > 1.5) {
            try {
              driverAudio.currentTime = offset;
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('[DriverAudio] playback failed:', err);
          setActiveSnippetDriver(null);
          activeSnippetDriverRef.current = null;
        });
    }

    // When driver song/clip finishes, radio stops (theme stays stopped)
    driverAudio.onended = () => {
      setActiveSnippetDriver(null);
      activeSnippetDriverRef.current = null;
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Music Bar: User clicks music bar to play F1 Theme
  // FOCUS MUSIC STOPS IMMEDIATELY
  // ─────────────────────────────────────────────────────────────────
  const handlePlayThemeFromMusicBar = () => {
    const driverAudio = driverAudioRef.current;
    const themeAudio = audioRef.current;

    // 1. Focus music MUST stop playing immediately
    if (driverAudio) {
      driverAudio.pause();
      setActiveSnippetDriver(null);
      activeSnippetDriverRef.current = null;
    }

    // 2. Toggle Theme playback
    if (isThemePlaying) {
      if (themeAudio) {
        themeAudio.pause();
      }
      setIsThemePlaying(false);
      setGlobalSound(false);
    } else {
      if (themeAudio) {
        if (themeAudio.currentTime < 9.8 || themeAudio.currentTime > 10.5) {
          themeAudio.currentTime = 10;
        }
        themeAudio.volume = 0.85;
        themeAudio.play()
          .then(() => {
            setIsThemePlaying(true);
            setGlobalSound(true);
          })
          .catch(() => setIsThemePlaying(false));
      }
    }
  };

  // Upward kinetic transition to target driver
  const triggerTransition = useCallback((nextIdx: number, direction: 'up' | 'down' = 'up') => {
    const currentIdx = activeIndexRef.current;
    if (nextIdx === currentIdx) return;

    const prev = LINEUP_DRIVERS[currentIdx];
    setPrevDriver(prev);
    setTransitionDirection(direction);
    setIsTransitioning(true);
    setActiveIndex(nextIdx);
    activeIndexRef.current = nextIdx;

    // Add previous driver to revealed list (maintaining order for unique perimeter slots)
    setRevealedList(prevList => {
      if (prevList.includes(prev.id)) {
        return [...prevList.filter(id => id !== prev.id), prev.id];
      }
      return [...prevList, prev.id];
    });

    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      setIsTransitioning(false);
      setPrevDriver(null);
    }, 520);
  }, []);

  // Click driver to scroll directly to their position & focus on them
  const scrollToDriver = (targetIdx: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerTop = scrollTop + rect.top;
    const totalScrollable = rect.height - window.innerHeight;

    const targetDriverP = targetIdx / (LINEUP_DRIVERS.length - 1);
    const targetSectionP = 0.06 + targetDriverP * 0.92;
    const targetScrollY = containerTop + targetSectionP * totalScrollable;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });

    triggerTransition(targetIdx, targetIdx >= activeIndex ? 'up' : 'down');
    playDriverSnippet(LINEUP_DRIVERS[targetIdx]);
  };

  // Interactive 3D perspective mouse tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = ((clientX / innerWidth) - 0.5) * 2;
    const y = ((clientY / innerHeight) - 0.5) * 2;
    setMouseOffset({ x, y });
  };

  // ─────────────────────────────────────────────────────────────────
  // Pure Manual Scroll tracking (NO auto-scroll loop)
  // Decoupled from activeSnippetDriver state so audio is NEVER cut!
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      // Position tracking:
      // 1. Above lineup (Hero or Starfield Video Reveal): rect.top > windowHeight * 0.4
      // 2. Inside lineup: rect.top <= windowHeight * 0.4 && rect.bottom >= windowHeight * 0.2
      // 3. Below lineup (scrolled past into DashboardCTA / MemeCarousel): rect.bottom < windowHeight * 0.2
      const isAboveSection = rect.top > windowHeight * 0.4;
      const isPastSectionBelow = rect.bottom < windowHeight * 0.2;
      const inSection = !isAboveSection && !isPastSectionBelow;

      if (inSection) {
        if (!wasInSection.current) {
          wasInSection.current = true;
          if (getGlobalSound() && !activeSnippetDriverRef.current) {
            playTheme();
          }
        }
      } else if (isAboveSection) {
        // Scrolled UP above Lineup -> stop all lineup audio (keep Hero & Video clean)
        if (wasInSection.current) {
          wasInSection.current = false;
          pauseAllAudio();
        }
      } else if (isPastSectionBelow) {
        // Scrolled DOWN past Lineup -> THEME KEEPS ON PLAYING!
        // If driver audio was playing when exiting lineup, stop it and start theme
        if (activeSnippetDriverRef.current) {
          const driverAudio = driverAudioRef.current;
          if (driverAudio) {
            driverAudio.pause();
          }
          setActiveSnippetDriver(null);
          activeSnippetDriverRef.current = null;
          if (getGlobalSound()) {
            playTheme();
          }
        }
        wasInSection.current = true;
      }

      if (totalScrollable > 0) {
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
        setScrollProgress(progress);

        // Map manual scroll progress to driver index
        const driverP = Math.min(Math.max((progress - 0.06) / 0.92, 0), 1);
        const targetIdx = Math.min(
          Math.max(Math.round(driverP * (LINEUP_DRIVERS.length - 1)), 0),
          LINEUP_DRIVERS.length - 1
        );

        if (targetIdx !== activeIndexRef.current) {
          const dir = targetIdx >= activeIndexRef.current ? 'up' : 'down';
          triggerTransition(targetIdx, dir);

          // The moment the user scrolls past the focused driver, resume the F1 theme
          if (activeSnippetDriverRef.current) {
            const driverAudio = driverAudioRef.current;
            if (driverAudio) {
              driverAudio.pause();
            }
            setActiveSnippetDriver(null);
            activeSnippetDriverRef.current = null;
            if (getGlobalSound()) {
              playTheme();
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Stop all audio immediately when tab changes or window loses focus
    const handleVisibility = () => {
      if (document.hidden) {
        pauseAllAudio();
      } else if (wasInSection.current && getGlobalSound() && !activeSnippetDriverRef.current) {
        playTheme();
      }
    };

    const handleWindowBlur = () => {
      pauseAllAudio();
    };

    const handleWindowFocus = () => {
      if (wasInSection.current && getGlobalSound() && !document.hidden && !activeSnippetDriverRef.current) {
        playTheme();
      }
    };

    const onSoundChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      const enabled = Boolean(custom.detail?.enabled);
      if (wasInSection.current) {
        if (enabled && !activeSnippetDriverRef.current) {
          playTheme();
        } else {
          pauseTheme();
        }
      }
    };

    window.addEventListener(SOUND_CHANGE_EVENT, onSoundChange);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener(SOUND_CHANGE_EVENT, onSoundChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, [playTheme, pauseTheme, pauseAllAudio, triggerTransition]);

  const currentDriver = LINEUP_DRIVERS[activeIndex];
  const isHeadingOnly = scrollProgress < 0.05;

  // Adaptive font scaling helper for long driver names
  const isLongName = (name: string) => name.length >= 14;

  // 3D Parallax offset for cards
  const px = mouseOffset.x * 12;
  const py = mouseOffset.y * 12;
  const rotX = -mouseOffset.y * 5;
  const rotY = mouseOffset.x * 5;

  return (
    <section
      id="lineup"
      ref={containerRef}
      className="lineup-section"
      onPointerMove={handlePointerMove}
      style={{
        height: '750vh', // Expanded pinned track for comfortable, controlled pacing per driver
      }}
    >
      {/* Audio element for F1Theme.mp3 */}
      <audio
        ref={audioRef}
        src="/audio/F1Theme.mp3"
        loop
        preload="auto"
      />

      {/* Secondary audio element for driver radio focus audio */}
      <audio
        ref={driverAudioRef}
        preload="auto"
      />

      <div className="lineup-sticky-viewport">
        {/* Subtle radial ambient atmosphere */}
        <div className="ambient-glow" />

        {/* Top Right Grid Counter & Live Status (Matches Screenshot 1) */}
        <div className="top-right-meta">
          <div className="steps-row">
            <span className="grid-counter-label">GRID</span>
            <span className="grid-counter-val">
              {String(activeIndex + 1).padStart(2, '0')} / {LINEUP_DRIVERS.length}
            </span>
          </div>
          <div className="meta-label">2026 STARTING LINEUP</div>
        </div>

        {/* PERSISTENT BACKGROUND GALLERY: Previously viewed drivers stay in unique perimeter slots (NO OVERLAPS) */}
        {!isHeadingOnly && (
          <div className="halftone-art-layer">
            {revealedList
              .filter(id => id !== currentDriver.id)
              .slice(-GALLERY_SLOTS.length)
              .map((id, slotIdx) => {
                const driver = LINEUP_DRIVERS.find(d => d.id === id);
                if (!driver) return null;

                const slot = GALLERY_SLOTS[slotIdx];
                const isHoveredCard = hoveredDriver === driver.id;

                return (
                  <div
                    key={driver.id}
                    onClick={() => {
                      const dIdx = LINEUP_DRIVERS.findIndex(d => d.id === driver.id);
                      if (dIdx >= 0) scrollToDriver(dIdx);
                    }}
                    onMouseEnter={() => setHoveredDriver(driver.id)}
                    onMouseLeave={() => setHoveredDriver(null)}
                    className={`gallery-card ${isHoveredCard ? 'hovered' : ''}`}
                    style={{
                      ...slot,
                      transform: `translate3d(${px * 0.5}px, ${py * 0.5}px, 0) rotateX(${rotX * 0.6}deg) rotateY(${rotY * 0.6}deg) ${isHoveredCard ? 'scale(1.08)' : 'scale(1)'}`,
                      zIndex: isHoveredCard ? 25 : 8 + slotIdx,
                    }}
                    title={`Focus on ${driver.name} (play song)`}
                  >
                    <div className="halftone-dot-pattern" />
                    <div className="gallery-img-wrapper">
                      <Image
                        src={driver.image}
                        alt={driver.name}
                        fill
                        sizes="300px"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                    <div className="gallery-card-badge">
                      <span className="badge-team">{driver.team}</span>
                      <span className="badge-num">#{driver.number}</span>
                    </div>
                    {isHoveredCard && (
                      <div className="gallery-hover-tag">
                        PLAY SONG ♫
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* HERO COMPOSITION: Giant LINEUP + Spotlight Photo in FULL VIBRANT COLOR (Matches Screenshot 1 & 2) */}
        <div className="hero-lineup-anchor">
          {/* Spotlight Driver Photo Card: FULL VIVID COLOR for current driver */}
          {!isHeadingOnly && (
            <div
              key={`spotlight-${currentDriver.id}`}
              className={`spotlight-photo-card ${hoveredDriver === currentDriver.id ? 'hovered' : ''}`}
              onClick={() => playDriverSnippet(currentDriver)}
              style={{
                transform: `translate3d(${px}px, ${py}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              }}
              title={`Click to play ${currentDriver.name} song (stops theme)`}
            >
              <div className="spotlight-img-wrapper">
                <Image
                  src={currentDriver.image}
                  alt={currentDriver.name}
                  fill
                  sizes="450px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              <div className="spotlight-tag">
                <span className="tag-team">{currentDriver.team}</span>
                <span className="tag-num">#{currentDriver.number}</span>
              </div>
              <div className="play-song-pill">
                ♫ PLAY SONG
              </div>
            </div>
          )}

          {/* Giant LINEUP Title (Foreground at z-index: 30, layered directly over photo) */}
          <h1 className="giant-lineup-title">LINEUP</h1>

          {/* ── Active Driver Name with Clean Upward Scroll Animation ── */}
          {!isHeadingOnly && (
            <div className="driver-reveal-box">
              {/* Meta Kicker ticker: Number + Team (Glides smoothly upward) */}
              <div
                className="meta-ticker-window"
                onClick={() => playDriverSnippet(currentDriver)}
                title={`Click to play ${currentDriver.name} song`}
                style={{ cursor: 'pointer' }}
              >
                {prevDriver && isTransitioning && (
                  <div className={`meta-line ${transitionDirection === 'up' ? 'meta-outgoing-up' : 'meta-outgoing-down'}`}>
                    <span className="driver-num-pill">#{prevDriver.number}</span>
                    <span className="driver-team-label">{prevDriver.team}</span>
                  </div>
                )}
                <div className={`meta-line ${isTransitioning ? (transitionDirection === 'up' ? 'meta-incoming-up' : 'meta-incoming-down') : ''}`}>
                  <span className="driver-num-pill">#{currentDriver.number}</span>
                  <span className="driver-team-label">{currentDriver.team}</span>
                  {activeSnippetDriver === currentDriver.id && (
                    <span className="sound-wave-anim">
                      <span className="w-bar b1" />
                      <span className="w-bar b2" />
                      <span className="w-bar b3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Giant Driver Name Ticker Window: Full 100vw width, zero clipping on edges */}
              <div className="name-ticker-window">
                {prevDriver && isTransitioning && (
                  <div
                    className={`driver-name-headline ${isLongName(prevDriver.name) ? 'long-name' : ''} ${transitionDirection === 'up' ? 'name-outgoing-up' : 'name-outgoing-down'}`}
                  >
                    {prevDriver.name}
                  </div>
                )}
                <div
                  className={`driver-name-headline ${isLongName(currentDriver.name) ? 'long-name' : ''} ${isTransitioning ? (transitionDirection === 'up' ? 'name-incoming-up' : 'name-incoming-down') : ''}`}
                  onClick={() => playDriverSnippet(currentDriver)}
                  title={`Click to play ${currentDriver.name} song (stops theme)`}
                >
                  {currentDriver.name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cafeteria Bottom Pill Bar */}
        <div className="bottom-lineup-bar">
          {/* Interactive F1 Theme Music Bar: Click to play theme (stops focus radio) */}
          <div
            className={`bar-audio-capsule music-bar-interactive ${isThemePlaying ? 'theme-active' : ''}`}
            onClick={handlePlayThemeFromMusicBar}
            role="button"
            tabIndex={0}
            title={
              isThemePlaying
                ? 'Pause F1 Theme'
                : activeSnippetDriver
                ? 'Play F1 Theme (stops driver song)'
                : 'Play F1 Theme'
            }
          >
            <span className={`music-play-dot ${isThemePlaying ? 'spinning' : ''}`}>
              {isThemePlaying ? '❚❚' : '▶'}
            </span>
            <span className="capsule-text">
              {isThemePlaying
                ? 'F1 OFFICIAL THEME · PLAYING'
                : activeSnippetDriver
                ? `PLAYING: ${currentDriver.name} · [CLICK FOR THEME]`
                : 'F1 OFFICIAL THEME · CLICK TO PLAY'}
            </span>
            <span className="capsule-offset">
              {isThemePlaying ? '[0:10]' : activeSnippetDriver ? '[SONG ACTIVE]' : '[PLAY THEME]'}
            </span>
            {isThemePlaying && (
              <span className="capsule-sound-wave">
                <span className="wave-bar wb1" />
                <span className="wave-bar wb2" />
                <span className="wave-bar wb3" />
              </span>
            )}
          </div>

          <button
            className={`sound-toggle-btn ${isThemePlaying ? 'active' : ''}`}
            onClick={handlePlayThemeFromMusicBar}
            title={isThemePlaying ? 'Pause F1 Theme' : 'Play F1 Theme'}
          >
            {isThemePlaying ? '🔊 THEME ON' : '🔈 THEME OFF'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .lineup-section {
          position: relative;
          background: #000000;
          color: #ffffff;
          width: 100%;
        }

        .lineup-sticky-viewport {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          perspective: 1200px;
        }

        .ambient-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255, 51, 75, 0.05) 0%, transparent 68%);
          pointer-events: none;
          z-index: 2;
        }

        /* Top Right Meta (Matches Screenshot 1) */
        .top-right-meta {
          position: absolute;
          top: 36px;
          right: 48px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          z-index: 60;
          user-select: none;
        }

        .steps-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.15em;
        }

        .grid-counter-label {
          color: rgba(255, 255, 255, 0.4);
        }

        .grid-counter-val {
          color: #ffffff;
          font-weight: 700;
        }

        .meta-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.7);
        }

        /* ── Hero Composition: LINEUP Anchor + Spotlight Card ── */
        .hero-lineup-anchor {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 30;
          max-width: 95vw;
          width: 100%;
        }

        /* Giant LINEUP Title (Exact match to Screenshot 1 & 2) */
        .giant-lineup-title {
          position: relative;
          z-index: 30;
          font-family: var(--font-display);
          font-size: clamp(96px, 18vw, 240px);
          font-weight: 900;
          line-height: 0.82;
          letter-spacing: -0.04em;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
          text-shadow: 0 4px 40px rgba(0, 0, 0, 0.95);
          user-select: none;
          pointer-events: none;
        }

        /* ── Spotlight Driver Photo Card: FULL VIVID COLOR for active driver ── */
        .spotlight-photo-card {
          position: absolute;
          top: -20px;
          right: -40px;
          width: clamp(260px, 28vw, 420px);
          height: clamp(300px, 32vw, 480px);
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 25px 85px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 51, 75, 0.25);
          z-index: 25; /* Highly clickable, over title flanks */
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.15s ease-out, border-color 0.25s ease, box-shadow 0.25s ease;
          animation: spotlightPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-style: preserve-3d;
          pointer-events: auto;
        }

        .spotlight-photo-card:hover {
          border-color: #ff334b;
          box-shadow: 0 30px 95px rgba(0, 0, 0, 1), 0 0 40px rgba(255, 51, 75, 0.45);
          transform: scale(1.02);
        }

        @keyframes spotlightPop {
          from {
            opacity: 0.4;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Active Driver Spotlight image is rendered in FULL VIBRANT COLOR */
        .spotlight-img-wrapper {
          position: absolute;
          inset: 0;
          filter: grayscale(0%) contrast(108%) brightness(102%) saturate(110%);
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .spotlight-photo-card:hover .spotlight-img-wrapper {
          transform: scale(1.03);
          filter: grayscale(0%) contrast(112%) brightness(106%) saturate(120%);
        }

        .play-song-pill {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 6;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #ffffff;
          background: #ff334b;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(255, 51, 75, 0.5);
          pointer-events: none;
        }

        .spotlight-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          z-index: 5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.95);
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          padding: 7px 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          pointer-events: none;
        }

        .tag-team {
          font-weight: 600;
        }

        .tag-num {
          color: #ff334b;
          font-weight: 700;
        }

        /* Halftone Dot Matrix Overlay for background cards */
        .halftone-dot-pattern {
          position: absolute;
          inset: 0;
          z-index: 3;
          background-image: radial-gradient(rgba(0, 0, 0, 0.85) 1.5px, transparent 1.5px);
          background-size: 5px 5px;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        /* ── Active Driver Name with Clean Upward Scroll Animation ── */
        .driver-reveal-box {
          position: relative;
          z-index: 50; /* ALWAYS firmly in front of all background cards and spotlight */
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 100%;
          pointer-events: auto;
        }

        /* Meta Ticker Window */
        .meta-ticker-window {
          position: relative;
          height: 28px;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }

        .meta-line {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.15em;
          white-space: nowrap;
          pointer-events: auto;
        }

        .meta-outgoing-up {
          animation: metaScrollUpExit 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .meta-incoming-up {
          animation: metaScrollUpEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .meta-outgoing-down {
          animation: metaScrollDownExit 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .meta-incoming-down {
          animation: metaScrollDownEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes metaScrollUpExit {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-120%); opacity: 0; }
        }

        @keyframes metaScrollUpEnter {
          0% { transform: translateY(120%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes metaScrollDownExit {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(120%); opacity: 0; }
        }

        @keyframes metaScrollDownEnter {
          0% { transform: translateY(-120%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .driver-num-pill {
          color: #ff334b;
          background: rgba(255, 51, 75, 0.15);
          border: 1px solid rgba(255, 51, 75, 0.4);
          padding: 2px 10px;
          border-radius: 999px;
          font-weight: 700;
        }

        .driver-team-label {
          color: rgba(255, 255, 255, 0.6);
        }

        /* Name Ticker Window: Full 100vw width to prevent any side-clipping */
        .name-ticker-window {
          position: relative;
          height: clamp(52px, 8.5vw, 105px);
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 32px;
          pointer-events: auto;
        }

        .driver-name-headline {
          position: absolute;
          font-family: var(--font-display);
          font-size: clamp(38px, 6.2vw, 84px);
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #ffffff;
          line-height: 1;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          z-index: 50; /* ALWAYS firmly in front */
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 1);
          transition: color 0.2s ease, text-shadow 0.2s ease, transform 0.2s ease;
          pointer-events: auto;
        }

        /* Adaptive scaling for long names so edges are NEVER clipped or hidden */
        .driver-name-headline.long-name {
          font-size: clamp(28px, 4.6vw, 66px);
          letter-spacing: 0.01em;
        }

        .driver-name-headline:hover {
          color: #ff334b;
          text-shadow: 0 0 35px rgba(255, 51, 75, 0.8), 0 4px 30px rgba(0, 0, 0, 0.95);
          transform: scale(1.02);
        }

        /* UPWARD SCROLL ANIMATION: Name moves upward to exit, new name moves upward into place */
        .name-outgoing-up {
          animation: nameScrollUpExit 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .name-incoming-up {
          animation: nameScrollUpEnter 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .name-outgoing-down {
          animation: nameScrollDownExit 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .name-incoming-down {
          animation: nameScrollDownEnter 0.52s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes nameScrollUpExit {
          0% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: translateY(-110%);
            opacity: 0;
            filter: blur(5px);
          }
        }

        @keyframes nameScrollUpEnter {
          0% {
            transform: translateY(110%);
            opacity: 0;
            filter: blur(5px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes nameScrollDownExit {
          0% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: translateY(110%);
            opacity: 0;
            filter: blur(5px);
          }
        }

        @keyframes nameScrollDownEnter {
          0% {
            transform: translateY(-110%);
            opacity: 0;
            filter: blur(5px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0px);
          }
        }

        .sound-wave-anim {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 16px;
        }

        .sound-wave-anim .w-bar {
          width: 3px;
          background: #ff334b;
          border-radius: 2px;
          animation: wavePulse 0.8s infinite ease-in-out;
        }

        .sound-wave-anim .b1 { height: 12px; animation-delay: 0.1s; }
        .sound-wave-anim .b2 { height: 18px; animation-delay: 0.25s; }
        .sound-wave-anim .b3 { height: 10px; animation-delay: 0.4s; }

        @keyframes wavePulse {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }

        /* ── Persistent Halftone Gallery Cards (Perimeter) ── */
        .halftone-art-layer {
          position: absolute;
          inset: 0;
          pointer-events: auto;
          z-index: 10;
        }

        .gallery-card {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0a0a0a;
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.9);
          overflow: hidden;
          cursor: pointer;
          opacity: 0.42;
          transition: opacity 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease-out;
          animation: cardAppear 0.5s ease-out forwards;
          pointer-events: auto;
        }

        .gallery-card.hovered {
          opacity: 0.95 !important;
          border-color: #ff334b !important;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 1), 0 0 30px rgba(255, 51, 75, 0.3) !important;
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 0.42;
            transform: scale(1) translateY(0);
          }
        }

        .gallery-img-wrapper {
          position: absolute;
          inset: 0;
          filter: grayscale(100%) contrast(140%) brightness(85%);
          transition: filter 0.3s ease;
        }

        .gallery-card.hovered .gallery-img-wrapper {
          filter: grayscale(0%) contrast(110%) brightness(100%);
        }

        .gallery-card-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;
          right: 8px;
          z-index: 4;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          padding: 5px 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          pointer-events: none;
        }

        .badge-team {
          font-weight: 600;
        }

        .badge-num {
          color: #ff334b;
          font-weight: 700;
        }

        .gallery-hover-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 5;
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.12em;
          color: #ffffff;
          background: #ff334b;
          padding: 3px 6px;
          border-radius: 999px;
          font-weight: 700;
          pointer-events: none;
        }

        /* ── Cafeteria Bottom Pill Bar ── */
        .bottom-lineup-bar {
          position: absolute;
          bottom: 32px;
          left: 48px;
          right: 48px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          z-index: 60;
          pointer-events: auto;
        }

        /* ── Interactive Music Bar Capsule ── */
        .music-bar-interactive {
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(18, 18, 18, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 7px 18px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 11px;
          user-select: none;
          transition: all 0.25s ease;
        }

        .music-bar-interactive:hover {
          background: rgba(28, 28, 28, 0.95);
          border-color: rgba(255, 51, 75, 0.65);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 51, 75, 0.3);
        }

        .music-bar-interactive.theme-active {
          background: rgba(35, 14, 18, 0.85);
          border-color: rgba(255, 51, 75, 0.5);
          box-shadow: 0 0 16px rgba(255, 51, 75, 0.25);
        }

        .music-play-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: #ff334b;
          font-weight: 700;
          line-height: 1;
        }

        .capsule-text {
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.85);
        }

        .capsule-offset {
          color: rgba(255, 255, 255, 0.45);
          font-size: 10px;
        }

        .capsule-sound-wave {
          display: flex;
          align-items: center;
          gap: 2.5px;
          height: 12px;
          margin-left: 2px;
        }

        .capsule-sound-wave .wave-bar {
          width: 2.5px;
          background: #ff334b;
          border-radius: 1px;
          animation: barBounce 0.75s infinite ease-in-out;
        }

        .capsule-sound-wave .wb1 { height: 8px; animation-delay: 0.1s; }
        .capsule-sound-wave .wb2 { height: 12px; animation-delay: 0.25s; }
        .capsule-sound-wave .wb3 { height: 6px; animation-delay: 0.4s; }

        @keyframes barBounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.3); }
        }

        .sound-toggle-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 7px 18px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .sound-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.45);
          transform: translateY(-1px);
        }

        .sound-toggle-btn.active {
          background: rgba(255, 51, 75, 0.2);
          border-color: rgba(255, 51, 75, 0.6);
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .top-right-meta {
            top: 20px;
            right: 20px;
          }
          .spotlight-photo-card {
            right: -10px;
            top: -10px;
            width: 220px;
            height: 260px;
          }
          .halftone-art-layer {
            display: none;
          }
          .bottom-lineup-bar {
            bottom: 20px;
            left: 20px;
            right: 20px;
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}
