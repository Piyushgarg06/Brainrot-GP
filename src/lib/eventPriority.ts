// Event priority constants — higher number = higher priority
// Used by AudioEngine to interrupt lower-priority playback.
export const PRIORITY = {
  WINNER:   4,
  LEADER:   3,
  FASTEST:  2,
  POSITION: 1,
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];
