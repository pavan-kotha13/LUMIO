import React from 'react';
import { MissingKeyword } from '../../types';
import { AlertCircle, PlusCircle, Check } from 'lucide-react';

interface MissingKeywordListProps {
  keywords: MissingKeyword[];
  className?: string;
  onAddKeyword?: (keyword: MissingKeyword) => void;
}

export const MissingKeywordList: React.FC<MissingKeywordListProps> = ({
  keywords,
  className = '',
  onAddKeyword,
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#1C201D] flex items-center gap-2">
            <span>Missing Target Keywords</span>
            <span className="text-xs font-normal text-[#848E88]">
              ({keywords.length} high-signal terms absent)
            </span>
          </h3>
          <p className="text-xs text-[#57605A]">
            Terms frequently emphasized in the target job description that were not detected in your resume.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E1D7] overflow-hidden shadow-subtle divide-y divide-[#E5E1D7]">
        {keywords.map((kw) => (
          <div
            key={kw.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/60 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-sm text-[#1C201D] font-mono">{kw.term}</span>
                <span className="text-[11px] text-[#57605A]">
                  · {kw.category}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    kw.importance === 'critical'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {kw.importance}
                </span>
              </div>
              <p className="text-xs text-[#57605A]">
                Found <span className="font-semibold text-[#1C201D]">{kw.jobFrequency} times</span> in
                the job posting. Adding this keyword where appropriate will raise ATS keyword alignment.
              </p>
            </div>

            {onAddKeyword && (
              <button
                onClick={() => onAddKeyword(kw)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B4332] hover:bg-[#EBF2EC] px-3 py-1.5 rounded-lg border border-[#D5E3DA] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Mark for Inclusion</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
