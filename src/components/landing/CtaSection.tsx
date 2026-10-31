import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 border-t border-[#E5E1D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1B4332] rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-center relative overflow-hidden shadow-elevated">
          {/* Subtle architectural grid drafting watermark in SVG */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FAF8F5" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Begin With Verifiable Impact</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight [text-wrap:balance]">
              Your next role requires proof, not just keywords.
            </h2>

            <p className="text-sm sm:text-base text-[#D5E3DA] leading-relaxed max-w-xl mx-auto">
              Join thousands of technical leaders, product directors, and senior specialists who
              replaced generic resume spam with rigorous career architecture.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-[#1B4332] hover:bg-[#FAF8F5] active:bg-[#F3EFE7] shadow-sm font-semibold"
                  rightIcon={<ArrowRight className="w-4 h-4 text-[#1B4332]" />}
                >
                  Start Building Your Proof Free
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                >
                  Existing Candidate Sign In
                </Button>
              </Link>
            </div>

            <p className="text-[11px] text-[#A3C4B0] pt-2">
              Free access to all core scoring and optimization features · 100% private career data
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
