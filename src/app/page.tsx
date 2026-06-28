import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { Hero } from '@/components/landing/Hero';
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
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Landing page Hero with pinned scroll trigger */}
      <Hero />

      {/* Dynamic Meme Carousel */}
      <MemeCarousel images={imageFiles} />

      {/* Footer */}
      <Footer />
    </main>
  );
}
