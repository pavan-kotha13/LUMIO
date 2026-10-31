import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ArrowRight, ShieldCheck, CheckCircle2, Gauge, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreScoreEngine: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreScoreEngine }) => {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Don't just match the job. Prove your fit.</span>
          </div>

          {/* Specified Marquee Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C201D] leading-[1.14] [text-wrap:balance]">
            Build, Improve and Showcase a Resume That{' '}
            <span className="text-[#1B4332] underline decoration-[#1B4332]/30 underline-offset-8">
              Gets You Hired.
            </span>
          </h1>

          {/* Specified Value Proposition Description */}
          <p className="text-base sm:text-lg text-[#57605A] leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
            Analyse your resume, measure your job compatibility, discover skill gaps and create a
            professional resume with AI assistance.
          </p>

          {/* CTA Group */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto text-base"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account Free
              </Button>
            </Link>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-base"
              onClick={onExploreScoreEngine}
              leftIcon={<Gauge className="w-4 h-4 text-[#1B4332]" />}
            >
              Explore AI Score Engine
            </Button>
          </div>

          {/* Clean unboxed proof points */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#57605A]">
            <span className="flex items-center gap-1.5 font-medium text-[#1C201D]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
              Transparent Match Scoring
            </span>
            <span aria-hidden="true" className="text-[#D6D1C4]">·</span>
            <span className="flex items-center gap-1.5 font-medium text-[#1C201D]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
              ATS-Conscious Architecture
            </span>
            <span aria-hidden="true" className="text-[#D6D1C4]">·</span>
            <span className="flex items-center gap-1.5 font-medium text-[#1C201D]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
              No Paywalls or Hidden Tiers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
