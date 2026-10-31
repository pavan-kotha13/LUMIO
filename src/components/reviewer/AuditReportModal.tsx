import React from 'react';
import { ResumeScoreEvaluation } from '../../types';
import { CircularScoreIndicator } from '../score-engine/CircularScoreIndicator';
import { Button } from '../common/Button';
import { X, Printer, ShieldCheck, Check, AlertTriangle, HelpCircle, FileText, Download } from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: ResumeScoreEvaluation;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  evaluation,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E5E1D7] shadow-elevated overflow-hidden my-8 print:my-0 print:border-none print:shadow-none">
        {/* Top Modal Bar - Hidden in Print */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[#E5E1D7] bg-[#FAF8F5] print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
            <ShieldCheck className="w-4 h-4" />
            <span>Executive Compatibility Audit Report</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#57605A] hover:text-[#1C201D] hover:bg-[#EAE6DC] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 sm:p-10 space-y-8 bg-white print:p-6 text-[#1C201D]">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#E5E1D7]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1B4332] bg-[#EBF2EC] px-2.5 py-0.5 rounded">
                  Resume Architect Audit
                </span>
                <span className="text-xs text-[#848E88]">· Confidential Analysis</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C201D]">
                Job Compatibility Assessment
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#57605A]">
                <span>Target Role: <strong className="text-[#1C201D]">{evaluation.jobTitle}</strong></span>
                {evaluation.companyName && (
                  <>
                    <span>·</span>
                    <span>Company: <strong className="text-[#1C201D]">{evaluation.companyName}</strong></span>
                  </>
                )}
                <span>·</span>
                <span>Date: {new Date(evaluation.evaluatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Score Ring */}
            <div className="flex items-center gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5E1D7] shrink-0">
              <CircularScoreIndicator
                score={evaluation.overallScore}
                size={84}
                strokeWidth={7}
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#848E88] block">
                  Overall Compatibility
                </span>
                <span className="text-lg font-bold text-[#1C201D] block">
                  {evaluation.scoreGrade}
                </span>
                <span className="text-[11px] text-[#57605A] block">
                  Weighted 6-Pillar Formula
                </span>
              </div>
            </div>
          </div>

          {/* 6-Pillar Score Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C201D]">
              1. 6-Pillar Weighted Score Matrix
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#E5E1D7]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#57605A] border-b border-[#E5E1D7] font-semibold">
                  <tr>
                    <th className="p-3">Evaluation Pillar</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Raw Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Audit Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D7]">
                  {evaluation.categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAF8F5]/50">
                      <td className="p-3 font-semibold text-[#1C201D]">{cat.name}</td>
                      <td className="p-3 font-mono text-[#57605A]">{Math.round(cat.weight * 100)}%</td>
                      <td className="p-3 font-mono font-bold text-[#1C201D]">{cat.score} / 100</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            cat.status === 'optimal'
                              ? 'bg-[#EBF2EC] text-[#1B4332]'
                              : cat.status === 'moderate'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#57605A]">{cat.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Missing Keywords Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C201D]">
              2. High-Priority Missing Keywords
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {evaluation.missingKeywords.slice(0, 6).map((kw) => (
                <div
                  key={kw.id}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-[#1C201D] block">{kw.term}</span>
                    <span className="text-[10px] text-[#848E88]">{kw.category}</span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                      kw.importance === 'critical'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {kw.importance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Rewrites */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C201D]">
              3. Top High-Impact Rewrite Recommendations
            </h3>
            <div className="space-y-3">
              {evaluation.recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-[#E5E1D7] bg-[#FAF8F5] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C201D]">{rec.title}</span>
                    <span className="font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded">
                      +{rec.estimatedScoreDelta} Points
                    </span>
                  </div>
                  {rec.sampleBefore && rec.sampleAfter && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-white border border-[#EAE6DC]">
                        <span className="text-[9px] font-semibold uppercase text-red-700 block mb-1">
                          Original Text
                        </span>
                        <p className="italic text-[#57605A]">"{rec.sampleBefore}"</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#C8DFCF]">
                        <span className="text-[9px] font-semibold uppercase text-[#1B4332] block mb-1">
                          Recommended High-Signal Rewrite
                        </span>
                        <p className="font-medium text-[#1C201D]">"{rec.sampleAfter}"</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Methodology */}
          <div className="pt-4 border-t border-[#E5E1D7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#848E88]">
            <span>Generated by Resume Architect AI Scoring Engine</span>
            <span>Zero hallucinated metrics · Deterministic ATS compatibility model</span>
          </div>
        </div>
      </div>
    </div>
  );
};
