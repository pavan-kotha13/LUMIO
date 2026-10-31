import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ResumeItem } from '../../types';
import { CANONICAL_BENCHMARK_EVALUATION } from '../../utils/scoreCalculation';
import { ScoreDisplay } from '../score-engine/ScoreDisplay';
import { CategoryScoreBreakdown } from '../score-engine/CategoryScoreBreakdown';
import { Button } from '../common/Button';
import {
  Gauge,
  FilePlus,
  Edit3,
  Share2,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DashboardTab } from './Sidebar';

interface HomeOverviewProps {
  resumes: ResumeItem[];
  onSelectTab: (tab: DashboardTab) => void;
  onSelectResumeToReview: (resume: ResumeItem) => void;
  onSelectResumeToEdit: (resume: ResumeItem) => void;
  onCreateClick: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  resumes,
  onSelectTab,
  onSelectResumeToReview,
  onSelectResumeToEdit,
  onCreateClick,
}) => {
  const { user } = useAuth();

  // Find resumes that have genuine calculated scores
  const analyzedResumes = resumes.filter(
    (r) => typeof r.score === 'number' && r.score > 0
  );

  const avgScore =
    analyzedResumes.length > 0
      ? Math.round(
          analyzedResumes.reduce((acc, r) => acc + (r.score || 0), 0) /
            analyzedResumes.length
        )
      : null;

  return (
    <div className="space-y-8">
      {/* Welcome & Context Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Tools Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C201D]">
            Welcome back, {user?.name || 'Candidate'}
          </h2>
          <p className="text-xs sm:text-sm text-[#57605A] max-w-xl">
            Analyze your resume compatibility against specific job postings, discover missing keywords,
            and engineer evidence-backed resumes calibrated for hiring committees.
          </p>
        </div>

        <div className="flex flex-row md:flex-col gap-4 border-t md:border-t-0 md:border-l border-[#E5E1D7] pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E88] block">
              Active Resumes
            </span>
            <span className="text-2xl font-bold font-mono text-[#1C201D] tabular-nums">
              {resumes.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E88] block">
              Avg. Match Score
            </span>
            <span className="text-2xl font-bold font-mono text-[#1B4332] tabular-nums">
              {avgScore !== null ? `${avgScore}%` : '—'}
            </span>
            {avgScore === null && (
              <span className="text-[10px] text-[#848E88] block">Not Analyzed</span>
            )}
          </div>
        </div>
      </div>

      {/* Tools Hub (The 4 Core Platform Tools) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1C201D]">Platform Tools Hub</h3>
            <p className="text-xs text-[#57605A]">
              Select a specialized tool to analyze, create, refine, or showcase your career qualifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: Review & Score Engine */}
          <div
            onClick={() => onSelectTab('review')}
            className="p-5 rounded-2xl bg-white border border-[#E5E1D7] shadow-card hover:border-[#1B4332] hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EBF2EC] text-[#1B4332] flex items-center justify-center mb-4 group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1B4332] block mb-1">
                Central Engine
              </span>
              <h4 className="font-bold text-base text-[#1C201D] mb-1">Review Resume</h4>
              <p className="text-xs text-[#57605A] leading-relaxed">
                Analyse resumes against job descriptions and calculate a transparent 6-pillar match score.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs font-semibold text-[#1B4332]">
              <span>Launch Score Engine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 2: Resume Builder */}
          <div
            onClick={() => onSelectTab('create')}
            className="p-5 rounded-2xl bg-white border border-[#E5E1D7] shadow-card hover:border-[#1B4332] hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] text-[#1B4332] flex items-center justify-center mb-4 group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
                <FilePlus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#848E88] block mb-1">
                Creation Suite
              </span>
              <h4 className="font-bold text-base text-[#1C201D] mb-1">Create Resume</h4>
              <p className="text-xs text-[#57605A] leading-relaxed">
                Create ATS-conscious resumes with single-column semantic parsing structure and clean typography.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs font-semibold text-[#1B4332]">
              <span>Build New Resume</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 3: Improve Resume */}
          <div
            onClick={() => onSelectTab('improve')}
            className="p-5 rounded-2xl bg-white border border-[#E5E1D7] shadow-card hover:border-[#1B4332] hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] text-[#1B4332] flex items-center justify-center mb-4 group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#848E88] block mb-1">
                AI Optimization
              </span>
              <h4 className="font-bold text-base text-[#1C201D] mb-1">Improve Resume</h4>
              <p className="text-xs text-[#57605A] leading-relaxed">
                Upload existing PDF/DOCX resumes, extract content, and optimize with TruthGuard validation.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs font-semibold text-[#1B4332]">
              <span>Improve Existing Resume</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tool 4: LinkedIn Optimizer */}
          <div
            onClick={() => onSelectTab('linkedin')}
            className="p-5 rounded-2xl bg-white border border-[#E5E1D7] shadow-card hover:border-[#1B4332] hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] text-[#1B4332] flex items-center justify-center mb-4 group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#848E88] block mb-1">
                Public Profile
              </span>
              <h4 className="font-bold text-base text-[#1C201D] mb-1">LinkedIn Optimizer</h4>
              <p className="text-xs text-[#57605A] leading-relaxed">
                Improve LinkedIn headlines, About narrative summaries, and skill endorsements for recruiter searches.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs font-semibold text-[#1B4332]">
              <span>Optimize Profile</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Score Engine Spotlight / Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1C201D]">Job Description Match Analysis</h3>
            <p className="text-xs text-[#57605A]">
              Deterministic compatibility evaluation against your target job postings.
            </p>
          </div>
          {analyzedResumes.length > 0 && (
            <button
              onClick={() => onSelectTab('review')}
              className="text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
            >
              Run New Job Analysis →
            </button>
          )}
        </div>

        {analyzedResumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E1D7] p-8 shadow-card text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E5E1D7] text-[#1B4332] flex items-center justify-center mx-auto">
              <Gauge className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-[#1C201D]">
                {resumes.length === 0
                  ? 'Create or upload a resume to begin your analysis'
                  : 'No Job Description analysis yet'}
              </h4>
              <p className="text-xs text-[#57605A] leading-relaxed">
                {resumes.length === 0
                  ? 'To calculate deterministic 6-pillar compatibility, first create a resume draft from scratch or upload your existing document.'
                  : 'Select a saved resume in Resume Reviewer and compare it against your target job posting to generate your 6-pillar score, EvidenceMap, and TruthGuard audit.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelectTab('create')}
                leftIcon={<FilePlus className="w-4 h-4" />}
              >
                Create Resume from Scratch
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectTab('improve')}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Improve Existing Resume (PDF/DOCX)
              </Button>
              {resumes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectTab('review')}
                  leftIcon={<Gauge className="w-4 h-4" />}
                >
                  Analyze Saved Resume
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-5 bg-white rounded-2xl border border-[#E5E1D7] shadow-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EBF2EC] text-[#1B4332] flex items-center justify-center font-mono font-bold text-lg">
                  {analyzedResumes[0].score}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#1C201D]">{analyzedResumes[0].title}</h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E1D7] text-[#1B4332]">
                      {analyzedResumes[0].scoreGrade || 'Analyzed'}
                    </span>
                  </div>
                  <p className="text-xs text-[#57605A] mt-0.5">
                    Target Mandate: <strong className="text-[#1C201D]">{analyzedResumes[0].targetJobTitle || 'Software Role'}</strong>
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectResumeToReview(analyzedResumes[0])}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Full Audit
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resume History Sneak Peek */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1C201D]">Recent Resumes</h3>
            <p className="text-xs text-[#57605A]">
              {resumes.length} saved career dossiers in your local development workspace.
            </p>
          </div>
          {resumes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTab('resumes')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All in My Resumes
            </Button>
          )}
        </div>

        {resumes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-[#E5E1D7] shadow-card text-center space-y-3">
            <FolderArchive className="w-8 h-8 text-[#848E88] mx-auto" />
            <h4 className="text-sm font-bold text-[#1C201D]">No Saved Resumes</h4>
            <p className="text-xs text-[#57605A] max-w-sm mx-auto">
              You haven't created or saved any resumes yet. Start by crafting a new dossier from scratch or importing an existing file.
            </p>
            <div className="pt-1 flex justify-center gap-3">
              <Button variant="primary" size="sm" onClick={() => onSelectTab('create')}>
                Create Resume
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onSelectTab('improve')}>
                Upload Resume
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumes.slice(0, 3).map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-white border border-[#E5E1D7] shadow-card flex flex-col justify-between hover:border-[#D6D1C4] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded">
                      {res.version}
                    </span>
                    <span className="text-xs font-bold font-mono text-[#1C201D] tabular-nums">
                      {typeof res.score === 'number' && res.score > 0 ? `${res.score}% Match` : 'Draft (Unanalyzed)'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1C201D] line-clamp-1 mb-1">{res.title}</h4>
                  <p className="text-xs text-[#57605A] line-clamp-1">{res.targetJobTitle}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#848E88] mt-3">
                    <Clock className="w-3 h-3" />
                    <span>Updated {new Date(res.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F0ECE1] flex items-center justify-between">
                  <button
                    onClick={() => onSelectResumeToReview(res)}
                    className="text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
                  >
                    Score Engine
                  </button>
                  <button
                    onClick={() => onSelectResumeToEdit(res)}
                    className="text-xs font-medium text-[#57605A] hover:text-[#1C201D] cursor-pointer"
                  >
                    Edit Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
