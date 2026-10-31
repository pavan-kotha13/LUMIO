import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Briefcase, Building, Sparkles, Check, AlertCircle } from 'lucide-react';
import { ResumeStudioData } from '../../types';
import { geminiService } from '../../services/geminiService';

interface CareerObjectiveSectionProps {
  data: ResumeStudioData['careerObjective'];
  allData: ResumeStudioData;
  onChange: (updated: ResumeStudioData['careerObjective']) => void;
}

export const CareerObjectiveSection: React.FC<CareerObjectiveSectionProps> = ({
  data,
  allData,
  onChange,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setAiNote(null);
    try {
      // Gather only user-supplied skills & past experience
      const allSkills = [
        ...allData.skills.programmingLanguages,
        ...allData.skills.frameworks,
        ...allData.skills.databases,
        ...allData.skills.developerTools,
      ];
      const pastExpSummary = allData.experience
        .map((e) => `${e.jobTitle} at ${e.organisation}: ${e.responsibilities}`)
        .join('; ');

      const summary = await geminiService.generateSummary({
        targetRole: data.targetJobRole || 'Candidate Role',
        targetIndustry: data.targetIndustry || 'Technology',
        skills: allSkills,
        experience: pastExpSummary,
        userNotes: data.professionalSummary,
      });

      onChange({
        ...data,
        professionalSummary: summary,
      });
      setAiNote('Summary generated strictly from your supplied qualifications.');
      setTimeout(() => setAiNote(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            B
          </span>
          <h3 className="font-bold text-sm text-[#1C201D]">Career Objective & Professional Summary</h3>
        </div>
        <span className="text-[11px] text-[#848E88]">ATS Target Alignment</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Target Job Role"
          type="text"
          placeholder="e.g. Senior Cloud Systems Architect"
          value={data.targetJobRole}
          onChange={(e) => onChange({ ...data, targetJobRole: e.target.value })}
          leftIcon={<Briefcase className="w-4 h-4" />}
          required
        />

        <Input
          label="Target Industry / Domain"
          type="text"
          placeholder="e.g. Enterprise Cloud & High-Concurrency Systems"
          value={data.targetIndustry}
          onChange={(e) => onChange({ ...data, targetIndustry: e.target.value })}
          leftIcon={<Building className="w-4 h-4" />}
        />
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#1C201D]">
            Professional Summary (Optional)
          </label>
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate with Gemini AI'}</span>
          </button>
        </div>

        <textarea
          rows={3}
          placeholder="Summarize your technical core competencies and career trajectory, or click 'Generate with Gemini AI' using your supplied background..."
          value={data.professionalSummary}
          onChange={(e) => onChange({ ...data, professionalSummary: e.target.value })}
          className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle resize-none leading-relaxed"
        />

        {aiNote && (
          <p className="text-[11px] text-[#1B4332] font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>{aiNote}</span>
          </p>
        )}
      </div>
    </div>
  );
};
