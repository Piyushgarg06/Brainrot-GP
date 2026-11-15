/**
 * Helper to detect whether BrainrotGP is running inside the Windows Electron desktop application
 * versus a standard web browser on the hosted website.
 */
export function isDesktopApp(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent || '';
  if (ua.includes('BrainrotGP-Desktop') || ua.includes('Electron')) {
    try {
      localStorage.setItem('brainrotgp_desktop', '1');
    } catch {
      // ignore storage access errors
    }
    return true;
  }

  // Check URL param fallback (e.g. ?env=desktop)
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('env') === 'desktop' || params.get('app') === 'desktop') {
      try {
        localStorage.setItem('brainrotgp_desktop', '1');
      } catch {}
      return true;
    }
  } catch {}

  // Check cached local storage
  try {
    if (localStorage.getItem('brainrotgp_desktop') === '1') {
      return true;
    }
  } catch {}

  return false;
}
