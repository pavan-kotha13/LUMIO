import React from 'react';
import { SkillGap } from '../../types';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface SkillGapAnalysisProps {
  skillGaps: SkillGap[];
  className?: string;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({
  skillGaps,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-[#1C201D]">Technical & Skill Gap Analysis</h3>
        <p className="text-xs text-[#57605A]">
          Direct comparison of candidate demonstrated experience vs. explicit job posting mandates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {skillGaps.map((gap) => (
          <div
            key={gap.id}
            className="p-5 rounded-xl border border-[#E5E1D7] bg-white shadow-subtle space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1C201D]">{gap.skillName}</span>
                <span className="text-xs text-[#848E88]">· {gap.category}</span>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 self-start sm:self-auto ${
                  gap.status === 'matched'
                    ? 'bg-[#EBF2EC] text-[#1B4332]'
                    : gap.status === 'partial'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {gap.status === 'matched' && <CheckCircle className="w-3.5 h-3.5" />}
                {gap.status === 'partial' && <AlertTriangle className="w-3.5 h-3.5" />}
                {gap.status === 'missing' && <HelpCircle className="w-3.5 h-3.5" />}
                <span className="capitalize">{gap.status} Evidence</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E1D7] space-y-1">
                <span className="font-semibold text-[#848E88] block uppercase tracking-wider text-[10px]">
                  Job Mandate Requirement
                </span>
                <p className="text-[#1C201D] leading-relaxed">{gap.requiredContext}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5E1D7] space-y-1">
                <span className="font-semibold text-[#848E88] block uppercase tracking-wider text-[10px]">
                  Candidate Evidence in Resume
                </span>
                <p className="text-[#57605A] leading-relaxed">
                  {gap.candidateEvidence ? gap.candidateEvidence : 'No verifiable mention detected in parsed resume.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0ECE1] flex items-start gap-2 text-xs">
              <span className="font-semibold text-[#1B4332] shrink-0">Architect Recommendation:</span>
              <p className="text-[#1C201D] leading-relaxed">{gap.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
