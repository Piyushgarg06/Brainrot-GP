// Framer Motion spring presets — defined once, used everywhere.
// Never inline spring configs in components.

export const springs = {
  gentle: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 20,
    mass: 1,
  },
  snappy: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 28,
    mass: 0.8,
  },
  precise: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 35,
    mass: 0.5,
  },
};
