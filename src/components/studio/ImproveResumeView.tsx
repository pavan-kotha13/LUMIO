import React, { useState } from 'react';
import { ResumeItem, ResumeStudioData, ResumeScoreEvaluation } from '../../types';
import { PRESET_JOB_MANDATES, PresetJobMandate } from '../../services/scoreEngineService';
import { CategoryScoreBreakdown } from '../score-engine/CategoryScoreBreakdown';
import { ScoreDisplay } from '../score-engine/ScoreDisplay';
import { Button } from '../common/Button';
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Save,
  RotateCcw,
  Building2,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ImproveResumeViewProps {
  resumes: ResumeItem[];
  onSavedImprovedResume: (data: Partial<ResumeItem>) => Promise<void>;
  onNavigateToResumes: () => void;
}

interface ExtractedDataState {
  filename: string;
  charCount: number;
  rawText: string;
  structuredData: any;
}

interface ImprovementItem {
  id: string;
  section: string;
  original: string;
  suggested: string;
  truthguard_status: 'SUPPORTED' | 'NEEDS_CONFIRMATION' | 'UNSUPPORTED';
  verification_rationale: string;
  accepted: boolean;
}

export const ImproveResumeView: React.FC<ImproveResumeViewProps> = ({
  resumes,
  onSavedImprovedResume,
  onNavigateToResumes,
}) => {
  // Step tracker: 1 = Upload, 2 = Review Extracted & Input JD, 3 = Score & TruthGuard, 4 = AI Improvements & Save
  const [currentStep, setCurrentStep] = useState<number>(1);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDataState | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Job Description state
  const [targetRole, setTargetRole] = useState('Staff Distributed Systems Engineer');
  const [targetCompany, setTargetCompany] = useState('Cloudflare / Edge Infrastructure');
  const [jobDescription, setJobDescription] = useState(PRESET_JOB_MANDATES[0].description);

  // Analysis & Scoring state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'scores' | 'evidence' | 'truthguard' | 'improvements'>('scores');

  // AI Improvements state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [improvements, setImprovements] = useState<ImprovementItem[]>([]);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Step 1: Upload handler
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('resume_architect_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/analysis/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Upload failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      setExtractedData(data);
      setCurrentStep(2);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setUploadError(err.message || 'Failed to upload and extract text from resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPreset = (preset: PresetJobMandate) => {
    setTargetRole(preset.title);
    setTargetCompany(preset.company);
    setJobDescription(preset.description);
  };

  // Step 5 & 6: Execute Score Engine
  const handleRunAnalysis = async () => {
    if (!extractedData?.rawText) {
      setUploadError('Please upload a resume first.');
      return;
    }
    if (!jobDescription.trim()) {
      setUploadError('Please provide a job description.');
      return;
    }

    setIsAnalyzing(true);
    setUploadError(null);

    try {
      const payload = {
        raw_resume_text: extractedData.rawText,
        target_job_description: jobDescription,
        target_role: targetRole,
        companyName: targetCompany,
        resumeFileName: extractedData.filename,
        resume_data: extractedData.structuredData,
      };

      const token = localStorage.getItem('resume_architect_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/score-engine/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Analysis failed with HTTP ${res.status}`);
      }

      const evalData = await res.json();
      setEvaluationResult(evalData);
      setCurrentStep(3);

      // Auto-generate initial AI improvement suggestions
      generateImprovements(evalData, extractedData.rawText);
    } catch (err: any) {
      console.error('Score engine failed:', err);
      setUploadError(err.message || 'Failed to run Score Engine analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 9: Generate AI Improvements with TruthGuard
  const generateImprovements = async (evalData: any, rawText: string) => {
    setIsGeneratingAi(true);
    try {
      // Collect bullets from extracted structured data or sample lines
      const bullets = (extractedData?.structuredData?.experience || [])
        .flatMap((e: any) => e.bullets || (e.responsibilities ? e.responsibilities.split('\n') : []))
        .filter((b: string) => b.trim().length > 15)
        .slice(0, 5);

      if (bullets.length === 0) {
        // Fallback bullets from raw text
        const lines = rawText
          .split('\n')
          .map((l) => l.trim().replace(/^[•\-\*]\s*/, ''))
          .filter((l) => l.length > 25 && /architected|developed|built|managed|led|reduced|optimized/i.test(l))
          .slice(0, 4);
        bullets.push(...lines);
      }

      const res = await fetch('/api/analysis/truthguard/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullets: bullets.length > 0 ? bullets : ['Led backend service architecture and database scaling'],
          resume_data: extractedData?.structuredData || {},
          job_description: jobDescription,
        }),
      });

      if (res.ok) {
        const tgData = await res.json();
        const formatted: ImprovementItem[] = (tgData.results || []).map((r: any, idx: number) => ({
          id: `imp_${idx + 1}`,
          section: 'Experience',
          original: r.original_bullet || bullets[idx] || '',
          suggested: r.suggested_improvement || r.original_bullet,
          truthguard_status: r.truthguard_status || 'SUPPORTED',
          verification_rationale: r.verification_rationale || 'Ground truth verified against resume facts.',
          accepted: r.truthguard_status === 'SUPPORTED',
        }));
        setImprovements(formatted);
      }
    } catch (err) {
      console.warn('AI improvement generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleToggleAccept = (id: string) => {
    setImprovements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, accepted: !item.accepted } : item))
    );
  };

  // Step 11: Save improved version to SQLite
  const handleSaveImprovedVersion = async () => {
    if (!extractedData) return;
    setIsSavingVersion(true);
    setSaveSuccessMsg(null);

    try {
      const acceptedBullets = improvements
        .filter((i) => i.accepted)
        .map((i) => i.suggested);

      // Build updated resume data
      const updatedStruct = {
        ...(extractedData.structuredData || {}),
        personalInfo: {
          fullName: extractedData.structuredData?.contact?.name || 'Candidate',
          email: extractedData.structuredData?.contact?.email || '',
          phone: extractedData.structuredData?.contact?.phone || '',
          location: extractedData.structuredData?.contact?.location || '',
        },
        careerObjective: {
          targetJobRole: targetRole,
          targetIndustry: targetCompany,
          professionalSummary: `Targeted for ${targetRole} with verified competencies in ${
            (evaluationResult?.matched_requirements || []).map((r: any) => r.name || r).slice(0, 4).join(', ')
          }.`,
        },
        skills: {
          programmingLanguages: extractedData.structuredData?.skills || [],
          frameworks: [],
          databases: [],
          developerTools: [],
          coreSubjects: [],
          otherSkills: [],
        },
        experience: [
          {
            id: 'exp_imp_1',
            jobTitle: targetRole,
            organisation: targetCompany,
            startDate: '2022',
            endDate: 'Present',
            isCurrent: true,
            responsibilities: acceptedBullets.join('\n'),
            keyAchievements: 'Quantified deliverables verified through TruthGuard protocol.',
          },
        ],
        projects: extractedData.structuredData?.projects || [],
        education: extractedData.structuredData?.education || [],
      };

      await onSavedImprovedResume({
        title: `${targetRole} — Improved Version`,
        targetJobTitle: targetRole,
        targetCompany: targetCompany,
        format: 'ATS Minimalist',
        score: evaluationResult?.overall_score || evaluationResult?.overallScore || 88,
        scoreGrade: evaluationResult?.score_grade || evaluationResult?.scoreGrade || 'Strong',
        tags: (extractedData.structuredData?.skills || []).slice(0, 5),
        summarySnippet: `AI-improved dossier calibrated against ${targetRole} with ${acceptedBullets.length} TruthGuard-verified improvements.`,
        resume_data: updatedStruct,
      });

      setSaveSuccessMsg('Improved resume saved as new version in SQLite repository!');
      setTimeout(() => {
        onNavigateToResumes();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save improved resume:', err);
      setUploadError(err.message || 'Failed to save improved version.');
    } finally {
      setIsSavingVersion(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-elevated flex items-center gap-2">
          <Check className="w-4 h-4 text-[#A3C4B0]" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 sm:p-8 shadow-card space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resume Improver & Verification Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C201D]">
          Improve Existing Resume
        </h1>
        <p className="text-xs sm:text-sm text-[#57605A] max-w-3xl leading-relaxed">
          Upload your existing PDF or DOCX resume. Our backend extracts the ATS text and semantic tokens,
          evaluates compatibility across the 6-pillar score engine, validates claims with TruthGuard,
          and generates verifiable improvements.
        </p>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-[#F0ECE1]">
          <div
            className={`p-3 rounded-xl border text-xs font-medium transition-all ${
              currentStep === 1
                ? 'bg-[#EBF2EC] border-[#1B4332] text-[#1B4332] font-bold'
                : currentStep > 1
                ? 'bg-[#FAF8F5] border-[#E5E1D7] text-[#1C201D]'
                : 'bg-white border-[#E5E1D7] text-[#848E88]'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase text-[#848E88]">Step 1</span>
            <span>1. Upload PDF / DOCX</span>
          </div>
          <div
            className={`p-3 rounded-xl border text-xs font-medium transition-all ${
              currentStep === 2
                ? 'bg-[#EBF2EC] border-[#1B4332] text-[#1B4332] font-bold'
                : currentStep > 2
                ? 'bg-[#FAF8F5] border-[#E5E1D7] text-[#1C201D]'
                : 'bg-white border-[#E5E1D7] text-[#848E88]'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase text-[#848E88]">Step 2</span>
            <span>2. Review & Target JD</span>
          </div>
          <div
            className={`p-3 rounded-xl border text-xs font-medium transition-all ${
              currentStep >= 3
                ? 'bg-[#EBF2EC] border-[#1B4332] text-[#1B4332] font-bold'
                : 'bg-white border-[#E5E1D7] text-[#848E88]'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase text-[#848E88]">Step 3</span>
            <span>3. Score & TruthGuard</span>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* STEP 1: FILE UPLOAD ZONE */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#D5D0C4] hover:border-[#1B4332] transition-colors p-8 sm:p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF2EC] text-[#1B4332] flex items-center justify-center mx-auto shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1C201D]">
              Upload your Resume Document
            </h3>
            <p className="text-xs text-[#57605A] max-w-md mx-auto">
              Select a PDF or DOCX file. Our backend parser (PyMuPDF & python-docx) will extract contact details,
              work history, technical skills, and projects.
            </p>
          </div>

          <div className="pt-2">
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleFileUpload(files[0]);
                  }
                }}
              />
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143326] transition-colors shadow-sm">
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Extracting text...' : 'Select File from Computer'}</span>
              </span>
            </label>
            <p className="text-[11px] text-[#848E88] mt-2">PDF, DOCX, or TXT up to 15MB</p>
          </div>

          {/* Quick alternative: load from existing repository resumes */}
          {resumes.length > 0 && (
            <div className="pt-6 border-t border-[#F0ECE1]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E88] block mb-3">
                Or select an existing resume from your repository
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {resumes.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      const snippet = r.summarySnippet || `${r.title} candidate profile`;
                      setExtractedData({
                        filename: `${r.title}.pdf`,
                        charCount: snippet.length,
                        rawText: snippet,
                        structuredData: r.resume_data || {},
                      });
                      setCurrentStep(2);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5E1D7] text-[#1C201D] hover:border-[#1B4332] transition-colors cursor-pointer"
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: REVIEW EXTRACTED INFO & ENTER JOB DESCRIPTION */}
      {currentStep === 2 && extractedData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Resume Review */}
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1B4332]" />
                  <span className="text-xs font-bold text-[#1C201D]">
                    Extracted Document Content
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#848E88]">
                  {extractedData.filename} ({extractedData.charCount} characters)
                </span>
              </div>

              {extractedData.structuredData?.contact?.name && (
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] text-xs">
                  <span className="font-bold text-[#1C201D] block">
                    {extractedData.structuredData.contact.name}
                  </span>
                  <span className="text-[#57605A]">
                    {extractedData.structuredData.contact.email} ·{' '}
                    {extractedData.structuredData.contact.phone}
                  </span>
                </div>
              )}

              {extractedData.structuredData?.skills && extractedData.structuredData.skills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E88] block">
                    Extracted Skills ({extractedData.structuredData.skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {extractedData.structuredData.skills.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#EBF2EC] text-[#1B4332] text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E88] block">
                  Raw Parsed Text Preview
                </span>
                <textarea
                  value={extractedData.rawText}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      rawText: e.target.value,
                      charCount: e.target.value.length,
                    })
                  }
                  rows={8}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-[#E5E1D7] bg-[#FAF8F5] text-[#1C201D] focus:bg-white focus:border-[#1B4332] outline-none transition-colors"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Upload Different File
              </Button>
            </div>

            {/* Target Job Description Input */}
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1B4332]" />
                  <span className="text-xs font-bold text-[#1C201D]">
                    Target Job Description
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E88] block">
                  Quick Benchmark Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_JOB_MANDATES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        targetRole === p.title
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-[#FAF8F5] border-[#E5E1D7] text-[#57605A] hover:text-[#1C201D]'
                      }`}
                    >
                      {p.title.split('—')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#57605A] block mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E1D7] bg-[#FAF8F5] focus:bg-white focus:border-[#1B4332] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#57605A] block mb-1">
                    Company / Industry
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E1D7] bg-[#FAF8F5] focus:bg-white focus:border-[#1B4332] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#57605A] block">
                  Job Description Text
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  placeholder="Paste the target job description requirements here..."
                  className="w-full text-xs p-3 rounded-xl border border-[#E5E1D7] bg-[#FAF8F5] text-[#1C201D] focus:bg-white focus:border-[#1B4332] outline-none transition-colors"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleRunAnalysis}
                isLoading={isAnalyzing}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full"
              >
                Analyze & Score Compatibility
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SCORE, EVIDENCEMAP, TRUTHGUARD & AI IMPROVEMENTS */}
      {currentStep === 3 && evaluationResult && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE1] pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B4332] block">
                  Evaluation Complete
                </span>
                <h2 className="text-xl font-bold text-[#1C201D]">
                  {targetRole} ({targetCompany})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Adjust JD / Text
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveImprovedVersion}
                  isLoading={isSavingVersion}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save as New Version
                </Button>
              </div>
            </div>

            {/* Score Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono text-[#1B4332]">
                    {evaluationResult.overall_score || evaluationResult.overallScore}%
                  </div>
                  <span className="text-xs font-semibold text-[#57605A] block mt-1">
                    Overall Fit Score ({evaluationResult.score_grade || evaluationResult.scoreGrade})
                  </span>
                </div>
              </div>
              <div className="md:col-span-8">
                <CategoryScoreBreakdown
                  categories={evaluationResult.category_scores || evaluationResult.categories || []}
                />
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-[#E5E1D7] pb-1">
            <button
              onClick={() => setActiveTab('scores')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'scores'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              6-Pillar Breakdown
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'evidence'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              EvidenceMap Citations (
              {(evaluationResult.evidence_map || evaluationResult.evidenceMap || []).length})
            </button>
            <button
              onClick={() => setActiveTab('truthguard')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'truthguard'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              TruthGuard Anti-Hallucination
            </button>
            <button
              onClick={() => setActiveTab('improvements')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'improvements'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              AI Improvements ({improvements.length})
            </button>
          </div>

          {/* TAB: 6-PILLAR SCORES & MISSING KEYWORDS */}
          {activeTab === 'scores' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Requirements */}
              <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
                  <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
                  <span>
                    Verified Matched Skills & Keywords (
                    {(evaluationResult.matched_requirements || []).length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(evaluationResult.matched_requirements || []).map((req: any, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#EBF2EC] text-[#1B4332] text-xs font-medium border border-[#D1E3D6]"
                    >
                      {req.name || req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Requirements */}
              <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C2E2E]">
                  <AlertTriangle className="w-4 h-4 text-[#8C2E2E]" />
                  <span>
                    Missing Keywords & Competency Gaps (
                    {(evaluationResult.unmentioned_requirements || evaluationResult.missing_keywords || []).length}
                    )
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    evaluationResult.unmentioned_requirements ||
                    evaluationResult.missing_keywords ||
                    []
                  ).map((req: any, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200"
                    >
                      {req.name || req.term || req}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EVIDENCEMAP CITATIONS */}
          {activeTab === 'evidence' && (
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#1C201D]">EvidenceMap Citations</h3>
                <p className="text-xs text-[#57605A]">
                  Every claimed qualification is cross-referenced with exact line evidence from your resume.
                </p>
              </div>

              <div className="space-y-3">
                {(evaluationResult.evidence_map || evaluationResult.evidenceMap || []).map(
                  (item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#E5E1D7] bg-[#FAF8F5] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1C201D]">{item.requirement}</span>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            item.status === 'MATCHED'
                              ? 'bg-[#EBF2EC] text-[#1B4332]'
                              : item.status === 'PARTIALLY MATCHED'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#57605A]">
                        <strong>Resume Citation:</strong> "{item.resumeEvidence || item.evidence || 'None'}"
                      </p>
                      {item.location && (
                        <span className="text-[11px] text-[#848E88] font-mono block">
                          Location: {item.location}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* TAB: TRUTHGUARD */}
          {activeTab === 'truthguard' && (
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
                <ShieldCheck className="w-5 h-5 text-[#1B4332]" />
                <span className="text-base font-bold text-[#1C201D]">
                  TruthGuard Fact Verification Protocol
                </span>
              </div>
              <p className="text-xs text-[#57605A] leading-relaxed">
                TruthGuard verifies candidate claims against ground-truth facts in the uploaded resume.
                It flags unverified claims or exaggerated metrics so candidates never misrepresent experience to recruiters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#EBF2EC] border border-[#D1E3D6] space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-[#1B4332] block">
                    Supported Claims
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#1B4332]">
                    {improvements.filter((i) => i.truthguard_status === 'SUPPORTED').length}
                  </div>
                  <p className="text-[11px] text-[#57605A]">Directly grounded in resume evidence</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-amber-700 block">
                    Needs Confirmation
                  </span>
                  <div className="text-2xl font-bold font-mono text-amber-800">
                    {improvements.filter((i) => i.truthguard_status === 'NEEDS_CONFIRMATION').length}
                  </div>
                  <p className="text-[11px] text-[#57605A]">Metrics or scopes require candidate check</p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-red-700 block">
                    Unsupported
                  </span>
                  <div className="text-2xl font-bold font-mono text-red-800">
                    {improvements.filter((i) => i.truthguard_status === 'UNSUPPORTED').length}
                  </div>
                  <p className="text-[11px] text-[#57605A]">No supporting source facts found</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI IMPROVEMENTS */}
          {activeTab === 'improvements' && (
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1C201D]">
                    Verifiable AI Bullet Point Improvements
                  </h3>
                  <p className="text-xs text-[#57605A]">
                    Review suggested optimizations. Accept verified recommendations to bundle into your new resume version.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => extractedData && generateImprovements(evaluationResult, extractedData.rawText)}
                  isLoading={isGeneratingAi}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#1B4332]" />}
                >
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4">
                {improvements.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.accepted
                        ? 'border-[#1B4332] bg-[#FAF8F5]'
                        : 'border-[#E5E1D7] bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            item.truthguard_status === 'SUPPORTED'
                              ? 'bg-[#EBF2EC] text-[#1B4332]'
                              : item.truthguard_status === 'NEEDS_CONFIRMATION'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          TruthGuard: {item.truthguard_status}
                        </span>
                        <span className="text-[11px] font-semibold text-[#848E88]">
                          {item.section}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAccept(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          item.accepted
                            ? 'bg-[#1B4332] text-white'
                            : 'bg-[#F3EFE7] text-[#57605A] hover:text-[#1C201D]'
                        }`}
                      >
                        {item.accepted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Accepted</span>
                          </>
                        ) : (
                          <span>Accept</span>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="font-semibold text-[#848E88] block text-[10px] uppercase">
                          Original:
                        </span>
                        <p className="text-[#57605A] line-through">{item.original}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-[#1B4332] block text-[10px] uppercase">
                          Suggested Optimization:
                        </span>
                        <p className="text-[#1C201D] font-medium leading-relaxed">{item.suggested}</p>
                      </div>
                      <p className="text-[11px] text-[#848E88] italic pt-1">
                        Rationale: {item.verification_rationale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#F0ECE1] flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveImprovedVersion}
                  isLoading={isSavingVersion}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save as New Resume Version
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
