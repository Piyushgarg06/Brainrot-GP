// Global Sound State Manager for BrainrotGP Landing Experience

export const SOUND_CHANGE_EVENT = 'brainrot-sound-change';

export function getGlobalSound(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage?.getItem('brainrot_sound_on') === 'true';
}

export function setGlobalSound(enabled: boolean) {
  if (typeof window === 'undefined') return;
  window.sessionStorage?.setItem('brainrot_sound_on', enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent(SOUND_CHANGE_EVENT, { detail: { enabled } }));
}

