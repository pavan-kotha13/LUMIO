import React, { useState } from 'react';
import {
  LinkedInProfileData,
  LinkedInExperienceItem,
  LinkedInEducationItem,
  LinkedInProjectItem,
  LinkedInCertificationItem,
} from '../../types/linkedin';
import { ResumeItem } from '../../types';
import { Button } from '../common/Button';
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  RotateCcw,
  DownloadCloud,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  SAMPLE_EXPERIENCED_LINKEDIN_PROFILE,
  SAMPLE_FRESHER_LINKEDIN_PROFILE,
  EMPTY_LINKEDIN_PROFILE,
  convertResumeToLinkedInProfile,
} from '../../utils/linkedInSampleData';

interface LinkedInFormPanelProps {
  profileData: LinkedInProfileData;
  onChange: (updated: LinkedInProfileData) => void;
  resumes: ResumeItem[];
  isAnalyzing: boolean;
  onRunOptimization: () => void;
}

export const LinkedInFormPanel: React.FC<LinkedInFormPanelProps> = ({
  profileData,
  onChange,
  resumes,
  isAnalyzing,
  onRunOptimization,
}) => {
  const [activeSection, setActiveSection] = useState<
    'personal' | 'headline' | 'about' | 'experience' | 'education' | 'projects' | 'skills' | 'certs'
  >('personal');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [newTechSkill, setNewTechSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Personal Info update
  const updatePersonalInfo = (field: keyof LinkedInProfileData['personalInfo'], value: any) => {
    onChange({
      ...profileData,
      personalInfo: {
        ...profileData.personalInfo,
        [field]: value,
      },
    });
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: LinkedInExperienceItem = {
      id: `exp_${Date.now()}`,
      company: '',
      jobTitle: '',
      startDate: '',
      endDate: 'Present',
      isCurrent: true,
      bullets: [''],
    };
    onChange({
      ...profileData,
      experience: [newExp, ...profileData.experience],
    });
  };

  const handleUpdateExperience = (id: string, field: keyof LinkedInExperienceItem, value: any) => {
    onChange({
      ...profileData,
      experience: profileData.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...profileData,
      experience: profileData.experience.filter((exp) => exp.id !== id),
    });
  };

  const handleUpdateBullet = (expId: string, bulletIdx: number, text: string) => {
    onChange({
      ...profileData,
      experience: profileData.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIdx] = text;
        return { ...exp, bullets: newBullets };
      }),
    });
  };

  const handleAddBullet = (expId: string) => {
    onChange({
      ...profileData,
      experience: profileData.experience.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      ),
    });
  };

  const handleRemoveBullet = (expId: string, bulletIdx: number) => {
    onChange({
      ...profileData,
      experience: profileData.experience.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.filter((_, idx) => idx !== bulletIdx) }
          : exp
      ),
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: LinkedInEducationItem = {
      id: `edu_${Date.now()}`,
      degree: '',
      institution: '',
      graduationYear: '',
      details: '',
    };
    onChange({ ...profileData, education: [...profileData.education, newEdu] });
  };

  const handleUpdateEducation = (id: string, field: keyof LinkedInEducationItem, value: any) => {
    onChange({
      ...profileData,
      education: profileData.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...profileData,
      education: profileData.education.filter((edu) => edu.id !== id),
    });
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj: LinkedInProjectItem = {
      id: `proj_${Date.now()}`,
      title: '',
      tech: '',
      description: '',
      bullets: [''],
    };
    onChange({ ...profileData, projects: [...profileData.projects, newProj] });
  };

  const handleUpdateProject = (id: string, field: keyof LinkedInProjectItem, value: any) => {
    onChange({
      ...profileData,
      projects: profileData.projects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const handleDeleteProject = (id: string) => {
    onChange({
      ...profileData,
      projects: profileData.projects.filter((p) => p.id !== id),
    });
  };

  // Skills handlers
  const handleAddTechSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newTechSkill.trim();
    if (trimmed && !profileData.skills.technical.includes(trimmed)) {
      onChange({
        ...profileData,
        skills: {
          ...profileData.skills,
          technical: [...profileData.skills.technical, trimmed],
        },
      });
      setNewTechSkill('');
    }
  };

  const handleRemoveTechSkill = (skill: string) => {
    onChange({
      ...profileData,
      skills: {
        ...profileData.skills,
        technical: profileData.skills.technical.filter((s) => s !== skill),
      },
    });
  };

  const handleAddSoftSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSoftSkill.trim();
    if (trimmed && !profileData.skills.softAndTools.includes(trimmed)) {
      onChange({
        ...profileData,
        skills: {
          ...profileData.skills,
          softAndTools: [...profileData.skills.softAndTools, trimmed],
        },
      });
      setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (skill: string) => {
    onChange({
      ...profileData,
      skills: {
        ...profileData.skills,
        softAndTools: profileData.skills.softAndTools.filter((s) => s !== skill),
      },
    });
  };

  // Certifications handlers
  const handleAddCertification = () => {
    const newCert: LinkedInCertificationItem = {
      id: `cert_${Date.now()}`,
      name: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
    };
    onChange({ ...profileData, certifications: [...profileData.certifications, newCert] });
  };

  const handleUpdateCertification = (id: string, field: keyof LinkedInCertificationItem, value: any) => {
    onChange({
      ...profileData,
      certifications: profileData.certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    });
  };

  const handleDeleteCertification = (id: string) => {
    onChange({
      ...profileData,
      certifications: profileData.certifications.filter((c) => c.id !== id),
    });
  };

  // Import from existing resume
  const handleImportResume = () => {
    const target = resumes.find((r) => r.id === selectedResumeId);
    if (target) {
      const converted = convertResumeToLinkedInProfile(target);
      onChange(converted);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] shadow-card flex flex-col h-full overflow-hidden">
      {/* Top Banner / Import Actions */}
      <div className="p-4 border-b border-[#E5E1D7] bg-[#FAF8F5] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C201D]">
            <FileText className="w-4 h-4 text-[#1B4332]" />
            <span>Profile Information Form</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange(SAMPLE_EXPERIENCED_LINKEDIN_PROFILE)}
              className="text-[11px] font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-lg border border-[#1B4332]/30 transition-colors cursor-pointer"
            >
              Load Experienced Sample
            </button>
            <button
              onClick={() => onChange(SAMPLE_FRESHER_LINKEDIN_PROFILE)}
              className="text-[11px] font-semibold text-[#57605A] hover:bg-white px-2.5 py-1 rounded-lg border border-[#E5E1D7] transition-colors cursor-pointer"
            >
              Load Fresher Sample
            </button>
            <button
              onClick={() => onChange(EMPTY_LINKEDIN_PROFILE)}
              title="Clear all fields"
              className="p-1 text-[#848E88] hover:text-[#8C2E2E] rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Option B: Import from Resume Architect */}
        {resumes.length > 0 && (
          <div className="pt-2 border-t border-[#E5E1D7]/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#57605A] shrink-0">
              <DownloadCloud className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Import from Resume Architect:</span>
            </div>
            <div className="flex-1 flex gap-2">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="flex-1 text-xs bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 text-[#1C201D] outline-none focus:border-[#1B4332]"
              >
                <option value="">Select a saved resume...</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.targetJobTitle})
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleImportResume}
                disabled={!selectedResumeId}
              >
                Import
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation tabs for form sections */}
      <div className="flex items-center gap-1 p-2 bg-[#FAF8F5] border-b border-[#E5E1D7] overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'personal', label: 'Personal & Role', icon: User },
          { id: 'headline', label: 'Headline', icon: Sparkles },
          { id: 'about', label: 'About', icon: FileText },
          { id: 'experience', label: `Experience (${profileData.experience.length})`, icon: Briefcase },
          { id: 'education', label: `Education (${profileData.education.length})`, icon: GraduationCap },
          { id: 'projects', label: `Projects (${profileData.projects.length})`, icon: Code2 },
          { id: 'skills', label: 'Skills', icon: Award },
          { id: 'certs', label: `Certs (${profileData.certifications.length})`, icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white text-[#1B4332] shadow-xs border border-[#E5E1D7]'
                  : 'text-[#57605A] hover:text-[#1C201D] hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Area */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        {/* SECTION 1: PERSONAL & ROLE */}
        {activeSection === 'personal' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#1C201D]">Personal Information & Target Alignment</h4>
              <p className="text-xs text-[#57605A]">
                Candidate contact details and target positioning for LinkedIn profile indexing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1C201D] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Sarah Lindqvist"
                  className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C201D] mb-1">
                  Current Job Title or Student Status
                </label>
                <input
                  type="text"
                  value={profileData.personalInfo.currentTitleOrStatus}
                  onChange={(e) => updatePersonalInfo('currentTitleOrStatus', e.target.value)}
                  placeholder="e.g. Senior Infrastructure Engineer or CS Student"
                  className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C201D] mb-1">Location</label>
                <input
                  type="text"
                  value={profileData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="e.g. San Francisco Bay Area"
                  className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C201D] mb-1">Target Job Role</label>
                <input
                  type="text"
                  value={profileData.personalInfo.targetRole}
                  onChange={(e) => updatePersonalInfo('targetRole', e.target.value)}
                  placeholder="e.g. Staff Distributed Systems Architect"
                  className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1C201D] mb-1">
                  Target Industry & Domain
                </label>
                <input
                  type="text"
                  value={profileData.personalInfo.targetIndustry}
                  onChange={(e) => updatePersonalInfo('targetIndustry', e.target.value)}
                  placeholder="e.g. Cloud Platforms & High-Concurrency Systems"
                  className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl px-3 py-2 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.personalInfo.openToWork}
                    onChange={(e) => updatePersonalInfo('openToWork', e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#1C201D]">
                    Show "Open to Work" status badge in profile preview
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HEADLINE */}
        {activeSection === 'headline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1C201D]">Current LinkedIn Headline</h4>
                <p className="text-xs text-[#57605A]">
                  Enter your current headline, or leave blank to receive 3 AI-optimized options.
                </p>
              </div>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  profileData.headline.length > 220
                    ? 'bg-red-100 text-red-700'
                    : 'bg-[#FAF8F5] text-[#57605A] border border-[#E5E1D7]'
                }`}
              >
                {profileData.headline.length} / 220 chars
              </span>
            </div>

            <textarea
              rows={3}
              value={profileData.headline}
              onChange={(e) => onChange({ ...profileData, headline: e.target.value })}
              placeholder="e.g. Senior Infrastructure Engineer at Stratos | Cloud Architecture & High-Concurrency Systems"
              className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle resize-none"
            />

            <div className="p-3 bg-[#EBF2EC] rounded-xl border border-[#1B4332]/20 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
              <div className="text-xs text-[#1B4332]">
                <p className="font-semibold">AI Headline Generator ready</p>
                <p className="text-[11px] opacity-90">
                  Clicking "Optimize Profile" generates up to 3 distinct headline styles (Role & Value-Prop, Recruiter Search-Optimized, and Growth-Impact).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ABOUT */}
        {activeSection === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1C201D]">Current About / Summary</h4>
                <p className="text-xs text-[#57605A]">
                  Candidate bio summarizing career achievements, technical philosophy, and interests.
                </p>
              </div>
              <span className="text-xs font-mono text-[#57605A] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5E1D7]">
                {profileData.about.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={6}
              value={profileData.about}
              onChange={(e) => onChange({ ...profileData, about: e.target.value })}
              placeholder="e.g. Systems engineer with 6+ years designing fault-tolerant, high-throughput distributed infrastructure on AWS and Kubernetes..."
              className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle leading-relaxed resize-none"
            />

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs text-[#57605A] space-y-1">
              <span className="font-bold text-[#1C201D]">4 Available About Section Styles:</span>
              <p className="text-[11px]">
                1. Professional & Authoritative • 2. Student & Fresher Friendly • 3. Technical & Developer Focused • 4. Concise & Punchy
              </p>
            </div>
          </div>
        )}

        {/* SECTION 4: EXPERIENCE */}
        {activeSection === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1C201D]">Work Experience History</h4>
                <p className="text-xs text-[#57605A]">
                  Enter genuine roles and responsibilities. The AI optimizer will refine bullets with STAR/XYZ impact formulas.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddExperience}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Role
              </Button>
            </div>

            {profileData.experience.length === 0 ? (
              <div className="p-6 text-center bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs text-[#57605A]">
                No experience entries added yet. Click "Add Role" or import from a saved resume.
              </div>
            ) : (
              <div className="space-y-4">
                {profileData.experience.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D7]">
                      <span className="text-xs font-bold text-[#1B4332]">
                        Role #{expIdx + 1}: {exp.jobTitle || 'Untitled Position'}
                      </span>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-xs text-[#8C2E2E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                          placeholder="e.g. Stratos Cloud Systems"
                          className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => handleUpdateExperience(exp.id, 'jobTitle', e.target.value)}
                          placeholder="e.g. Senior Infrastructure Engineer"
                          className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                          placeholder="e.g. Apr 2022"
                          className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                          placeholder="e.g. Present"
                          className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-[#1C201D]">
                          Responsibilities & Key Accomplishments
                        </label>
                        <button
                          onClick={() => handleAddBullet(exp.id)}
                          className="text-[11px] text-[#1B4332] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      {exp.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-1.5">
                          <span className="text-xs text-[#848E88] mt-2">•</span>
                          <textarea
                            rows={2}
                            value={b}
                            onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                            placeholder="e.g. Orchestrated multi-region Kubernetes cluster federation across 3 AWS cloud regions..."
                            className="flex-1 text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg p-2 outline-none focus:border-[#1B4332] resize-none"
                          />
                          {exp.bullets.length > 1 && (
                            <button
                              onClick={() => handleRemoveBullet(exp.id, bIdx)}
                              className="p-1 text-[#848E88] hover:text-[#8C2E2E] mt-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: EDUCATION */}
        {activeSection === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1C201D]">Education & Academics</h4>
                <p className="text-xs text-[#57605A]">
                  Degrees, universities, graduation years, and academic honors.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddEducation}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Education
              </Button>
            </div>

            <div className="space-y-3">
              {profileData.education.map((edu, idx) => (
                <div key={edu.id} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D7]">
                    <span className="text-xs font-bold text-[#1B4332]">Degree #{idx + 1}</span>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-xs text-[#8C2E2E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Degree & Major</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="e.g. B.S. in Computer Science"
                        className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="e.g. University of California, Berkeley"
                        className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.graduationYear}
                        onChange={(e) => handleUpdateEducation(edu.id, 'graduationYear', e.target.value)}
                        placeholder="e.g. 2020"
                        className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Honors / GPA / Focus</label>
                      <input
                        type="text"
                        value={edu.details}
                        onChange={(e) => handleUpdateEducation(edu.id, 'details', e.target.value)}
                        placeholder="e.g. GPA 3.86/4.00, Dean's List"
                        className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: PROJECTS */}
        {activeSection === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1C201D]">Technical Projects</h4>
                <p className="text-xs text-[#57605A]">
                  Highlight practical deliverables and repositories to demonstrate hands-on software competence.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddProject}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Project
              </Button>
            </div>

            <div className="space-y-3">
              {profileData.projects.map((proj, idx) => (
                <div key={proj.id} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D7]">
                    <span className="text-xs font-bold text-[#1B4332]">Project #{idx + 1}</span>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="text-xs text-[#8C2E2E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Project Name</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                        placeholder="e.g. High-Concurrency Event Ledger"
                        className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Technologies Used</label>
                      <input
                        type="text"
                        value={proj.tech}
                        onChange={(e) => handleUpdateProject(proj.id, 'tech', e.target.value)}
                        placeholder="e.g. Go, Kafka, Redis, PostgreSQL"
                        className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#1C201D] mb-1">Summary Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                        placeholder="Brief overview of problem and solution..."
                        className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg p-2 outline-none focus:border-[#1B4332] resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: SKILLS */}
        {activeSection === 'skills' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#1C201D]">Skills & Keywords</h4>
              <p className="text-xs text-[#57605A]">
                Candidate skills evaluated for recruiter discovery and EvidenceMap verification.
              </p>
            </div>

            {/* Technical Skills */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1C201D]">Technical Skills & Stacks</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl min-h-[48px]">
                {profileData.skills.technical.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#1C201D] border border-[#E5E1D7] rounded-lg text-xs font-semibold"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveTechSkill(s)}
                      className="text-[#848E88] hover:text-[#8C2E2E] cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTechSkill}
                  onChange={(e) => setNewTechSkill(e.target.value)}
                  onKeyDown={handleAddTechSkill}
                  placeholder="Type skill and press Enter (e.g. Go, Kubernetes, TypeScript)..."
                  className="flex-1 text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-lg px-3 py-1.5 outline-none focus:border-[#1B4332] focus:bg-white"
                />
                <Button variant="secondary" size="sm" onClick={handleAddTechSkill}>
                  Add
                </Button>
              </div>
            </div>

            {/* Soft Skills & Practices */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-[#1C201D]">Tools & Engineering Practices</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl min-h-[48px]">
                {profileData.skills.softAndTools.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#1C201D] border border-[#E5E1D7] rounded-lg text-xs font-semibold"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSoftSkill(s)}
                      className="text-[#848E88] hover:text-[#8C2E2E] cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  onKeyDown={handleAddSoftSkill}
                  placeholder="Type practice and press Enter (e.g. System Design, CI/CD, Agile)..."
                  className="flex-1 text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-lg px-3 py-1.5 outline-none focus:border-[#1B4332] focus:bg-white"
                />
                <Button variant="secondary" size="sm" onClick={handleAddSoftSkill}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 8: CERTIFICATIONS */}
        {activeSection === 'certs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1C201D]">Certifications & Licenses</h4>
                <p className="text-xs text-[#57605A]">
                  Accredited cloud certifications and industry credentials.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCertification}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Certification
              </Button>
            </div>

            <div className="space-y-3">
              {profileData.certifications.map((c) => (
                <div key={c.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => handleUpdateCertification(c.id, 'name', e.target.value)}
                      placeholder="Certification name (e.g. AWS Solutions Architect)"
                      className="text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                    />
                    <input
                      type="text"
                      value={c.issuer}
                      onChange={(e) => handleUpdateCertification(c.id, 'issuer', e.target.value)}
                      placeholder="Issuer (e.g. Amazon Web Services)"
                      className="text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                    />
                    <input
                      type="text"
                      value={c.year}
                      onChange={(e) => handleUpdateCertification(c.id, 'year', e.target.value)}
                      placeholder="Year (e.g. 2023)"
                      className="text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteCertification(c.id)}
                    className="p-1.5 text-[#848E88] hover:text-[#8C2E2E] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Run Optimization Action */}
      <div className="p-4 border-t border-[#E5E1D7] bg-[#FAF8F5] flex items-center justify-between">
        <span className="text-xs text-[#57605A]">
          Grounded exclusively in candidate profile facts.
        </span>
        <Button
          variant="primary"
          onClick={onRunOptimization}
          isLoading={isAnalyzing}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          {isAnalyzing ? 'Analyzing Profile...' : 'Optimize LinkedIn Profile'}
        </Button>
      </div>
    </div>
  );
};
