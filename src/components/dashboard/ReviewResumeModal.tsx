import React, { useState } from 'react';
import { ResumeItem, ResumeScoreEvaluation } from '../../types';
import { scoreEngineService } from '../../services/scoreEngineService';
import { ScoreDisplay } from '../score-engine/ScoreDisplay';
import { CategoryScoreBreakdown } from '../score-engine/CategoryScoreBreakdown';
import { MissingKeywordList } from '../score-engine/MissingKeywordList';
import { SkillGapAnalysis } from '../score-engine/SkillGapAnalysis';
import { ImprovementRecommendations } from '../score-engine/ImprovementRecommendations';
import { Button } from '../common/Button';
import { X, Gauge, Sparkles, Check, ArrowRight, Maximize2 } from 'lucide-react';

interface ReviewResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumes: ResumeItem[];
  initialResume?: ResumeItem | null;
  onOpenFullWorkspace?: () => void;
}

export const ReviewResumeModal: React.FC<ReviewResumeModalProps> = ({
  isOpen,
  onClose,
  resumes,
  initialResume,
  onOpenFullWorkspace,
}) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    initialResume?.id || (resumes[0]?.id ?? '')
  );
  const [jobDescription, setJobDescription] = useState(
    'Staff Distributed Systems Engineer: Must have demonstrated experience with Go, Kubernetes, Kafka, gRPC, and high-concurrency event-driven microservices. Require proven track record maintaining 99.999% SLA across multi-region cloud deployments.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ResumeScoreEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'keywords' | 'gaps' | 'recommendations'>(
    'breakdown'
  );

  if (!isOpen) return null;

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const selectedResume = resumes.find((r) => r.id === selectedResumeId);
      const result = await scoreEngineService.evaluateResume(
        selectedResume?.summarySnippet || '',
        jobDescription,
        {
          targetRole: selectedResume?.targetJobTitle,
          resumeFileName: selectedResume?.title ? `${selectedResume.title}.pdf` : undefined,
        }
      );
      setEvaluationResult(result);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E5E1D7] max-w-4xl w-full p-6 sm:p-8 shadow-elevated space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#1C201D] flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#1B4332]" />
              <span>AI Resume Score Engine — Compatibility Review</span>
            </h3>
            <p className="text-xs text-[#57605A]">
              Deterministic 6-pillar analysis comparing candidate resume against hiring mandate.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenFullWorkspace && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullWorkspace();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1B4332] bg-[#EBF2EC] hover:bg-[#DCEAE0] rounded-lg transition-colors cursor-pointer"
                title="Open in full screen workspace"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Workspace</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C201D]">
              Select Resume from History
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2.5 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle cursor-pointer"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.version} · {r.format})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#1C201D]">
                Target Job Description Mandate
              </label>
              <button
                type="button"
                onClick={() =>
                  setJobDescription(
                    'Staff Distributed Systems Engineer: Must have demonstrated experience with Go, Kubernetes, Kafka, gRPC, and high-concurrency event-driven microservices. Require proven track record maintaining 99.999% SLA across multi-region cloud deployments.'
                  )
                }
                className="text-[11px] text-[#1B4332] hover:underline cursor-pointer"
              >
                Reset Sample Spec
              </button>
            </div>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting text..."
              className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleEvaluate}
            isLoading={isEvaluating}
            leftIcon={<Gauge className="w-4 h-4" />}
          >
            Calculate Compatibility Score
          </Button>
        </div>

        {/* Evaluation Output Section */}
        {evaluationResult && (
          <div className="pt-6 border-t border-[#F0ECE1] space-y-6">
            <ScoreDisplay evaluation={evaluationResult} />

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs">
              <button
                onClick={() => setActiveTab('breakdown')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'breakdown'
                    ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                    : 'text-[#57605A] hover:text-[#1C201D]'
                }`}
              >
                6-Pillar Breakdown
              </button>
              <button
                onClick={() => setActiveTab('keywords')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'keywords'
                    ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                    : 'text-[#57605A] hover:text-[#1C201D]'
                }`}
              >
                Missing Keywords ({evaluationResult.missingKeywords.length})
              </button>
              <button
                onClick={() => setActiveTab('gaps')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'gaps'
                    ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                    : 'text-[#57605A] hover:text-[#1C201D]'
                }`}
              >
                Skill Gaps ({evaluationResult.skillGaps.length})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'recommendations'
                    ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                    : 'text-[#57605A] hover:text-[#1C201D]'
                }`}
              >
                Recommendations ({evaluationResult.recommendations.length})
              </button>
            </div>

            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E1D7] p-6 shadow-subtle">
              {activeTab === 'breakdown' && (
                <CategoryScoreBreakdown categories={evaluationResult.categories} />
              )}
              {activeTab === 'keywords' && (
                <MissingKeywordList keywords={evaluationResult.missingKeywords} />
              )}
              {activeTab === 'gaps' && (
                <SkillGapAnalysis skillGaps={evaluationResult.skillGaps} />
              )}
              {activeTab === 'recommendations' && (
                <ImprovementRecommendations
                  recommendations={evaluationResult.recommendations}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
