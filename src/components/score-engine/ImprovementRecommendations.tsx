import React, { useState } from 'react';
import { ImprovementRecommendation } from '../../types';
import { TrendingUp, ArrowRight, Check, Copy, CheckCheck, Sparkles, RefreshCw } from 'lucide-react';

interface ImprovementRecommendationsProps {
  recommendations: ImprovementRecommendation[];
  className?: string;
  onApplyRecommendation?: (recommendation: ImprovementRecommendation) => void;
  appliedIds?: string[];
}

export const ImprovementRecommendations: React.FC<ImprovementRecommendationsProps> = ({
  recommendations,
  className = '',
  onApplyRecommendation,
  appliedIds = [],
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#1C201D] flex items-center gap-2">
            <span>Actionable Improvement Recommendations</span>
            <span className="text-xs font-normal text-[#848E88]">
              ({recommendations.length} high-impact improvements)
            </span>
          </h3>
          <p className="text-xs text-[#57605A]">
            Specific, high-impact edits calculated to maximize your resume compatibility score.
          </p>
        </div>
        {appliedIds.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold self-start sm:self-auto">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{appliedIds.length} Rewrites Applied</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isApplied = appliedIds.includes(rec.id);
          const isCopied = copiedId === rec.id;

          return (
            <div
              key={rec.id}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isApplied
                  ? 'bg-[#FAFDFB] border-[#1B4332] shadow-sm'
                  : 'bg-white border-[#E5E1D7] shadow-subtle hover:border-[#1B4332]/50'
              } space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      rec.priority === 'high'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                  <h4 className="font-bold text-sm text-[#1C201D]">{rec.title}</h4>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] bg-[#EBF2EC] px-2.5 py-1 rounded-md shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{rec.estimatedScoreDelta} Score Points</span>
                  </div>

                  {rec.sampleAfter && (
                    <button
                      type="button"
                      onClick={() => handleCopy(rec.id, rec.sampleAfter!)}
                      className="p-1.5 text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] rounded-lg border border-[#E5E1D7] transition-colors cursor-pointer"
                      title="Copy rewrite text"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {onApplyRecommendation && rec.sampleAfter && (
                    <button
                      type="button"
                      onClick={() => onApplyRecommendation(rec)}
                      disabled={isApplied}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        isApplied
                          ? 'bg-[#1B4332] text-white cursor-default'
                          : 'bg-[#EBF2EC] text-[#1B4332] hover:bg-[#1B4332] hover:text-white border border-[#C8DFCF]'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Apply Rewrite</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#57605A] leading-relaxed">{rec.description}</p>

              {rec.sampleBefore && rec.sampleAfter && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C2E2E] block">
                        Before (Generic / Weak Statement)
                      </span>
                    </div>
                    <p className="text-xs text-[#57605A] italic leading-relaxed">
                      "{rec.sampleBefore}"
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFDFB] border border-[#C8DFCF] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1B4332] flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3 text-[#1B4332]" />
                        Architect Recommended Rewrite
                      </span>
                      {isApplied && (
                        <span className="text-[10px] text-[#1B4332] font-semibold bg-[#EBF2EC] px-2 py-0.5 rounded-full">
                          Live Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#1C201D] font-medium leading-relaxed">
                      "{rec.sampleAfter}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
