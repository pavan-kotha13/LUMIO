import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Hero } from '../components/landing/Hero';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { ScoreEngineSpotlight } from '../components/landing/ScoreEngineSpotlight';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { CtaSection } from '../components/landing/CtaSection';

export const LandingPage: React.FC = () => {
  const scrollToScoreEngine = () => {
    const el = document.getElementById('score-engine');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <MainLayout>
      <Hero onExploreScoreEngine={scrollToScoreEngine} />
      <FeaturesSection />
      <ScoreEngineSpotlight />
      <HowItWorksSection />
      <CtaSection />
    </MainLayout>
  );
};
