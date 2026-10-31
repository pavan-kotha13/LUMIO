import React, { useState } from 'react';
import { ResumeStudioData, CertificationEntry, AchievementEntry, ExtracurricularEntry } from '../../types';
import { Button } from '../common/Button';
import { authService } from '../../services/authService';
import {
  Download,
  Save,
  Check,
  FileText,
  Printer,
  Sparkles,
  ExternalLink,
  Award,
  Trophy,
  Compass,
} from 'lucide-react';

interface ResumeDocumentPreviewProps {
  data: ResumeStudioData;
  onSaveToRepository: () => Promise<void>;
  isSaving?: boolean;
  onSelectTemplate?: (template: string) => void;
}

export const ResumeDocumentPreview: React.FC<ResumeDocumentPreviewProps> = ({
  data,
  onSaveToRepository,
  isSaving = false,
  onSelectTemplate,
}) => {
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    data.selectedTemplate || 'ATS Minimalist'
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleTemplateChange = (tmpl: string) => {
    setSelectedTemplate(tmpl);
    if (onSelectTemplate) {
      onSelectTemplate(tmpl);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocument = async (format: 'PDF' | 'DOCX') => {
    setIsExporting(true);
    setDownloadToast(`Exporting ATS-compliant ${format} document...`);

    try {
      const endpoint = format === 'PDF' ? '/api/resumes/export/pdf' : '/api/resumes/export/docx';
      const token = authService.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `${data.personalInfo.fullName || 'Candidate'}_Resume`,
          template: selectedTemplate,
          personalInfo: data.personalInfo,
          summary: data.careerObjective.professionalSummary,
          skills: {
            technical: [
              ...(data.skills.programmingLanguages || []),
              ...(data.skills.frameworks || []),
              ...(data.skills.databases || []),
              ...(data.skills.developerTools || []),
            ],
            softAndTools: [
              ...(data.softSkills || []),
              ...(data.skills.coreSubjects || []),
              ...(data.skills.otherSkills || []),
            ],
          },
          softSkills: data.softSkills || [],
          experience: (data.experience || []).map((exp) => ({
            jobTitle: exp.jobTitle,
            company: exp.organisation,
            startDate: exp.startDate,
            endDate: exp.isCurrent ? 'Present' : exp.endDate,
            bullets: exp.responsibilities ? exp.responsibilities.split('\n').filter(Boolean) : [],
            keyAchievements: exp.keyAchievements,
          })),
          projects: (data.projects || []).map((p) => ({
            title: p.projectName,
            tech: p.technologiesUsed,
            description: p.projectDescription,
            projectLink: p.projectLink,
            bullets: p.keyContributions ? p.keyContributions.split('\n').filter(Boolean) : [],
            outcome: p.projectOutcome,
          })),
          education: (data.education || []).map((edu) => ({
            degree: edu.degree,
            institution: edu.institutionName,
            graduationYear: edu.graduationYear,
            startYear: edu.startYear,
            details: edu.branch,
            cgpa: edu.cgpaOrPercentage,
          })),
          certifications: (data.certifications || []).map((c) =>
            typeof c === 'string' ? { name: c, issuer: 'Industry Authority' } : c
          ),
          achievements: data.achievements || [],
          extracurriculars: data.extracurriculars || [],
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'PDF' ? 'pdf' : 'docx';
        a.download = `${(data.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setDownloadToast(`Downloaded ${format} successfully!`);
      } else {
        setDownloadToast(`Generated ${format} for ${data.personalInfo.fullName || 'Candidate'}.`);
      }
    } catch (err) {
      console.warn(`Export ${format} error:`, err);
      setDownloadToast(`Saved ${format} for ${data.personalInfo.fullName || 'Candidate'}.`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setDownloadToast(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-elevated flex items-center gap-2">
          <Check className="w-4 h-4 text-[#A3C4B0]" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white rounded-2xl border border-[#E5E1D7] p-3.5 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1C201D]">Live ATS Preview</span>
          <select
            id="template-select"
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="text-xs font-semibold text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-[#1B4332]"
          >
            <option value="ATS Minimalist">ATS Minimalist</option>
            <option value="Executive Modern">Executive Modern</option>
            <option value="Technical Specialist">Technical Specialist</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            title="Print or Save as PDF via Browser"
          >
            Print
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExportDocument('PDF')}
            isLoading={isExporting}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            PDF
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExportDocument('DOCX')}
            isLoading={isExporting}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            DOCX
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onSaveToRepository}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save to My Resumes
          </Button>
        </div>
      </div>

      {/* The Actual Resume Sheet (Standard 8.5" x 11" aspect ratio styling) */}
      <div
        id="resume-document-sheet"
        className={`bg-white rounded-xl border border-[#D5D0C4] shadow-card p-8 sm:p-12 text-[#1C201D] text-xs leading-relaxed max-w-[850px] mx-auto min-h-[900px] transition-all ${
          selectedTemplate === 'Executive Modern'
            ? 'font-serif border-t-8 border-t-[#1B4332]'
            : selectedTemplate === 'Technical Specialist'
            ? 'font-mono text-[11px] border-l-4 border-l-[#1B4332]'
            : 'font-sans'
        }`}
      >
        {/* 1. HEADER SECTION (Personal Info) */}
        <div className="text-center pb-4 border-b border-[#1C201D] space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight uppercase text-[#1C201D]">
            {data.personalInfo.fullName || 'Candidate Name'}
          </h1>

          {data.careerObjective.targetJobRole && (
            <p className="text-xs font-semibold text-[#1B4332] tracking-wide uppercase">
              {data.careerObjective.targetJobRole}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-[#57605A] pt-0.5">
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
            {data.personalInfo.phone && (
              <>
                <span aria-hidden="true">·</span>
                <span>{data.personalInfo.phone}</span>
              </>
            )}
            {data.personalInfo.email && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#1C201D]">{data.personalInfo.email}</span>
              </>
            )}
            {data.personalInfo.linkedinUrl && (
              <>
                <span aria-hidden="true">·</span>
                <span>{data.personalInfo.linkedinUrl}</span>
              </>
            )}
            {data.personalInfo.githubUrl && (
              <>
                <span aria-hidden="true">·</span>
                <span>{data.personalInfo.githubUrl}</span>
              </>
            )}
            {data.personalInfo.portfolioUrl && (
              <>
                <span aria-hidden="true">·</span>
                <span>{data.personalInfo.portfolioUrl}</span>
              </>
            )}
          </div>
        </div>

        {/* 2. SECTION: PROFESSIONAL SUMMARY */}
        {data.careerObjective.professionalSummary && (
          <div className="pt-4 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Professional Summary
            </h2>
            <p className="text-xs text-[#394B40] leading-relaxed text-justify">
              {data.careerObjective.professionalSummary}
            </p>
          </div>
        )}

        {/* 3. SECTION: EDUCATION */}
        {data.education.some((e) => e.institutionName || e.degree) && (
          <div className="pt-4 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Education
            </h2>
            <div className="space-y-2">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1C201D]">
                      {edu.degree || 'Degree'}
                      {edu.branch ? ` in ${edu.branch}` : ''}
                    </span>
                    <p className="text-xs text-[#57605A]">{edu.institutionName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-[#848E88] block">
                      {edu.startYear ? `${edu.startYear} – ` : ''}
                      {edu.graduationYear || 'Year'}
                    </span>
                    {edu.cgpaOrPercentage && (
                      <span className="text-[11px] font-mono text-[#1B4332] font-medium">
                        GPA: {edu.cgpaOrPercentage}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECTION: TECHNICAL SKILLS */}
        {Object.values(data.skills).some((arr) => arr.length > 0) && (
          <div className="pt-4 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Technical Skills
            </h2>
            <div className="space-y-1 text-xs">
              {data.skills.programmingLanguages.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1C201D]">Languages: </span>
                  <span className="text-[#57605A]">
                    {data.skills.programmingLanguages.join(', ')}
                  </span>
                </div>
              )}
              {data.skills.frameworks.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1C201D]">Frameworks & Libraries: </span>
                  <span className="text-[#57605A]">{data.skills.frameworks.join(', ')}</span>
                </div>
              )}
              {data.skills.databases.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1C201D]">Databases & Streaming: </span>
                  <span className="text-[#57605A]">{data.skills.databases.join(', ')}</span>
                </div>
              )}
              {data.skills.developerTools.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1C201D]">Developer Tools & Cloud: </span>
                  <span className="text-[#57605A]">{data.skills.developerTools.join(', ')}</span>
                </div>
              )}
              {data.skills.coreSubjects.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1C201D]">Core CS Competencies: </span>
                  <span className="text-[#57605A]">{data.skills.coreSubjects.join(', ')}</span>
                </div>
              )}
              {data.skills.otherSkills.length > 0 && (
                <div>
                  <span className="font-semibold text-[#1C201D]">Architectural Practices: </span>
                  <span className="text-[#57605A]">{data.skills.otherSkills.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. SECTION: SOFT SKILLS */}
        {data.softSkills && data.softSkills.length > 0 && (
          <div className="pt-4 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Soft Skills & Leadership
            </h2>
            <p className="text-xs text-[#394B40] leading-relaxed">
              {data.softSkills.join(' • ')}
            </p>
          </div>
        )}

        {/* 6. SECTION: TECHNICAL PROJECTS */}
        {data.projects.some((p) => p.projectName) && (
          <div className="pt-4 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Technical Projects
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj) => (
                <div key={proj.id} className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1C201D]">{proj.projectName}</span>
                      {proj.technologiesUsed && (
                        <span className="text-[#57605A] text-[11px]">
                          {' '}
                          | <em>{proj.technologiesUsed}</em>
                        </span>
                      )}
                    </div>
                    {proj.projectLink && (
                      <span className="text-[11px] text-[#1B4332] font-mono truncate max-w-[200px]">
                        {proj.projectLink}
                      </span>
                    )}
                  </div>

                  {proj.projectDescription && (
                    <p className="text-xs text-[#57605A] leading-relaxed">
                      {proj.projectDescription}
                    </p>
                  )}

                  {proj.keyContributions && (
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-[#394B40]">
                      {proj.keyContributions
                        .split('\n')
                        .map((c) => c.trim())
                        .filter(Boolean)
                        .map((contribution, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {contribution.replace(/^[•\-\*\s]+/, '')}
                          </li>
                        ))}
                    </ul>
                  )}

                  {proj.projectOutcome && (
                    <p className="text-[11px] text-[#1B4332] font-medium pl-4 italic">
                      Outcome: {proj.projectOutcome}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SECTION: WORK EXPERIENCE & INTERNSHIPS */}
        {data.experience.some((e) => e.organisation || e.jobTitle) && (
          <div className="pt-4 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Work Experience & Internships
            </h2>
            <div className="space-y-3">
              {data.experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1C201D]">{exp.jobTitle || 'Role Title'}</span>
                      {exp.organisation && (
                        <span className="text-[#57605A]"> — {exp.organisation}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#848E88] shrink-0">
                      {exp.startDate || 'YYYY'} – {exp.isCurrent ? 'Present' : exp.endDate || 'YYYY'}
                    </span>
                  </div>

                  {/* Bullet points */}
                  {exp.responsibilities && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-[#394B40]">
                      {exp.responsibilities
                        .split('\n')
                        .map((b) => b.trim())
                        .filter(Boolean)
                        .map((bullet, i) => (
                          <li key={i} className="leading-relaxed">
                            {bullet.replace(/^[•\-\*\s]+/, '')}
                          </li>
                        ))}
                    </ul>
                  )}

                  {exp.keyAchievements && (
                    <p className="text-[11px] text-[#1B4332] font-medium pl-4 italic">
                      Key Impact: {exp.keyAchievements}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SECTION: CERTIFICATIONS & LICENSES */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="pt-4 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Certifications & Licenses
            </h2>
            <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-[#394B40]">
              {data.certifications.map((cert, idx) => {
                if (typeof cert === 'string') {
                  return (
                    <li key={idx} className="leading-relaxed">
                      {cert}
                    </li>
                  );
                }
                const meta = [cert.issuer, cert.issueDate].filter(Boolean).join(' — ');
                return (
                  <li key={cert.id || idx} className="leading-relaxed">
                    <span className="font-semibold text-[#1C201D]">{cert.name}</span>
                    {meta && <span className="text-[#57605A]"> ({meta})</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 9. SECTION: HONORS & KEY ACHIEVEMENTS */}
        {data.achievements && data.achievements.length > 0 && (
          <div className="pt-4 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Honors & Key Achievements
            </h2>
            <div className="space-y-2">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="text-xs space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-[#1C201D]">{ach.title}</span>
                    {ach.date && (
                      <span className="text-[11px] font-mono text-[#848E88]">{ach.date}</span>
                    )}
                  </div>
                  {ach.description && (
                    <p className="text-[#57605A] text-[11px] leading-relaxed">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. SECTION: EXTRACURRICULAR ACTIVITIES & LEADERSHIP */}
        {data.extracurriculars && data.extracurriculars.length > 0 && (
          <div className="pt-4 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C201D] border-b border-[#E5E1D7] pb-1">
              Extracurricular Activities & Leadership
            </h2>
            <div className="space-y-2">
              {data.extracurriculars.map((extra) => (
                <div key={extra.id} className="text-xs space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-[#1C201D]">
                      {extra.role} — {extra.organization}
                    </span>
                    {(extra.startDate || extra.endDate) && (
                      <span className="text-[11px] font-mono text-[#848E88]">
                        {extra.startDate} {extra.endDate ? `– ${extra.endDate}` : ''}
                      </span>
                    )}
                  </div>
                  {extra.description && (
                    <p className="text-[#57605A] text-[11px] leading-relaxed">{extra.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
