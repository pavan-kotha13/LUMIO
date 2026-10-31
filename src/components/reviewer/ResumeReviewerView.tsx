import React, { useState, useEffect } from 'react';
import { ResumeItem, ResumeScoreEvaluation, ScoreCategory, MissingKeyword, SkillGap, ImprovementRecommendation } from '../../types';
import { resumeService } from '../../services/resumeService';
import { scoreEngineService, PRESET_JOB_MANDATES, PresetJobMandate } from '../../services/scoreEngineService';
import { ScoreDisplay } from '../score-engine/ScoreDisplay';
import { CategoryScoreBreakdown } from '../score-engine/CategoryScoreBreakdown';
import { MissingKeywordList } from '../score-engine/MissingKeywordList';
import { SkillGapAnalysis } from '../score-engine/SkillGapAnalysis';
import { ImprovementRecommendations } from '../score-engine/ImprovementRecommendations';
import { ResumeInteractiveDiffViewer } from './ResumeInteractiveDiffViewer';
import { AtsSimulationPanel } from './AtsSimulationPanel';
import { AuditReportModal } from './AuditReportModal';
import { Button } from '../common/Button';
import {
  Gauge,
  Sparkles,
  UploadCloud,
  FileText,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Cpu,
  SplitSquareVertical,
  Edit3,
} from 'lucide-react';

interface ResumeReviewerViewProps {
  resumes: ResumeItem[];
  initialSelectedResume?: ResumeItem | null;
  onNavigateToStudio?: (resume?: ResumeItem) => void;
  onNavigateToEditor?: (resume?: ResumeItem) => void;
  onNavigateToResumes?: () => void;
}

export const ResumeReviewerView: React.FC<ResumeReviewerViewProps> = ({
  resumes,
  initialSelectedResume,
  onNavigateToStudio,
  onNavigateToEditor,
  onNavigateToResumes,
}) => {
  // Resume input mode: 'repository' | 'upload' | 'paste'
  const [resumeSource, setResumeSource] = useState<'repository' | 'upload' | 'paste'>('repository');
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    initialSelectedResume?.id || (resumes[0]?.id ?? '')
  );

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState<boolean>(false);
  const [uploadedText, setUploadedText] = useState<string>('');

  // Paste state
  const [pastedResumeText, setPastedResumeText] = useState<string>('');

  // Job Description mode: 'paste' | 'url'
  const [jobInputMode, setJobInputMode] = useState<'paste' | 'url'>('paste');
  const [targetJobTitle, setTargetJobTitle] = useState<string>('Staff Distributed Systems Engineer');
  const [targetCompany, setTargetCompany] = useState<string>('Cloudflare / Edge Infrastructure');
  const [jobDescriptionText, setJobDescriptionText] = useState<string>(
    PRESET_JOB_MANDATES[0].description
  );
  const [jobUrl, setJobUrl] = useState<string>('https://boards.greenhouse.io/cloudflare/jobs/5912831');
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);

  // Evaluation lifecycle state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationStage, setEvaluationStage] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<ResumeScoreEvaluation | null>(null);
  const [activeResumeText, setActiveResumeText] = useState<string>('');
  const [activeResultsTab, setActiveResultsTab] = useState<
    'breakdown' | 'keywords' | 'gaps' | 'recommendations' | 'diff' | 'simulator'
  >('breakdown');
  const [appliedRecommendationIds, setAppliedRecommendationIds] = useState<string[]>([]);
  const [isAuditReportOpen, setIsAuditReportOpen] = useState<boolean>(false);
  const [copiedKeywordId, setCopiedKeywordId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync initial resume if prop changes
  useEffect(() => {
    if (initialSelectedResume?.id) {
      setSelectedResumeId(initialSelectedResume.id);
      setResumeSource('repository');
    }
  }, [initialSelectedResume]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preset Selection
  const handleSelectPresetMandate = (preset: PresetJobMandate) => {
    setTargetJobTitle(preset.title);
    setTargetCompany(preset.company);
    setJobDescriptionText(preset.description);
    setJobInputMode('paste');
    showToast(`Loaded "${preset.title}" job mandate.`);
  };

  // Quick load sample candidate
  const handleLoadSampleResume = () => {
    const sample = scoreEngineService.getSampleResumeText();
    setPastedResumeText(sample);
    setResumeSource('paste');
    showToast('Loaded sample senior engineer profile into raw text editor.');
  };

  // Simulate file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const processUploadedFile = async (file: File) => {
    setIsSimulatingUpload(true);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/analysis/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to upload and extract document text.');
      }

      const data = await res.json();
      setUploadedText(data.rawText || '');
      if (data.is_scanned) {
        showToast(`Notice: "${file.name}" is a scanned/image PDF without selectable text.`);
      } else {
        showToast(`Parsed "${file.name}" with ATS semantic extraction (${data.charCount || 0} characters).`);
      }
    } catch (err: any) {
      console.error('Document upload error:', err);
      showToast(`Upload failed: ${err.message || 'Error parsing document'}`);
    } finally {
      setIsSimulatingUpload(false);
    }
  };

  // Fetch job URL simulation
  const handleFetchJobUrl = () => {
    if (!jobUrl) return;
    setIsFetchingUrl(true);
    setTimeout(() => {
      setIsFetchingUrl(false);
      // Select preset based on URL match or default to Cloudflare
      if (jobUrl.toLowerCase().includes('stripe')) {
        handleSelectPresetMandate(PRESET_JOB_MANDATES[1]);
      } else if (jobUrl.toLowerCase().includes('scale')) {
        handleSelectPresetMandate(PRESET_JOB_MANDATES[3]);
      } else {
        handleSelectPresetMandate(PRESET_JOB_MANDATES[0]);
      }
      setJobInputMode('paste');
      showToast('Extracted job requirements and competencies from URL.');
    }, 900);
  };

function formatResumeToText(resume: ResumeItem): string {
  const rData = resume.resume_data;
  if (!rData) return resume.summarySnippet || '';

  const parts: string[] = [];
  if (rData.personalInfo) {
    const p = rData.personalInfo;
    parts.push(`Candidate: ${p.fullName || ''}\nEmail: ${p.email || ''}\nLocation: ${p.location || ''}`);
  }
  if (rData.careerObjective) {
    const c = rData.careerObjective;
    parts.push(`Target Role: ${c.targetJobRole || resume.targetJobTitle || ''}\nSummary: ${c.professionalSummary || ''}`);
  }
  if (rData.skills) {
    const s = rData.skills;
    const skillList = Array.isArray(s)
      ? s
      : [
          ...(s.programmingLanguages || []),
          ...(s.frameworks || []),
          ...(s.databases || []),
          ...(s.developerTools || []),
          ...(s.coreSubjects || []),
          ...(s.otherSkills || []),
          ...(s.technical || []),
        ];
    if (skillList.length > 0) {
      parts.push(`Technical Skills: ${skillList.join(', ')}`);
    }
  }
  if (rData.experience && Array.isArray(rData.experience)) {
    parts.push('Experience:');
    rData.experience.forEach((e: any) => {
      parts.push(`- ${e.jobTitle || 'Role'} at ${e.organisation || 'Company'} (${e.startDate || ''} - ${e.endDate || 'Present'}): ${e.responsibilities || ''} ${e.keyAchievements || ''}`);
    });
  }
  if (rData.projects && Array.isArray(rData.projects)) {
    parts.push('Projects:');
    rData.projects.forEach((pr: any) => {
      parts.push(`- ${pr.projectName || 'Project'}: ${pr.projectDescription || ''}. Technologies: ${pr.technologiesUsed || ''}. Contributions: ${pr.keyContributions || ''}`);
    });
  }
  if (rData.education && Array.isArray(rData.education)) {
    parts.push('Education:');
    rData.education.forEach((ed: any) => {
      parts.push(`- ${ed.degree || 'Degree'} in ${ed.branch || 'Field'} from ${ed.institutionName || 'University'} (${ed.graduationYear || ''})`);
    });
  }
  if (rData.certifications && Array.isArray(rData.certifications)) {
    parts.push(`Certifications: ${rData.certifications.join(', ')}`);
  }
  return parts.length > 0 ? parts.join('\n\n') : (resume.summarySnippet || 'Candidate Resume');
}

  // Run Evaluation
  const handleRunEvaluation = async () => {
    let candidateContent = '';
    let fileName = 'Candidate_Resume.pdf';
    let targetResumeId: string | null = null;

    if (resumeSource === 'repository') {
      const selected = resumes.find((r) => r.id === selectedResumeId);
      if (!selected) {
        showToast('Please select a saved resume or create one to begin analysis.');
        return;
      }
      candidateContent = formatResumeToText(selected);
      fileName = selected.title ? `${selected.title.replace(/\s+/g, '_')}.pdf` : fileName;
      targetResumeId = selected.id;
    } else if (resumeSource === 'upload') {
      if (!uploadedText.trim()) {
        showToast('Please upload a resume file (PDF or DOCX) to extract its text before analyzing.');
        return;
      }
      candidateContent = uploadedText;
      fileName = uploadedFileName || 'Uploaded_Resume.pdf';
    } else {
      if (!pastedResumeText.trim()) {
        showToast('Please paste your resume content before analyzing.');
        return;
      }
      candidateContent = pastedResumeText;
      fileName = 'Pasted_Candidate_Dossier.txt';
    }

    if (!candidateContent.trim()) {
      showToast('Please provide resume content before analyzing.');
      return;
    }

    if (!jobDescriptionText.trim()) {
      showToast('Please paste a job description or select a preset mandate.');
      return;
    }

    setActiveResumeText(candidateContent);
    setAppliedRecommendationIds([]);
    setIsEvaluating(true);
    setEvaluationStage('Parsing resume ATS semantic tokens...');

    const timer1 = setTimeout(() => {
      setEvaluationStage('Analyzing job description keyword density...');
    }, 400);

    const timer2 = setTimeout(() => {
      setEvaluationStage('Computing deterministic 6-pillar weighted scores...');
    }, 800);

    try {
      const result = await scoreEngineService.evaluateResume(
        candidateContent,
        jobDescriptionText,
        {
          targetRole: targetJobTitle,
          companyName: targetCompany,
          resumeFileName: fileName,
        }
      );
      setEvaluationResult(result);

      // Persist genuine score back to resume in SQLite
      if (targetResumeId) {
        try {
          await resumeService.updateResume(targetResumeId, {
            score: result.overallScore,
            scoreGrade: result.scoreGrade,
            create_version: false,
          });
        } catch (e) {
          console.warn('Failed to update resume score in database:', e);
        }
      }

      showToast(`Compatibility Score Calculated: ${result.overallScore} / 100 (${result.scoreGrade})`);
    } catch (err) {
      console.error('Analysis error:', err);
      showToast('Evaluation failed. Please verify job description and try again.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsEvaluating(false);
      setEvaluationStage('');
    }
  };

  const handlePrintReport = () => {
    setIsAuditReportOpen(true);
  };

  const handleApplyRecommendation = (rec: ImprovementRecommendation) => {
    if (appliedRecommendationIds.includes(rec.id)) return;

    setAppliedRecommendationIds((prev) => [...prev, rec.id]);

    if (evaluationResult) {
      const newScore = Math.min(99, evaluationResult.overallScore + rec.estimatedScoreDelta);
      const newGrade =
        newScore >= 90
          ? 'Exceptional'
          : newScore >= 80
          ? 'Strong'
          : newScore >= 70
          ? 'Competitive'
          : 'Needs Revision';

      setEvaluationResult({
        ...evaluationResult,
        overallScore: newScore,
        scoreGrade: newGrade,
      });

      showToast(`Applied rewrite: +${rec.estimatedScoreDelta} points added! Compatibility now ${newScore}/100.`);
    }
  };

  const handleCopyKeyword = (kw: MissingKeyword) => {
    navigator.clipboard.writeText(kw.term);
    setCopiedKeywordId(kw.id);
    setTimeout(() => setCopiedKeywordId(null), 2000);
    showToast(`Copied keyword "${kw.term}" to clipboard.`);
  };

  const selectedRepoResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-elevated flex items-center gap-2 transition-all">
          <Check className="w-4 h-4 text-[#A3C4B0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E1D7]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold">
            <Gauge className="w-3.5 h-3.5" />
            <span>AI Resume Score Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C201D]">
            Resume Compatibility Reviewer
          </h1>
          <p className="text-xs sm:text-sm text-[#57605A]">
            Don't just match the job. Prove your fit. Transparent 6-pillar score analysis with zero hallucinated figures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {evaluationResult && (
            <>
              {onNavigateToEditor && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigateToEditor(selectedRepoResume || undefined)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Open in Resume Editor
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintReport}
                leftIcon={<Printer className="w-3.5 h-3.5 text-[#57605A]" />}
              >
                Export Report
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEvaluationResult(null)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                New Analysis
              </Button>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          STATE A: INPUT & SETUP FORM (Shown when no result or user toggles edit)
          ========================================================================= */}
      {!evaluationResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUMN 1: RESUME SOURCE (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E5E1D7] p-5 sm:p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-[#1C201D] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#1B4332]" />
                      <span>Step 1: Select Candidate Resume</span>
                    </h2>
                    <p className="text-xs text-[#57605A]">
                      Select from repository, upload a PDF/DOCX, or paste text.
                    </p>
                  </div>
                </div>

                {/* Resume Source Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs">
                  <button
                    type="button"
                    onClick={() => setResumeSource('repository')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      resumeSource === 'repository'
                        ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                        : 'text-[#57605A] hover:text-[#1C201D]'
                    }`}
                  >
                    My Saved Resumes ({resumes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeSource('upload')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      resumeSource === 'upload'
                        ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                        : 'text-[#57605A] hover:text-[#1C201D]'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeSource('paste')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      resumeSource === 'paste'
                        ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                        : 'text-[#57605A] hover:text-[#1C201D]'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>

                {/* Sub-tab 1: Select from Repository */}
                {resumeSource === 'repository' && (
                  <div className="space-y-3 pt-1">
                    {resumes.length === 0 ? (
                      <div className="text-center py-8 px-4 border border-dashed border-[#E5E1D7] rounded-xl bg-[#FAF8F5] space-y-3">
                        <p className="text-xs text-[#57605A]">
                          Create or upload a resume to begin your analysis.
                        </p>
                        <div className="flex justify-center gap-2 pt-1">
                          {onNavigateToStudio && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => onNavigateToStudio()}
                            >
                              Create Resume
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setResumeSource('upload')}
                          >
                            Upload File
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {resumes.map((r) => {
                          const isSelected = selectedResumeId === r.id;
                          return (
                            <div
                              key={r.id}
                              onClick={() => setSelectedResumeId(r.id)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                isSelected
                                  ? 'bg-[#F4F8F5] border-[#1B4332] shadow-subtle'
                                  : 'bg-white border-[#E5E1D7] hover:border-[#1B4332]/50'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xs font-bold text-[#1C201D] truncate">{r.title}</h3>
                                  <span className="text-[10px] font-mono text-[#1B4332] bg-[#EBF2EC] px-1.5 py-0.2 rounded font-semibold">
                                    {r.version}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-[#57605A]">
                                  <span>{r.targetJobTitle}</span>
                                  <span>·</span>
                                  <span>{r.format}</span>
                                </div>
                                <p className="text-[11px] text-[#848E88] line-clamp-1">
                                  {r.summarySnippet}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-bold text-[#1C201D] block">
                                  {typeof r.score === 'number' && r.score > 0 ? `${r.score}% Match` : 'Draft'}
                                </span>
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1B4332] mt-1">
                                    <Check className="w-3 h-3" /> Selected
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#848E88] mt-1 block">
                                    Click to select
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab 2: Upload File */}
                {resumeSource === 'upload' && (
                  <div className="space-y-3 pt-1">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className="border-2 border-dashed border-[#C8DFCF] hover:border-[#1B4332] bg-[#FAF8F5] rounded-2xl p-6 text-center space-y-3 transition-colors cursor-pointer relative"
                    >
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileInputChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-12 h-12 rounded-full bg-[#EBF2EC] text-[#1B4332] flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#1C201D]">
                          Drop your resume file here, or{' '}
                          <span className="text-[#1B4332] underline">browse files</span>
                        </p>
                        <p className="text-[11px] text-[#57605A]">
                          Supports PDF, DOCX, and TXT files up to 10 MB.
                        </p>
                      </div>
                    </div>

                    {/* Loaded / parsed file status */}
                    {uploadedFileName && (
                      <div className="p-3 rounded-xl bg-[#F4F8F5] border border-[#C8DFCF] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#1B4332]" />
                          <div>
                            <span className="text-xs font-bold text-[#1C201D] block">
                              {uploadedFileName}
                            </span>
                            <span className="text-[10px] text-[#57605A]">
                              {uploadedFileSize} · ATS semantic layer parsed
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#848E88]">Need a benchmark test file?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileName('Marcus_Vance_Resume_Staff.pdf');
                          setUploadedFileSize('142.4 KB');
                          setUploadedText(scoreEngineService.getSampleResumeText());
                          showToast('Loaded Marcus Vance Staff Engineer resume sample.');
                        }}
                        className="text-[11px] font-semibold text-[#1B4332] hover:underline cursor-pointer"
                      >
                        Load Sample Staff Resume
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-tab 3: Paste Text */}
                {resumeSource === 'paste' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#57605A]">
                        Paste complete text including experience, skills, and projects:
                      </span>
                      <button
                        type="button"
                        onClick={handleLoadSampleResume}
                        className="text-[11px] font-semibold text-[#1B4332] hover:underline cursor-pointer"
                      >
                        Insert Sample Resume Text
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      value={pastedResumeText}
                      onChange={(e) => setPastedResumeText(e.target.value)}
                      placeholder="Paste resume content here..."
                      className="w-full text-xs font-mono text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle resize-none leading-relaxed"
                    />
                    <div className="flex justify-between items-center text-[11px] text-[#848E88]">
                      <span>
                        Words: {pastedResumeText.trim().split(/\s+/).filter(Boolean).length}
                      </span>
                      <span>Chars: {pastedResumeText.length}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: JOB MANDATE (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E5E1D7] p-5 sm:p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-[#1C201D] flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#1B4332]" />
                      <span>Step 2: Target Job Description</span>
                    </h2>
                    <p className="text-xs text-[#57605A]">
                      Paste the employer's posting, enter a URL, or pick a preset mandate.
                    </p>
                  </div>
                </div>

                {/* Job Input Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs">
                  <button
                    type="button"
                    onClick={() => setJobInputMode('paste')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      jobInputMode === 'paste'
                        ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                        : 'text-[#57605A] hover:text-[#1C201D]'
                    }`}
                  >
                    Paste Mandate Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobInputMode('url')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                      jobInputMode === 'url'
                        ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                        : 'text-[#57605A] hover:text-[#1C201D]'
                    }`}
                  >
                    Job URL
                  </button>
                </div>

                {jobInputMode === 'paste' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">
                          Target Role Title
                        </label>
                        <input
                          type="text"
                          value={targetJobTitle}
                          onChange={(e) => setTargetJobTitle(e.target.value)}
                          placeholder="e.g. Staff Distributed Systems Engineer"
                          className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">
                          Company / Team
                        </label>
                        <input
                          type="text"
                          value={targetCompany}
                          onChange={(e) => setTargetCompany(e.target.value)}
                          placeholder="e.g. Cloudflare / Core Edge"
                          className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-[#1C201D]">
                          Full Job Posting Requirements
                        </label>
                        <span className="text-[10px] text-[#848E88]">
                          {jobDescriptionText.length} characters
                        </span>
                      </div>
                      <textarea
                        rows={7}
                        value={jobDescriptionText}
                        onChange={(e) => setJobDescriptionText(e.target.value)}
                        placeholder="Paste requirements, competencies, tech stack, and qualifications..."
                        className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <label className="block text-[11px] font-semibold text-[#1C201D]">
                      Job Posting URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        placeholder="https://boards.greenhouse.io/company/jobs/..."
                        className="flex-1 text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2.5 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                      />
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleFetchJobUrl}
                        isLoading={isFetchingUrl}
                        rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Fetch Mandate
                      </Button>
                    </div>
                    <p className="text-[11px] text-[#57605A]">
                      Extracts role requirements, key competencies, and technology keywords directly from the employer page.
                    </p>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="pt-2 border-t border-[#F0ECE1] space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E88] block">
                    Or select a pre-calibrated role mandate:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_JOB_MANDATES.map((preset) => {
                      const isChosen = targetJobTitle === preset.title;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPresetMandate(preset)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-[#F4F8F5] border-[#1B4332] shadow-xs'
                              : 'bg-[#FAF8F5] border-[#E5E1D7] hover:border-[#1B4332]/50 hover:bg-white'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-[#1C201D] block line-clamp-1">
                            {preset.title}
                          </span>
                          <span className="text-[10px] text-[#57605A] block line-clamp-1">
                            {preset.company}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Callout Bar */}
          <div className="bg-[#1B4332] text-white rounded-2xl p-6 shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#A3C4B0]" />
                <span className="text-xs font-semibold text-[#A3C4B0] uppercase tracking-wider">
                  Transparent 6-Pillar Formula
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                Run AI Resume Score Engine & Compatibility Audit
              </h3>
              <p className="text-xs text-white/80 max-w-xl">
                Evaluates technical skills (30%), keyword alignment (20%), project relevance (20%), work experience (15%), formatting & readability (10%), and education relevance (5%).
              </p>
            </div>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleRunEvaluation}
              isLoading={isEvaluating}
              leftIcon={<Gauge className="w-4 h-4 text-[#1B4332]" />}
              className="bg-white text-[#1B4332] hover:bg-[#FAF8F5] border-white shrink-0 shadow-sm"
            >
              {isEvaluating ? (evaluationStage || 'Calculating Score...') : 'Calculate Compatibility Score'}
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE B: RESULTS & EVALUATION DASHBOARD
          ========================================================================= */}
      {evaluationResult && (
        <div className="space-y-6">
          {/* Top Score Hero Card */}
          <ScoreDisplay
            evaluation={evaluationResult}
            onMethodologyClick={() => setActiveResultsTab('breakdown')}
          />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E1D7] shadow-subtle">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#1C201D]">Analysis Target:</span>
              <span className="bg-[#FAF8F5] text-[#57605A] px-2.5 py-1 rounded-lg border border-[#E5E1D7]">
                {evaluationResult.jobTitle}
              </span>
              <span className="text-[#848E88] hidden md:inline">·</span>
              <span className="text-[#57605A] text-[11px] hidden md:inline">
                Analyzed {new Date(evaluationResult.evaluatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEvaluationResult(null)}
                className="text-xs font-semibold text-[#1B4332] hover:underline px-2 py-1 cursor-pointer"
              >
                Modify Mandate / Resume
              </button>

              {onNavigateToStudio && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigateToStudio(selectedRepoResume || undefined)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Open in AI Resume Studio
                </Button>
              )}
            </div>
          </div>

          {/* Analysis View Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#E5E1D7] text-xs">
            <button
              onClick={() => setActiveResultsTab('breakdown')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                activeResultsTab === 'breakdown'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              1. 6-Pillar Breakdown
            </button>
            <button
              onClick={() => setActiveResultsTab('keywords')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeResultsTab === 'keywords'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <span>2. Missing Keywords</span>
              <span className="bg-[#F3EFE7] text-[#1C201D] text-[10px] font-mono px-1.5 py-0.2 rounded-full">
                {evaluationResult.missingKeywords.length}
              </span>
            </button>
            <button
              onClick={() => setActiveResultsTab('gaps')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeResultsTab === 'gaps'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <span>3. Skill Gap Analysis</span>
              <span className="bg-[#F3EFE7] text-[#1C201D] text-[10px] font-mono px-1.5 py-0.2 rounded-full">
                {evaluationResult.skillGaps.length}
              </span>
            </button>
            <button
              onClick={() => setActiveResultsTab('recommendations')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeResultsTab === 'recommendations'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <span>4. Actionable Rewrites</span>
              <span className="bg-[#EBF2EC] text-[#1B4332] text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                {evaluationResult.recommendations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveResultsTab('diff')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeResultsTab === 'diff'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>5. ATS Heatmap & Diff</span>
            </button>
            <button
              onClick={() => setActiveResultsTab('simulator')}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeResultsTab === 'simulator'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>6. ATS Parser Simulator</span>
            </button>
          </div>

          {/* Main Tab Panels */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E5E1D7] p-6 sm:p-8 shadow-card">
            {/* TAB 1: 6-PILLAR CATEGORY BREAKDOWN */}
            {activeResultsTab === 'breakdown' && (
              <div className="space-y-6">
                <CategoryScoreBreakdown categories={evaluationResult.categories} />

                {/* Transparent Formula Callout */}
                <div className="p-5 rounded-2xl bg-white border border-[#E5E1D7] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1C201D]">
                    <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                    <span>Transparent Scoring Methodology</span>
                  </div>
                  <p className="text-xs text-[#57605A] leading-relaxed">
                    The overall compatibility score ({evaluationResult.overallScore}/100) is calculated as the exact weighted sum:
                    <span className="font-mono text-[#1C201D] block mt-1 bg-[#FAF8F5] p-2 rounded-lg border border-[#E5E1D7]">
                      (Keyword Alignment × 0.25) + (Technical Skills × 0.25) + (Work Experience × 0.20) + (Project Relevance × 0.15) + (Formatting × 0.10) + (Education × 0.05)
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: MISSING KEYWORDS */}
            {activeResultsTab === 'keywords' && (
              <div className="space-y-6">
                <MissingKeywordList
                  keywords={evaluationResult.missingKeywords}
                  onAddKeyword={handleCopyKeyword}
                />

                <div className="p-4 rounded-xl bg-white border border-[#E5E1D7] text-xs text-[#57605A] flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-[#8C5D1E] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-[#1C201D]">ATS Tip:</strong> Only include missing keywords if you have genuine, hands-on experience with them. Never keyword-stuff or fabricate unverified qualifications.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: SKILL GAP ANALYSIS */}
            {activeResultsTab === 'gaps' && (
              <div className="space-y-6">
                <SkillGapAnalysis skillGaps={evaluationResult.skillGaps} />
              </div>
            )}

            {/* TAB 4: ACTIONABLE RECOMMENDATIONS & REWRITES */}
            {activeResultsTab === 'recommendations' && (
              <div className="space-y-6">
                <ImprovementRecommendations
                  recommendations={evaluationResult.recommendations}
                  onApplyRecommendation={handleApplyRecommendation}
                  appliedIds={appliedRecommendationIds}
                />
              </div>
            )}

            {/* TAB 5: INTERACTIVE RESUME DIFF & ATS HEATMAP */}
            {activeResultsTab === 'diff' && (
              <div className="space-y-6">
                <ResumeInteractiveDiffViewer
                  resumeText={activeResumeText || scoreEngineService.getSampleResumeText()}
                  evaluation={evaluationResult}
                />
              </div>
            )}

            {/* TAB 6: ENTERPRISE ATS PARSER SIMULATOR */}
            {activeResultsTab === 'simulator' && (
              <div className="space-y-6">
                <AtsSimulationPanel
                  resumeText={activeResumeText || scoreEngineService.getSampleResumeText()}
                />
              </div>
            )}
          </div>

          {/* Integration Bridge Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
                  <Edit3 className="w-4 h-4" />
                  <span>Resume Editor & Live Preview</span>
                </div>
                <h3 className="text-base font-bold text-[#1C201D]">
                  Open in Document Editor
                </h3>
                <p className="text-xs text-[#57605A] leading-relaxed">
                  Refine bullets with live A4 document preview, reorder sections, customize fonts and spacing, and export to PDF or DOCX.
                </p>
              </div>

              {onNavigateToEditor && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigateToEditor(selectedRepoResume || undefined)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Open in Resume Editor
                </Button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Resume Studio Integration</span>
                </div>
                <h3 className="text-base font-bold text-[#1C201D]">
                  Apply Rewrites in AI Studio
                </h3>
                <p className="text-xs text-[#57605A] leading-relaxed">
                  Open your resume in the studio workspace to apply suggested bullet rewrites, add missing keywords, and re-generate professional summaries.
                </p>
              </div>

              {onNavigateToStudio && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onNavigateToStudio(selectedRepoResume || undefined)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Edit in Resume Studio
                </Button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#57605A]">
                  <Layers className="w-4 h-4 text-[#1B4332]" />
                  <span>Resume Repository & Versions</span>
                </div>
                <h3 className="text-base font-bold text-[#1C201D]">
                  Compare Multiple Role Versions
                </h3>
                <p className="text-xs text-[#57605A] leading-relaxed">
                  Store dedicated resume versions calibrated for specific employers, and track score improvements across your version history.
                </p>
              </div>

              {onNavigateToResumes && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onNavigateToResumes}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  View My Resumes Repository
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Executive Audit Report Modal */}
      {evaluationResult && (
        <AuditReportModal
          isOpen={isAuditReportOpen}
          onClose={() => setIsAuditReportOpen(false)}
          evaluation={evaluationResult}
        />
      )}
    </div>
  );
};
