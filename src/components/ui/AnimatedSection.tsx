'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { springs } from '@/lib/springs';
import type { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  const reduced = usePrefersReducedMotion();

  const variants = reduced
    ? { hidden: {}, visible: {} }
    : {
        hidden:  { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ ...springs.gentle, delay }}
    >
      {children}
    </motion.div>
  );
}
