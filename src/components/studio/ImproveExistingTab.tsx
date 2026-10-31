import React from 'react';
import { ResumeItem, ResumeStudioData } from '../../types';
import { Button } from '../common/Button';
import { Sparkles, FileText, ArrowRight, Gauge, Clock, Building2 } from 'lucide-react';

interface ImproveExistingTabProps {
  resumes: ResumeItem[];
  onImportToStudio: (resume: ResumeItem) => void;
  onLaunchReviewer: (resume: ResumeItem) => void;
}

export const ImproveExistingTab: React.FC<ImproveExistingTabProps> = ({
  resumes,
  onImportToStudio,
  onLaunchReviewer,
}) => {
  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
          <Sparkles className="w-4 h-4 text-[#1B4332]" />
          <span>Resume Reviewer & Improver Integration</span>
        </div>
        <h3 className="text-lg font-bold text-[#1C201D]">
          Improve an Existing Career Dossier
        </h3>
        <p className="text-xs text-[#57605A] leading-relaxed max-w-2xl">
          Select any of your existing saved resumes below to load its parameters into the AI Resume Studio,
          or run the transparent 6-pillar score analysis to uncover missing keywords and skill gaps.
        </p>
      </div>

      {/* Existing Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card flex flex-col justify-between hover:border-[#1B4332] transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded">
                  {resume.version}
                </span>
                <span className="text-xs font-bold font-mono text-[#1C201D]">
                  {resume.score}% Match
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-[#1C201D] group-hover:text-[#1B4332] transition-colors line-clamp-1">
                  {resume.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#57605A] mt-1">
                  <Building2 className="w-3.5 h-3.5 text-[#848E88] shrink-0" />
                  <span className="truncate">{resume.targetJobTitle}</span>
                </div>
              </div>

              <p className="text-xs text-[#57605A] line-clamp-2 leading-relaxed">
                {resume.summarySnippet}
              </p>

              <div className="flex items-center gap-1 text-[11px] text-[#848E88]">
                <Clock className="w-3 h-3" />
                <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#F0ECE1] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onLaunchReviewer(resume)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Score Review</span>
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onImportToStudio(resume)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Load in Studio
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
