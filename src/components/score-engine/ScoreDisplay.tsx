import React from 'react';
import { CircularScoreIndicator } from './CircularScoreIndicator';
import { ResumeScoreEvaluation } from '../../types';
import { ShieldCheck, FileText, Briefcase, HelpCircle } from 'lucide-react';

interface ScoreDisplayProps {
  evaluation: ResumeScoreEvaluation;
  className?: string;
  onMethodologyClick?: () => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  evaluation,
  className = '',
  onMethodologyClick,
}) => {
  const getGradeBadge = (grade: ResumeScoreEvaluation['scoreGrade']) => {
    switch (grade) {
      case 'Exceptional':
      case 'Strong':
        return 'bg-[#EBF2EC] text-[#1B4332] border-[#C8DFCF]';
      case 'Competitive':
        return 'bg-[#FDF6EA] text-[#8C5D1E] border-[#EEDBBA]';
      case 'Needs Revision':
        return 'bg-[#FDF0F0] text-[#9E3838] border-[#E8C2C2]';
      default:
        return 'bg-[#F3EFE7] text-[#57605A] border-[#E5E1D7]';
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E5E1D7] p-6 sm:p-8 shadow-card ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        {/* Left score ring and grade */}
        <div className="flex items-center gap-6">
          <CircularScoreIndicator score={evaluation.overallScore} size={110} strokeWidth={9} />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getGradeBadge(
                  evaluation.scoreGrade
                )}`}
              >
                {evaluation.scoreGrade} Match
              </span>
              <span className="text-xs text-[#848E88]">· 6-Pillar Formula</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1C201D]">
              Resume Compatibility Score
            </h3>
            <p className="text-xs text-[#57605A] max-w-sm">
              Calculated using transparent, weighted evaluation of keyword alignment, skills,
              experience, projects, and ATS readability.
            </p>
          </div>
        </div>

        {/* Right context meta */}
        <div className="w-full sm:w-auto p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] text-xs space-y-2 shrink-0">
          <div className="flex items-center gap-2 text-[#57605A]">
            <Briefcase className="w-3.5 h-3.5 text-[#1B4332]" />
            <span className="font-semibold text-[#1C201D] truncate max-w-[200px]">
              {evaluation.jobTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#57605A]">
            <FileText className="w-3.5 h-3.5 text-[#1B4332]" />
            <span className="truncate max-w-[200px]">{evaluation.resumeFileName}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#E5E1D7] text-[11px] text-[#848E88]">
            <span>Transparent Algorithm</span>
            {onMethodologyClick ? (
              <button
                onClick={onMethodologyClick}
                className="text-[#1B4332] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                View Weights
              </button>
            ) : (
              <span className="text-[#1B4332] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Deterministic
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
