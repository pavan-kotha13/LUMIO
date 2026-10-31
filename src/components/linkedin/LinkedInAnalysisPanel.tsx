import React, { useState } from 'react';
import {
  LinkedInProfileData,
  LinkedInAnalysisResult,
  HeadlineSuggestion,
  AboutStyleType,
  TruthGuardStatus,
} from '../../types/linkedin';
import { Button } from '../common/Button';
import {
  Sparkles,
  Share2,
  Check,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
  FileCheck,
  HelpCircle,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Search,
} from 'lucide-react';

interface LinkedInAnalysisPanelProps {
  analysis: LinkedInAnalysisResult | null;
  profileData: LinkedInProfileData;
  onUpdateProfile: (updated: LinkedInProfileData) => void;
  isAnalyzing: boolean;
  onOpenExportModal: () => void;
}

export const LinkedInAnalysisPanel: React.FC<LinkedInAnalysisPanelProps> = ({
  analysis,
  profileData,
  onUpdateProfile,
  isAnalyzing,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'optimizations' | 'preview'>('optimizations');
  const [previewMode, setPreviewMode] = useState<'original' | 'optimised'>('optimised');
  const [selectedAboutStyle, setSelectedAboutStyle] = useState<AboutStyleType>('professional');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editableHeadlineId, setEditableHeadlineId] = useState<string | null>(null);
  const [editedHeadlineText, setEditedHeadlineText] = useState<string>('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAcceptHeadline = (text: string) => {
    onUpdateProfile({
      ...profileData,
      headline: text,
    });
  };

  const handleAcceptAbout = (text: string) => {
    onUpdateProfile({
      ...profileData,
      about: text,
    });
  };

  const handleAcceptExpBullet = (expId: string, originalBullet: string, optimizedBullet: string) => {
    const updatedExp = profileData.experience.map((exp) => {
      if (exp.id !== expId) return exp;
      return {
        ...exp,
        bullets: exp.bullets.map((b) => (b === originalBullet ? optimizedBullet : b)),
      };
    });
    onUpdateProfile({
      ...profileData,
      experience: updatedExp,
    });
  };

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E1D7] shadow-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
        <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#E5E1D7] flex items-center justify-center text-[#1B4332] mb-4 shadow-subtle">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#1C201D] mb-1">
          LinkedIn Analysis & Optimization Engine
        </h3>
        <p className="text-xs text-[#57605A] max-w-md mb-6 leading-relaxed">
          Fill in your profile details or import a saved resume from the left panel, then run optimization to generate high-ranking headlines, narrative About sections, TruthGuard bullet rewrites, and realistic LinkedIn previews.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left max-w-lg w-full text-xs text-[#57605A]">
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7]">
            <span className="font-bold text-[#1C201D] block mb-0.5">7-Pillar Score</span>
            <span className="text-[11px]">Quality & recruiter search ranking index</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7]">
            <span className="font-bold text-[#1C201D] block mb-0.5">3 Headlines</span>
            <span className="text-[11px]">Value-prop, keyword-dense, growth styles</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7]">
            <span className="font-bold text-[#1C201D] block mb-0.5">4 About Styles</span>
            <span className="text-[11px]">Executive, student, technical, concise</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7]">
            <span className="font-bold text-[#1C201D] block mb-0.5">TruthGuard</span>
            <span className="text-[11px]">Zero hallucination or fabricated metrics</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] shadow-card flex flex-col h-full overflow-hidden">
      {/* Top Header / Mode Switcher */}
      <div className="p-4 border-b border-[#E5E1D7] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-white border border-[#E5E1D7] rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('optimizations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'optimizations'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Optimization Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>LinkedIn Profile Preview</span>
          </button>
        </div>

        {/* Export / Copy All button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenExportModal}
          leftIcon={<Share2 className="w-3.5 h-3.5" />}
        >
          Export & Copy Content
        </Button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {/* TAB 1: AI OPTIMIZATION HUB */}
        {activeTab === 'optimizations' && (
          <div className="space-y-6">
            {/* 1. QUALITY SCORE HERO */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E1D7] p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D7]">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-2xl bg-white border border-[#E5E1D7] shadow-xs flex flex-col items-center justify-center shrink-0">
                    <span className="text-xl font-bold font-mono text-[#1B4332]">
                      {analysis.overallScore}
                    </span>
                    <span className="text-[9px] font-semibold text-[#848E88] uppercase tracking-wider">
                      / 100
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#1C201D]">LinkedIn Profile Quality Score</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2EC] text-[#1B4332] border border-[#1B4332]/20">
                        {analysis.scoreGrade}
                      </span>
                    </div>
                    <p className="text-xs text-[#57605A] mt-0.5">
                      Evaluates profile discoverability, recruiter algorithmic search indexing, and narrative credibility.
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-[#57605A] bg-white px-3 py-1.5 rounded-xl border border-[#E5E1D7] shadow-2xs self-stretch sm:self-auto text-center sm:text-right">
                  <span className="font-semibold text-[#1C201D] block">Independent Quality Index</span>
                  <span>Measures profile strength, not ATS match</span>
                </div>
              </div>

              {/* 7-Category Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                {analysis.categories.map((cat) => {
                  const pct = cat.score;
                  return (
                    <div
                      key={cat.id}
                      className="p-3 bg-white rounded-xl border border-[#E5E1D7] space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-[#1C201D]">
                          <span>{cat.name}</span>
                          <span className="text-[10px] font-mono text-[#848E88]">
                            ({Math.round(cat.weight * 100)}%)
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold text-xs ${
                            cat.score >= 80 ? 'text-[#1B4332]' : cat.score >= 60 ? 'text-[#856404]' : 'text-[#8C2E2E]'
                          }`}
                        >
                          {cat.score}/100
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E5E1D7]/60">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            cat.score >= 80 ? 'bg-[#1B4332]' : cat.score >= 60 ? 'bg-[#C5832B]' : 'bg-[#8C2E2E]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#57605A] pt-0.5">
                        <span className="truncate pr-2">{cat.feedback}</span>
                        <span className="font-mono shrink-0 text-[#1C201D] font-semibold">{cat.metrics.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. AI HEADLINE GENERATOR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#1B4332]" />
                    <span>AI Headline Generator</span>
                  </h3>
                  <p className="text-xs text-[#57605A]">
                    Targeted options under LinkedIn’s 220 character limit. Choose one to update your profile headline.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {analysis.headlineSuggestions.map((hl) => {
                  const isCurrentHeadline = profileData.headline.trim() === hl.text.trim();
                  return (
                    <div
                      key={hl.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrentHeadline
                          ? 'bg-[#FAFBF9] border-[#1B4332] shadow-sm ring-1 ring-[#1B4332]/20'
                          : 'bg-white border-[#E5E1D7] hover:border-[#1B4332]/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#F0ECE1]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1B4332]">{hl.label}</span>
                          {isCurrentHeadline && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B4332] text-white">
                              Active in Profile
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                              hl.charCount > 220
                                ? 'bg-red-100 text-red-700 font-bold'
                                : 'bg-[#FAF8F5] text-[#57605A] border border-[#E5E1D7]'
                            }`}
                          >
                            {hl.charCount} / 220 chars
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#1C201D] font-medium leading-relaxed mb-2">
                        {hl.text}
                      </p>

                      <p className="text-[11px] text-[#57605A] mb-3 italic">
                        {hl.rationale}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0ECE1]">
                        <div className="flex flex-wrap gap-1">
                          {hl.keywordsIncluded.map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="text-[10px] font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopy(hl.text, hl.id)}
                            leftIcon={
                              copiedKey === hl.id ? (
                                <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {copiedKey === hl.id ? 'Copied' : 'Copy'}
                          </Button>
                          <Button
                            variant={isCurrentHeadline ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={isCurrentHeadline}
                            onClick={() => handleAcceptHeadline(hl.text)}
                            leftIcon={isCurrentHeadline ? <Check className="w-3.5 h-3.5" /> : undefined}
                          >
                            {isCurrentHeadline ? 'Applied' : 'Accept as Headline'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. ABOUT SECTION OPTIMIZER */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#1B4332]" />
                    <span>About Section Optimizer</span>
                  </h3>
                  <p className="text-xs text-[#57605A]">
                    Select from 4 distinct writing styles tailored to your career stage and target role.
                  </p>
                </div>
              </div>

              {/* Style Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'professional' as const, label: 'Professional', desc: 'Authoritative & Balanced' },
                  { id: 'fresher' as const, label: 'Student / Fresher', desc: 'Agility & Potential' },
                  { id: 'technical' as const, label: 'Technical Lead', desc: 'Architecture & Stack' },
                  { id: 'concise' as const, label: 'Concise & Punchy', desc: 'Fast Mobile Read' },
                ].map((s) => {
                  const isSelected = selectedAboutStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedAboutStyle(s.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                          : 'bg-white text-[#1C201D] border-[#E5E1D7] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span className="block text-xs font-bold">{s.label}</span>
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-white/80' : 'text-[#848E88]'}`}>
                        {s.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Current vs Optimised Side-by-Side / Diff */}
              {analysis.aboutOptimizations[selectedAboutStyle] && (
                <div className="bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1B4332]">
                      {analysis.aboutOptimizations[selectedAboutStyle].styleLabel}
                    </span>
                    <span className="text-xs font-mono text-[#57605A] bg-white px-2 py-0.5 rounded border border-[#E5E1D7]">
                      {analysis.aboutOptimizations[selectedAboutStyle].wordCount} words
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Current About */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#57605A] uppercase tracking-wider block">
                        Current Profile About
                      </span>
                      <div className="p-3 bg-white rounded-xl border border-[#E5E1D7] text-xs text-[#57605A] leading-relaxed min-h-[140px] whitespace-pre-wrap">
                        {profileData.about || (
                          <span className="italic text-[#848E88]">
                            No current About section entered yet.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Optimised About */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider block">
                        Optimised Version
                      </span>
                      <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#1B4332]/40 text-xs text-[#1C201D] leading-relaxed min-h-[140px] whitespace-pre-wrap font-medium">
                        {analysis.aboutOptimizations[selectedAboutStyle].text}
                      </div>
                    </div>
                  </div>

                  {/* Key Improvements */}
                  <div className="p-3 bg-white rounded-xl border border-[#E5E1D7] space-y-2">
                    <span className="text-xs font-bold text-[#1C201D] block">Key Improvements Applied:</span>
                    <ul className="text-xs text-[#57605A] space-y-1">
                      {analysis.aboutOptimizations[selectedAboutStyle].keyImprovements.map((imp, impIdx) => (
                        <li key={impIdx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E1D7]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          analysis.aboutOptimizations[selectedAboutStyle].text,
                          `about_${selectedAboutStyle}`
                        )
                      }
                      leftIcon={
                        copiedKey === `about_${selectedAboutStyle}` ? (
                          <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {copiedKey === `about_${selectedAboutStyle}` ? 'Copied' : 'Copy Text'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        handleAcceptAbout(analysis.aboutOptimizations[selectedAboutStyle].text)
                      }
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Accept as About Section
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. EXPERIENCE & PROJECT OPTIMIZATIONS (WITH TRUTHGUARD) */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                  <span>Experience & Project Bullet Optimizer (TruthGuard Verified)</span>
                </h3>
                <p className="text-xs text-[#57605A]">
                  Every enhanced bullet is validated against your provided facts. Zero fabricated figures or ungrounded claims.
                </p>
              </div>

              <div className="space-y-3">
                {analysis.experienceOptimizations.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 bg-white rounded-xl border border-[#E5E1D7] space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F0ECE1]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1C201D]">{opt.company}</span>
                        <span className="text-xs text-[#57605A]">({opt.jobTitle})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#57605A] border border-[#E5E1D7]">
                          Formula: {opt.appliedFormula}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            opt.truthGuardStatus === 'SUPPORTED'
                              ? 'bg-[#EBF2EC] text-[#1B4332] border border-[#1B4332]/20'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {opt.truthGuardStatus === 'SUPPORTED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>TruthGuard: {opt.truthGuardStatus}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#848E88] uppercase tracking-wider block mb-0.5">
                          Original Input
                        </span>
                        <p className="text-[#57605A] bg-[#FAF8F5] p-2 rounded-lg border border-[#E5E1D7]/60">
                          {opt.originalBullet}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#1B4332] uppercase tracking-wider block mb-0.5">
                          Optimised Bullet
                        </span>
                        <p className="text-[#1C201D] font-medium bg-[#FAFBF9] p-2 rounded-lg border border-[#1B4332]/30">
                          {opt.optimizedBullet}
                        </p>
                      </div>

                      {opt.confirmationNote && (
                        <p className="text-[11px] text-[#57605A] italic flex items-center gap-1.5 pt-1">
                          <HelpCircle className="w-3.5 h-3.5 text-[#848E88] shrink-0" />
                          <span>{opt.confirmationNote}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0ECE1]">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(opt.optimizedBullet, opt.id)}
                        leftIcon={
                          copiedKey === opt.id ? (
                            <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {copiedKey === opt.id ? 'Copied' : 'Copy'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleAcceptExpBullet(opt.experienceId, opt.originalBullet, opt.optimizedBullet)
                        }
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Accept Bullet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SKILLS & KEYWORD EVIDENCE MAP */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#1B4332]" />
                  <span>Skills & Keyword EvidenceMap</span>
                </h3>
                <p className="text-xs text-[#57605A]">
                  Verification of candidate skills against high-demand keywords for your target role.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.skillEvidence.map((se) => (
                  <div
                    key={se.id}
                    className="p-3 bg-white rounded-xl border border-[#E5E1D7] space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C201D]">{se.skill}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          se.status === 'MATCHED'
                            ? 'bg-[#EBF2EC] text-[#1B4332]'
                            : se.status === 'PARTIALLY MATCHED'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {se.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#57605A] leading-normal">{se.sourceEvidence}</p>
                    <p className="text-[10px] text-[#848E88] italic">{se.relevanceNote}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. ACTIONABLE RECOMMENDATIONS */}
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] space-y-2">
              <span className="text-xs font-bold text-[#1C201D] block">Actionable Recommendations:</span>
              <ul className="text-xs text-[#57605A] space-y-1.5">
                {analysis.recommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-[#1B4332] shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: LINKEDIN PROFILE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* Toggle: Original vs Optimised */}
            <div className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7]">
              <div>
                <span className="text-xs font-bold text-[#1C201D] block">Preview Mode</span>
                <span className="text-[11px] text-[#57605A]">
                  Toggle to compare your original input with accepted optimizations.
                </span>
              </div>
              <div className="flex items-center p-1 bg-white border border-[#E5E1D7] rounded-lg shadow-2xs">
                <button
                  onClick={() => setPreviewMode('original')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    previewMode === 'original'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-[#57605A] hover:text-[#1C201D]'
                  }`}
                >
                  Original Profile
                </button>
                <button
                  onClick={() => setPreviewMode('optimised')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    previewMode === 'optimised'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-[#57605A] hover:text-[#1C201D]'
                  }`}
                >
                  Optimised Profile
                </button>
              </div>
            </div>

            {/* Realistic LinkedIn Profile Card */}
            <div className="bg-white rounded-2xl border border-[#E5E1D7] shadow-card overflow-hidden">
              {/* Cover Banner */}
              <div className="h-32 bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#1B4332]/90 relative">
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/30 backdrop-blur-xs text-[10px] text-white font-mono">
                  Resume Architect Verified Candidate
                </div>
              </div>

              {/* Profile Card Header */}
              <div className="px-6 pb-6 relative">
                {/* Avatar circle */}
                <div className="w-24 h-24 rounded-full border-4 border-white bg-[#1B4332] text-white flex items-center justify-center text-2xl font-bold -mt-12 shadow-md">
                  {profileData.personalInfo.fullName
                    ? profileData.personalInfo.fullName.charAt(0).toUpperCase()
                    : 'C'}
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[#1C201D]">
                      {profileData.personalInfo.fullName || 'Candidate Name'}
                    </h2>
                    {profileData.personalInfo.openToWork && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF2EC] text-[#1B4332] border border-[#1B4332]/30">
                        #OpenToWork
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-[#1C201D] leading-relaxed max-w-2xl">
                    {previewMode === 'optimised'
                      ? profileData.headline
                      : profileData.personalInfo.currentTitleOrStatus || profileData.headline}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#57605A] pt-1">
                    <span>{profileData.personalInfo.location || 'United States'}</span>
                    <span>•</span>
                    <span className="text-[#1B4332] font-semibold">
                      {profileData.personalInfo.targetRole || 'Software Engineering'}
                    </span>
                    <span>•</span>
                    <span className="text-[#848E88]">500+ connections</span>
                  </div>

                  {/* LinkedIn Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3">
                    <button className="px-4 py-1.5 bg-[#1B4332] text-white text-xs font-semibold rounded-full hover:bg-[#2D6A4F] transition-colors cursor-pointer">
                      Connect
                    </button>
                    <button className="px-4 py-1.5 bg-white text-[#1B4332] border border-[#1B4332] text-xs font-semibold rounded-full hover:bg-[#EBF2EC] transition-colors cursor-pointer">
                      Message
                    </button>
                    <button className="px-3 py-1.5 bg-white text-[#57605A] border border-[#E5E1D7] text-xs font-semibold rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer">
                      More
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Body Sections */}
              <div className="border-t border-[#E5E1D7] p-6 space-y-6">
                {/* About Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#1C201D]">About</h3>
                  <p className="text-xs text-[#1C201D] leading-relaxed whitespace-pre-wrap">
                    {profileData.about || 'No About section provided.'}
                  </p>
                </div>

                {/* Experience Section */}
                {profileData.experience.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#E5E1D7]">
                    <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#1B4332]" />
                      <span>Experience</span>
                    </h3>
                    <div className="space-y-4">
                      {profileData.experience.map((exp) => (
                        <div key={exp.id} className="text-xs space-y-1.5">
                          <h4 className="font-bold text-[#1C201D] text-xs">{exp.jobTitle}</h4>
                          <p className="text-[#57605A]">
                            {exp.company} • {exp.startDate} - {exp.endDate}
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-[#1C201D] pt-1">
                            {exp.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {profileData.education.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#E5E1D7]">
                    <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#1B4332]" />
                      <span>Education</span>
                    </h3>
                    <div className="space-y-3">
                      {profileData.education.map((edu) => (
                        <div key={edu.id} className="text-xs space-y-0.5">
                          <h4 className="font-bold text-[#1C201D]">{edu.institution}</h4>
                          <p className="text-[#57605A]">{edu.degree} • Class of {edu.graduationYear}</p>
                          {edu.details && <p className="text-[#848E88] text-[11px]">{edu.details}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Projects */}
                {profileData.projects.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#E5E1D7]">
                    <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#1B4332]" />
                      <span>Projects</span>
                    </h3>
                    <div className="space-y-3">
                      {profileData.projects.map((proj) => (
                        <div key={proj.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs space-y-1">
                          <h4 className="font-bold text-[#1C201D]">{proj.title}</h4>
                          <p className="text-[11px] font-mono text-[#1B4332]">{proj.tech}</p>
                          <p className="text-[#57605A]">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {profileData.skills.technical.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#E5E1D7]">
                    <h3 className="text-sm font-bold text-[#1C201D] flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#1B4332]" />
                      <span>Skills</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.skills.technical.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 bg-[#FAF8F5] text-[#1C201D] border border-[#E5E1D7] rounded-lg text-xs font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
