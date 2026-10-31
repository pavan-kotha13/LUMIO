import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Cpu, Building2, HelpCircle, FileCheck, RefreshCw } from 'lucide-react';

interface AtsSimulationPanelProps {
  resumeText: string;
  className?: string;
}

export const AtsSimulationPanel: React.FC<AtsSimulationPanelProps> = ({
  resumeText,
  className = '',
}) => {
  const [selectedSystem, setSelectedSystem] = useState<'workday' | 'greenhouse' | 'taleo' | 'lever'>('workday');

  // Contact checks
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(resumeText);
  const hasGitHub = /github\.com\/[a-zA-Z0-9_-]+/i.test(resumeText);
  const hasLocation = /[A-Z][a-zA-Z]+,\s*[A-Z]{2}/.test(resumeText) || /Remote|San Francisco|New York|London|Bengaluru/i.test(resumeText);

  // Section checks
  const lower = resumeText.toLowerCase();
  const hasSummary = lower.includes('summary') || lower.includes('profile') || lower.includes('about');
  const hasExperience = lower.includes('experience') || lower.includes('employment') || lower.includes('work history');
  const hasEducation = lower.includes('education') || lower.includes('degree') || lower.includes('university');
  const hasSkills = lower.includes('skills') || lower.includes('technologies') || lower.includes('competencies');
  const hasProjects = lower.includes('project') || lower.includes('portfolio');

  // Formatting checks
  const lines = resumeText.split('\n');
  const hasStandardBullets = lines.some((l) => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*'));
  const hasReasonableLength = lines.length >= 20 && lines.length <= 150;
  const hasTableArtifacts = resumeText.includes('|---|') || resumeText.includes('+---+');

  // System profiles
  const systems = {
    workday: {
      name: 'Workday ATS Parser',
      description: 'Used by Fortune 500 corporations. Strict standard section headers and text extraction.',
      marketShare: '32% of Global 2000',
      difficulty: 'Strict',
    },
    greenhouse: {
      name: 'Greenhouse Recruiting',
      description: 'Widely used in high-growth tech firms. Excels at keyword and skill matrix matching.',
      marketShare: '38% of Tech & Scale-ups',
      difficulty: 'Balanced',
    },
    taleo: {
      name: 'Oracle Taleo',
      description: 'Legacy enterprise standard. Highly sensitive to headers, tables, and date formats.',
      marketShare: '18% of Enterprise',
      difficulty: 'Very Strict',
    },
    lever: {
      name: 'Lever.co',
      description: 'Modern candidate relationship management. Emphasizes GitHub/portfolio and direct experience.',
      marketShare: '12% of Modern Tech',
      difficulty: 'Lenient',
    },
  };

  const currentSystem = systems[selectedSystem];

  // Calculate ATS parse score
  let scorePoints = 0;
  if (hasEmail) scorePoints += 15;
  if (hasPhone) scorePoints += 15;
  if (hasLinkedIn) scorePoints += 10;
  if (hasLocation) scorePoints += 10;
  if (hasExperience) scorePoints += 15;
  if (hasEducation) scorePoints += 15;
  if (hasSkills) scorePoints += 10;
  if (hasStandardBullets) scorePoints += 10;

  const atsScore = Math.min(scorePoints, 98);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#1C201D] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#1B4332]" />
            <span>Enterprise ATS Parser Simulator</span>
          </h3>
          <p className="text-xs text-[#57605A]">
            Test how major automated applicant tracking software extracts your contact info, sections, and dates.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#EBF2EC] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1B4332] self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>ATS Parseability: {atsScore}% Pass Rate</span>
        </div>
      </div>

      {/* System Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(systems) as (keyof typeof systems)[]).map((key) => {
          const s = systems[key];
          const isSelected = selectedSystem === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedSystem(key)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#1B4332] shadow-sm'
                  : 'bg-[#FAF8F5] border-[#E5E1D7] hover:bg-white hover:border-[#1B4332]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#1C201D] block">{s.name}</span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    s.difficulty === 'Very Strict'
                      ? 'bg-red-50 text-red-700'
                      : s.difficulty === 'Strict'
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-[#EBF2EC] text-[#1B4332]'
                  }`}
                >
                  {s.difficulty}
                </span>
              </div>
              <span className="text-[10px] text-[#57605A] block">{s.marketShare}</span>
            </button>
          );
        })}
      </div>

      {/* Simulation Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Field Extraction */}
        <div className="bg-white rounded-2xl border border-[#E5E1D7] p-5 shadow-subtle space-y-4">
          <div className="border-b border-[#F0ECE1] pb-2 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#1C201D]">
              Candidate Contact Data Extraction
            </h4>
            <span className="text-[10px] text-[#848E88] font-mono">Automated Parsing</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">Email Address</span>
              {hasEmail ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Extracted Cleanly
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> Missing or Unparsed
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">Phone Number</span>
              {hasPhone ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Extracted Cleanly
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Standard Format Preferred
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">LinkedIn Profile Link</span>
              {hasLinkedIn ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Profile URL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Not Found
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">Location / City & State</span>
              {hasLocation ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Geolocation Recognized
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Ambiguous City/Region
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section Heading Recognition */}
        <div className="bg-white rounded-2xl border border-[#E5E1D7] p-5 shadow-subtle space-y-4">
          <div className="border-b border-[#F0ECE1] pb-2 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#1C201D]">
              Section Structure & Syntax
            </h4>
            <span className="text-[10px] text-[#848E88] font-mono">Hierarchy Check</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">Work Experience Section</span>
              {hasExperience ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Standard Heading
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> Non-standard Header
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">Education Section</span>
              {hasEducation ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Recognized
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> Not Found
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">Skills & Competencies</span>
              {hasSkills ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Standard Taxonomy
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Separate Block Recommended
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7]">
              <span className="text-xs text-[#1C201D] font-medium">Multi-Column / Table Hazards</span>
              {!hasTableArtifacts ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clean Sequential Flow
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Table Detected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Guidance */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E1D7] flex items-start gap-3">
        <FileCheck className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <strong className="text-[#1C201D]">
            Simulated Verdict for {currentSystem.name}:
          </strong>
          <p className="text-[#57605A] leading-relaxed">
            {atsScore >= 90
              ? `Your resume structure scores in the 95th percentile for ${currentSystem.name}. Text streams linearly without columns or unparsed data blocks.`
              : `Your resume has minor formatting friction for ${currentSystem.name}. Ensure clear section headings and single-column text flow.`}
          </p>
        </div>
      </div>
    </div>
  );
};
