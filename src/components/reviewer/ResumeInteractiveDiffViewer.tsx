import React, { useState } from 'react';
import { ResumeScoreEvaluation, MissingKeyword } from '../../types';
import { Check, AlertCircle, Sparkles, Eye, FileText, SplitSquareVertical, Search, Copy, CheckCheck } from 'lucide-react';

interface ResumeInteractiveDiffViewerProps {
  resumeText: string;
  evaluation: ResumeScoreEvaluation;
  onApplyKeyword?: (kw: string) => void;
  className?: string;
}

export const ResumeInteractiveDiffViewer: React.FC<ResumeInteractiveDiffViewerProps> = ({
  resumeText,
  evaluation,
  onApplyKeyword,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'annotated' | 'side-by-side' | 'raw'>('annotated');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [selectedHighlightFilter, setSelectedHighlightFilter] = useState<'all' | 'matches' | 'gaps'>('all');

  // Extract detected keywords from categories & skill gaps
  const matchedKeywords = new Set<string>();
  evaluation.skillGaps.forEach((g) => {
    if (g.status === 'matched') {
      matchedKeywords.add(g.skillName.toLowerCase());
    }
  });

  // Common keywords in high-tier candidate dossiers
  const coreTech = [
    'kubernetes', 'docker', 'golang', 'go', 'typescript', 'python', 'react', 'distributed systems',
    'postgresql', 'redis', 'kafka', 'grpc', 'graphql', 'aws', 'gcp', 'terraform', 'ci/cd', 'microservices',
    'prometheus', 'grafana', 'sqlite', 'rust', 'linux', 'git', 'rest api', 'system design'
  ];
  coreTech.forEach((t) => {
    if (resumeText.toLowerCase().includes(t)) {
      matchedKeywords.add(t);
    }
  });

  const missingKeywordsList = evaluation.missingKeywords.map((k) => k.term.toLowerCase());

  // Render annotated resume with highlights
  const renderAnnotatedText = () => {
    const lines = resumeText.split('\n');

    return (
      <div className="space-y-1.5 font-mono text-xs leading-relaxed text-[#1C201D] bg-white p-5 rounded-2xl border border-[#E5E1D7] overflow-x-auto shadow-subtle select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Section headers
          const isHeader =
            line.toUpperCase() === line && line.length > 3 && !line.includes('•') && !line.includes('·');

          if (isHeader) {
            return (
              <div
                key={idx}
                className="pt-3 pb-1 text-[#1B4332] font-sans font-bold text-sm tracking-wider uppercase border-b border-[#E5E1D7] flex items-center justify-between"
              >
                <span>{line}</span>
                <span className="text-[10px] text-[#848E88] font-mono normal-case tracking-normal">
                  ATS Section Confirmed
                </span>
              </div>
            );
          }

          // Weak phrase detection
          const weakPhrases = [
            'responsible for',
            'worked on',
            'helped with',
            'assisted in',
            'participated in',
            'handled various',
            'duties included',
          ];
          const hasWeakPhrase = weakPhrases.some((wp) => line.toLowerCase().includes(wp));

          // Highlight words
          return (
            <div
              key={idx}
              className={`py-0.5 px-1.5 rounded transition-colors flex items-start justify-between group ${
                hasWeakPhrase && selectedHighlightFilter !== 'matches'
                  ? 'bg-amber-50/70 border-l-2 border-amber-500'
                  : 'hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex-1">
                {renderHighlightedWords(line)}
              </div>

              {hasWeakPhrase && (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 text-[10px] text-amber-800 bg-amber-100/90 px-1.5 py-0.2 rounded font-sans">
                  Weak verb detected
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHighlightedWords = (text: string) => {
    // Regex tokenize
    const words = text.split(/(\s+|[,.:;()\[\]{}]+)/);

    return words.map((token, i) => {
      const lower = token.toLowerCase();

      // Check match
      const isMatched = Array.from(matchedKeywords).some(
        (mk) => lower === mk || (mk.includes(' ') && text.toLowerCase().includes(mk))
      );

      if (isMatched && selectedHighlightFilter !== 'gaps') {
        return (
          <span
            key={i}
            className="bg-[#EBF2EC] text-[#1B4332] font-semibold px-1 py-0.2 rounded border border-[#C8DFCF] inline-block"
            title="Matched High-Impact Competency"
          >
            {token}
          </span>
        );
      }

      return <span key={i}>{token}</span>;
    });
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(resumeText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E1D7] shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('annotated')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'annotated'
                  ? 'bg-white text-[#1C201D] shadow-xs font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ATS Heatmap View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'side-by-side'
                  ? 'bg-white text-[#1C201D] shadow-xs font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Job Match Alignment</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'raw'
                  ? 'bg-white text-[#1C201D] shadow-xs font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Parsed Text</span>
            </button>
          </div>
        </div>

        {/* Legend & Filter */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
            <span className="text-[#57605A] text-[11px]">Matched Keyword</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[#57605A] text-[11px]">Vague Action Verb</span>
          </div>
          <button
            type="button"
            onClick={handleCopyRaw}
            className="text-[11px] text-[#57605A] hover:text-[#1C201D] font-medium px-2 py-1 rounded-lg border border-[#E5E1D7] flex items-center gap-1 ml-auto cursor-pointer"
          >
            {copiedRaw ? <CheckCheck className="w-3 h-3 text-[#1B4332]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedRaw ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: ATS HEATMAP */}
      {viewMode === 'annotated' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#FAFDFB] border border-[#C8DFCF] flex items-center justify-between text-xs text-[#1B4332]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1B4332]" />
              <span>
                <strong>{matchedKeywords.size} high-signal keywords</strong> detected and highlighted directly across your resume sections.
              </span>
            </div>
            <span className="text-[11px] text-[#57605A] hidden sm:inline">
              Scroll down to inspect individual bullets
            </span>
          </div>

          <div className="max-h-[550px] overflow-y-auto rounded-2xl border border-[#E5E1D7]">
            {renderAnnotatedText()}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SIDE-BY-SIDE JOB ALIGNMENT */}
      {viewMode === 'side-by-side' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Job Expectations */}
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-5 shadow-subtle space-y-3">
              <div className="border-b border-[#F0ECE1] pb-2 flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1C201D]">
                  Role Requirements & Mandates
                </h4>
                <span className="text-[10px] text-[#848E88] font-mono">
                  {evaluation.jobTitle}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {evaluation.skillGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C201D]">{gap.skillName}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                          gap.status === 'matched'
                            ? 'bg-[#EBF2EC] text-[#1B4332]'
                            : gap.status === 'partial'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {gap.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#57605A] leading-relaxed">
                      {gap.requiredContext}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Evidence Found */}
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-5 shadow-subtle space-y-3">
              <div className="border-b border-[#F0ECE1] pb-2 flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1B4332]">
                  Evidence In Candidate Resume
                </h4>
                <span className="text-[10px] text-[#848E88] font-mono">
                  Parsed Verification
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {evaluation.skillGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      gap.status === 'matched'
                        ? 'bg-[#FAFDFB] border-[#C8DFCF]'
                        : 'bg-[#FAF8F5] border-[#E5E1D7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C201D]">{gap.skillName}</span>
                      <span className="text-[10px] text-[#848E88]">{gap.category}</span>
                    </div>
                    <p className="text-[11px] text-[#57605A] leading-relaxed">
                      {gap.candidateEvidence ? (
                        <span className="text-[#1C201D] font-medium">"{gap.candidateEvidence}"</span>
                      ) : (
                        <span className="text-[#8C2E2E] italic">
                          No direct evidence detected in resume text.
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: RAW PARSED TEXT */}
      {viewMode === 'raw' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#57605A]">
            <span>Raw text extracted by the ATS pre-parsing engine:</span>
            <span>{resumeText.length} characters · {resumeText.split(/\s+/).length} words</span>
          </div>
          <pre className="p-4 bg-white rounded-2xl border border-[#E5E1D7] text-xs font-mono text-[#1C201D] overflow-x-auto max-h-[480px] leading-relaxed whitespace-pre-wrap shadow-subtle">
            {resumeText}
          </pre>
        </div>
      )}
    </div>
  );
};
