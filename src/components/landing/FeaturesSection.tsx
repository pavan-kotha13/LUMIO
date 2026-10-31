import React from 'react';
import { Gauge, FileText, CheckSquare, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      id: 'score-engine',
      badge: 'Feature A · Central Engine',
      title: 'AI Resume Score Engine',
      description:
        'Analyse resumes against job descriptions and calculate a transparent match score based on deterministic, multi-factor criteria.',
      points: [
        'Deterministic 6-pillar weighted formula',
        'Keyword & technical skill gap detection',
        'No arbitrary AI percentages or guessing',
      ],
      icon: Gauge,
      isPrimary: true,
    },
    {
      id: 'resume-builder',
      badge: 'Feature B',
      title: 'Resume Builder',
      description:
        'Create ATS-conscious resumes using candidate information structured for human recruiters and applicant tracking parsers.',
      points: [
        'Semantic hierarchy & clean typography',
        'Single-column ATS parsing architecture',
        'Clean DOCX & PDF output formatting',
      ],
      icon: FileText,
      isPrimary: false,
    },
    {
      id: 'resume-reviewer',
      badge: 'Feature C',
      title: 'Resume Reviewer',
      description:
        'Identify skill gaps, missing keywords and formatting issues before sending your application to hiring decision-makers.',
      points: [
        'Line-by-line impact bullet analysis',
        'High-frequency missing keyword flagging',
        'Actionable rewrite recommendations',
      ],
      icon: CheckSquare,
      isPrimary: false,
    },
    {
      id: 'linkedin-optimizer',
      badge: 'Feature D',
      title: 'LinkedIn Optimizer',
      description:
        'Improve LinkedIn headlines, About sections, experience and skills to project coherent narrative authority to inbound recruiters.',
      points: [
        'Search-calibrated headline positioning',
        'Executive About summary crafting',
        'Skills endorsement prioritization',
      ],
      icon: Share2,
      isPrimary: false,
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 border-t border-[#E5E1D7] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#1B4332] mb-2">
            Complete Career Engineering Suite
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C201D] [text-wrap:balance]">
            Four core capabilities designed to prove your fit
          </h2>
          <p className="mt-4 text-base text-[#57605A] leading-relaxed">
            All core resume-building, reviewing, scoring, and LinkedIn optimization features are built
            to work together as an integrated platform without payment-related barriers.
          </p>
        </div>

        {/* 2x2 Clean Professional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`rounded-2xl p-8 transition-all flex flex-col justify-between ${
                  feat.isPrimary
                    ? 'bg-white border-2 border-[#1B4332] shadow-elevated'
                    : 'bg-white border border-[#E5E1D7] shadow-card hover:border-[#D6D1C4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        feat.isPrimary
                          ? 'bg-[#EBF2EC] text-[#1B4332]'
                          : 'bg-[#FAF8F5] text-[#57605A] border border-[#E5E1D7]'
                      }`}
                    >
                      {feat.badge}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        feat.isPrimary
                          ? 'bg-[#1B4332] text-white shadow-sm'
                          : 'bg-[#FAF8F5] text-[#1B4332] border border-[#E5E1D7]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#1C201D] mb-2">{feat.title}</h3>
                  <p className="text-sm text-[#57605A] leading-relaxed mb-6">{feat.description}</p>
                </div>

                <div className="pt-6 border-t border-[#F0ECE1] space-y-2.5 text-xs text-[#1C201D]">
                  {feat.points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
