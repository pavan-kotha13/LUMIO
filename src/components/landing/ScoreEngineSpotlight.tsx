import React, { useState } from 'react';
import { ScoreDisplay } from '../score-engine/ScoreDisplay';
import { CategoryScoreBreakdown } from '../score-engine/CategoryScoreBreakdown';
import { MissingKeywordList } from '../score-engine/MissingKeywordList';
import { SkillGapAnalysis } from '../score-engine/SkillGapAnalysis';
import { ImprovementRecommendations } from '../score-engine/ImprovementRecommendations';
import { CANONICAL_BENCHMARK_EVALUATION } from '../../utils/scoreCalculation';
import { ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export const ScoreEngineSpotlight: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'keywords' | 'gaps' | 'recommendations'>(
    'breakdown'
  );

  const evaluation = CANONICAL_BENCHMARK_EVALUATION;

  return (
    <section id="score-engine" className="py-16 md:py-24 border-t border-[#E5E1D7] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Central Feature Spotlight</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C201D] [text-wrap:balance]">
            The AI Resume Score Engine
          </h2>
          <p className="mt-3 text-base text-[#57605A] leading-relaxed">
            Analyse resumes against job descriptions and calculate a transparent match score.
            Built on a deterministic 6-pillar evaluation model with zero arbitrary guesswork.
          </p>
        </div>

        {/* Master Score Display Card */}
        <ScoreDisplay evaluation={evaluation} className="mb-8" />

        {/* Interactive Inspection Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F3EFE7] rounded-xl border border-[#E5E1D7] max-w-2xl mb-8">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'breakdown'
                ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            6-Pillar Breakdown
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'keywords'
                ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            Missing Keywords ({evaluation.missingKeywords.length})
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'gaps'
                ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            Skill Gaps ({evaluation.skillGaps.length})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            Recommendations
          </button>
        </div>

        {/* Tab Body */}
        <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 sm:p-8 shadow-card">
          {activeTab === 'breakdown' && (
            <CategoryScoreBreakdown categories={evaluation.categories} />
          )}

          {activeTab === 'keywords' && (
            <MissingKeywordList keywords={evaluation.missingKeywords} />
          )}

          {activeTab === 'gaps' && (
            <SkillGapAnalysis skillGaps={evaluation.skillGaps} />
          )}

          {activeTab === 'recommendations' && (
            <ImprovementRecommendations recommendations={evaluation.recommendations} />
          )}

          {/* Transparent Method Disclaimer Footer */}
          <div className="mt-8 pt-6 border-t border-[#F0ECE1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#57605A]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>
                Scores are calculated strictly through weighted algorithmic criteria, not random LLM estimates.
              </span>
            </div>
            <Link to="/signup">
              <Button size="sm" variant="primary">
                Analyze Your Own Resume
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
