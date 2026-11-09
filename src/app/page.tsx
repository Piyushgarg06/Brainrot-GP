import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { Hero } from '@/components/landing/Hero';
import { StarfieldVideoReveal } from '@/components/landing/StarfieldVideoReveal';
import { HalftoneLineup } from '@/components/landing/HalftoneLineup';
import { DashboardCTA } from '@/components/landing/DashboardCTA';
import { MemeCarousel } from '@/components/landing/MemeCarousel';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title:       'BrainrotGP — F1 Second Screen',
  description: 'Brainrot GP The unnecessary second-screen companion for Formula 1.',
};

export default function LandingPage() {
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  let imageFiles: string[] = [];

  try {
    if (fs.existsSync(imagesDir)) {
      imageFiles = fs.readdirSync(imagesDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.webp', '.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      });
    }
  } catch (e) {
    console.error('Error reading images directory:', e);
  }

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      {/* 1. Original Landing Page Hero with Orbiting Cars */}
      <Hero />

      {/* 2. Transition Section: Starfield speckles "here's what they said." zooming into Max's vertical video clip with the audio capsule bar */}
      <StarfieldVideoReveal />

      {/* 3. Lineup Section: Drivers pop in/out sequentially as user scrolls up/down with halftone imagery */}
      <HalftoneLineup />

      {/* 4. Open Dashboard Section (requested right after lineup) */}
      <DashboardCTA />

      {/* 5. Clean Meme Carousel */}
      <MemeCarousel images={imageFiles} />

      {/* 6. Original Footer */}
      <Footer />
    </main>
  );
}
