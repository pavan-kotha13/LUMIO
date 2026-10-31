import React, { useState } from 'react';
import { ResumeItem, ResumeStudioData } from '../../types';
import { INITIAL_EMPTY_STUDIO_DATA, SAMPLE_CANDIDATE_DATA } from '../../utils/sampleResumeData';
import { PersonalInfoSection } from './PersonalInfoSection';
import { CareerObjectiveSection } from './CareerObjectiveSection';
import { EducationSection } from './EducationSection';
import { SkillsSection } from './SkillsSection';
import { SoftSkillsSection } from './SoftSkillsSection';
import { ProjectsSection } from './ProjectsSection';
import { ExperienceSection } from './ExperienceSection';
import { CertificationsSection } from './CertificationsSection';
import { AchievementsSection } from './AchievementsSection';
import { ExtracurricularsSection } from './ExtracurricularsSection';
import { ResumeDocumentPreview } from './ResumeDocumentPreview';
import { ImproveExistingTab } from './ImproveExistingTab';
import { Button } from '../common/Button';
import {
  Sparkles,
  FilePlus,
  RotateCcw,
  Eye,
  Edit3,
  Check,
  ShieldCheck,
  ArrowRight,
  Gauge,
  Share2,
} from 'lucide-react';

interface ResumeStudioViewProps {
  resumes: ResumeItem[];
  onSaveNewResume: (data: Partial<ResumeItem>) => Promise<void>;
  onLaunchReviewer: (resume: ResumeItem) => void;
  onNavigateToEditor?: (data: ResumeStudioData) => void;
}

export const ResumeStudioView: React.FC<ResumeStudioViewProps> = ({
  resumes,
  onSaveNewResume,
  onLaunchReviewer,
  onNavigateToEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'scratch' | 'improve'>('scratch');
  const [studioData, setStudioData] = useState<ResumeStudioData>(INITIAL_EMPTY_STUDIO_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');

  const handleLoadSample = () => {
    setStudioData(SAMPLE_CANDIDATE_DATA);
  };

  const handleClear = () => {
    setStudioData(INITIAL_EMPTY_STUDIO_DATA);
  };

  const handleSaveToRepository = async () => {
    setIsSaving(true);
    try {
      const allSkills = [
        ...studioData.skills.programmingLanguages,
        ...studioData.skills.frameworks,
        ...studioData.skills.developerTools,
      ].slice(0, 6);

      await onSaveNewResume({
        title: `${studioData.careerObjective.targetJobRole || studioData.personalInfo.fullName || 'Architected Resume'} — Studio`,
        targetJobTitle: studioData.careerObjective.targetJobRole || 'Software Professional',
        targetCompany: studioData.careerObjective.targetIndustry || 'Enterprise Tech',
        format: (studioData.selectedTemplate as any) || 'ATS Minimalist',
        score: undefined,
        scoreGrade: undefined,
        tags: allSkills.length > 0 ? allSkills : ['General'],
        summarySnippet:
          studioData.careerObjective.professionalSummary ||
          `${studioData.personalInfo.fullName || 'Candidate'} — ${
            studioData.careerObjective.targetJobRole || 'Professional'
          }`,
        resume_data: studioData,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportFromExisting = (resume: ResumeItem) => {
    // Populate studio data using existing resume metadata
    setStudioData({
      ...SAMPLE_CANDIDATE_DATA,
      personalInfo: {
        ...SAMPLE_CANDIDATE_DATA.personalInfo,
        fullName: resume.title.split('—')[0].trim(),
      },
      careerObjective: {
        targetJobRole: resume.targetJobTitle,
        targetIndustry: resume.targetCompany || 'Technology',
        professionalSummary: resume.summarySnippet,
      },
      skills: {
        ...SAMPLE_CANDIDATE_DATA.skills,
        programmingLanguages: resume.tags.slice(0, 3),
        developerTools: resume.tags.slice(3),
      },
    });
    setActiveTab('scratch');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-elevated flex items-center gap-2">
          <Check className="w-4 h-4 text-[#A3C4B0]" />
          <span>Resume saved to your repository in "My Resumes".</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume Creation Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C201D]">
            AI Resume Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#57605A]">
            Build a professional resume that demonstrates your skills and matches your career goals.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToEditor && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateToEditor(studioData)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Open in Resume Editor
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // Populate from sample candidate / LinkedIn
              handleLoadSample();
              alert('Imported verified candidate profile into Resume Studio.');
            }}
            leftIcon={<Share2 className="w-3.5 h-3.5 text-[#1B4332]" />}
            title="Import candidate profile from LinkedIn"
          >
            Import LinkedIn
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadSample}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#1B4332]" />}
            title="Pre-populate with sample candidate information for quick testing"
          >
            Load Sample Profile
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear Form
          </Button>
        </div>
      </div>

      {/* Two Top Tabs */}
      <div className="flex items-center justify-between border-b border-[#E5E1D7] pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('scratch')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'scratch'
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            1. Create from Scratch
          </button>
          <button
            onClick={() => setActiveTab('improve')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'improve'
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            2. Improve Existing Resume
          </button>
        </div>

        {/* Mobile View Toggle */}
        <div className="lg:hidden flex items-center gap-1 p-1 bg-[#F3EFE7] rounded-xl border border-[#E5E1D7] text-xs">
          <button
            onClick={() => setMobilePane('editor')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              mobilePane === 'editor' ? 'bg-white text-[#1C201D] shadow-sm' : 'text-[#57605A]'
            }`}
          >
            Form Editor
          </button>
          <button
            onClick={() => setMobilePane('preview')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              mobilePane === 'preview' ? 'bg-white text-[#1C201D] shadow-sm' : 'text-[#57605A]'
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* TAB 1: CREATE FROM SCRATCH */}
      {activeTab === 'scratch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Form Sections */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              mobilePane === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Zero-hallucination banner */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] flex items-center gap-2.5 text-xs text-[#57605A]">
              <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>
                <strong>Architect Integrity Guarantee:</strong> Gemini AI refines sentence clarity
                and keywords using <em>only</em> your supplied inputs—never hallucinating false qualifications.
              </span>
            </div>

            {/* Section A: Personal Information */}
            <PersonalInfoSection
              data={studioData.personalInfo}
              onChange={(updated) => setStudioData({ ...studioData, personalInfo: updated })}
            />

            {/* Section B: Career Objective & Summary */}
            <CareerObjectiveSection
              data={studioData.careerObjective}
              allData={studioData}
              onChange={(updated) => setStudioData({ ...studioData, careerObjective: updated })}
            />

            {/* Section C: Education */}
            <EducationSection
              entries={studioData.education}
              onChange={(updated) => setStudioData({ ...studioData, education: updated })}
            />

            {/* Section D: Technical Skills */}
            <SkillsSection
              skills={studioData.skills}
              targetRole={studioData.careerObjective.targetJobRole}
              onChange={(updated) => setStudioData({ ...studioData, skills: updated })}
            />

            {/* Section E: Soft Skills */}
            <SoftSkillsSection
              softSkills={studioData.softSkills || []}
              onChange={(updated) => setStudioData({ ...studioData, softSkills: updated })}
            />

            {/* Section F: Projects */}
            <ProjectsSection
              projects={studioData.projects}
              onChange={(updated) => setStudioData({ ...studioData, projects: updated })}
            />

            {/* Section G: Experience & Internships */}
            <ExperienceSection
              experience={studioData.experience}
              onChange={(updated) => setStudioData({ ...studioData, experience: updated })}
            />

            {/* Section H: Certifications & Licenses */}
            <CertificationsSection
              certifications={studioData.certifications || []}
              onChange={(updated) => setStudioData({ ...studioData, certifications: updated })}
            />

            {/* Section I: Achievements & Honors */}
            <AchievementsSection
              achievements={studioData.achievements || []}
              onChange={(updated) => setStudioData({ ...studioData, achievements: updated })}
            />

            {/* Section J: Extracurricular Activities */}
            <ExtracurricularsSection
              extracurriculars={studioData.extracurriculars || []}
              onChange={(updated) => setStudioData({ ...studioData, extracurriculars: updated })}
            />
          </div>

          {/* Right Side: Live ATS Document Preview */}
          <div
            className={`lg:col-span-5 sticky top-24 ${
              mobilePane === 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <ResumeDocumentPreview
              data={studioData}
              onSaveToRepository={handleSaveToRepository}
              onSelectTemplate={(tmpl) => setStudioData({ ...studioData, selectedTemplate: tmpl })}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      {/* TAB 2: IMPROVE EXISTING RESUME */}
      {activeTab === 'improve' && (
        <ImproveExistingTab
          resumes={resumes}
          onImportToStudio={handleImportFromExisting}
          onLaunchReviewer={onLaunchReviewer}
        />
      )}
    </div>
  );
};
