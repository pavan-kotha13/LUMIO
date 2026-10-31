import React from 'react';
import { Upload, Cpu, BarChart3, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Submit Resume & Job Mandate',
      desc: 'Paste or upload your current resume alongside the specific job description you are targeting.',
      icon: Upload,
    },
    {
      num: '02',
      title: 'Transparent 6-Pillar Evaluation',
      desc: 'Our engine extracts keywords, evaluates technical requirements, and calculates match scores deterministically.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Inspect Gaps & Missing Keywords',
      desc: 'Review absent terminology, required skill contexts, and line-by-line evidence discrepancies.',
      icon: BarChart3,
    },
    {
      num: '04',
      title: 'Optimize & Export With Confidence',
      desc: 'Implement actionable recommendations and export an ATS-compliant resume engineered for human recruiters.',
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 border-t border-[#E5E1D7] scroll-mt-16 bg-[#FCFBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#1B4332] mb-2">
            The Workflow
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C201D] [text-wrap:balance]">
            How Resume Architect works
          </h2>
          <p className="mt-4 text-base text-[#57605A] leading-relaxed">
            From raw application materials to an evidence-backed, recruiter-calibrated career dossier in
            four structured steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[#1B4332] font-mono">{st.num}</span>
                    <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E5E1D7] flex items-center justify-center text-[#1B4332]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#1C201D] mb-2">{st.title}</h3>
                  <p className="text-xs text-[#57605A] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action card */}
        <div className="mt-12 p-6 rounded-2xl bg-[#EBF2EC] border border-[#C8DFCF] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#1B4332]">
              Ready to analyze your resume against your target role?
            </h4>
            <p className="text-xs text-[#2D6A4F]">
              Experience transparent compatibility scoring calibrated for senior roles.
            </p>
          </div>
          <Link to="/signup">
            <Button variant="primary" size="md">
              Start Free Analysis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
