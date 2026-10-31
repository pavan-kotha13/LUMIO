import React from 'react';
import { ScoreCategory } from '../../types';

interface CategoryScoreBreakdownProps {
  categories: ScoreCategory[];
  className?: string;
  onSelectCategory?: (category: ScoreCategory) => void;
}

export const CategoryScoreBreakdown: React.FC<CategoryScoreBreakdownProps> = ({
  categories,
  className = '',
  onSelectCategory,
}) => {
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-[#1B4332]';
    if (score >= 65) return 'bg-[#2D6A4F]';
    if (score >= 50) return 'bg-[#B07D38]';
    return 'bg-[#A34848]';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#1C201D]">Category-Wise Score Breakdown</h3>
          <p className="text-xs text-[#57605A]">
            Transparently weighted across the 6 primary evaluation criteria.
          </p>
        </div>
        <span className="text-xs font-mono text-[#848E88] hidden sm:inline-block">
          Total Weight: 100%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const weightPercent = Math.round(cat.weight * 100);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory?.(cat)}
              className={`p-5 rounded-xl border border-[#E5E1D7] bg-white transition-all shadow-subtle ${
                onSelectCategory ? 'cursor-pointer hover:border-[#1B4332] hover:shadow-sm' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#1C201D] leading-snug">{cat.name}</h4>
                    <span className="text-[11px] font-mono text-[#848E88] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5E1D7]">
                      {weightPercent}% wt
                    </span>
                  </div>
                  <p className="text-xs text-[#57605A] mt-1 line-clamp-2">{cat.summary}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-bold font-mono text-[#1C201D] tabular-nums block">
                    {cat.score}
                    <span className="text-xs text-[#848E88] font-normal">/100</span>
                  </span>
                  <span className="text-[11px] text-[#57605A]">
                    {cat.metrics.matched}/{cat.metrics.total} {cat.metrics.unit || 'matched'}
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-[#F3EFE7] rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                    cat.score
                  )}`}
                  style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
