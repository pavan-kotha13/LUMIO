import React, { useState } from 'react';
import { Users, Plus, X, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface SoftSkillsSectionProps {
  softSkills?: string[];
  onChange: (updated: string[]) => void;
}

const COMMON_SOFT_SKILLS = [
  'Cross-Functional Collaboration',
  'Technical Mentorship',
  'System Architecture Governance',
  'Root-Cause Analysis',
  'Agile / Scrum Leadership',
  'Stakeholder Communication',
  'Incident Response & Post-Mortems',
  'Strategic Technical Planning',
];

export const SoftSkillsSection: React.FC<SoftSkillsSectionProps> = ({
  softSkills = [],
  onChange,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = (skillToAdd?: string) => {
    const val = (skillToAdd || inputVal).trim();
    if (!val) return;
    if (softSkills.includes(val)) return;
    onChange([...softSkills, val]);
    if (!skillToAdd) {
      setInputVal('');
    }
  };

  const handleRemove = (skill: string) => {
    onChange(softSkills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const unselectedSuggestions = COMMON_SOFT_SKILLS.filter(
    (s) => !softSkills.includes(s)
  ).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            E
          </span>
          <div>
            <h3 className="font-bold text-sm text-[#1C201D]">Soft Skills & Leadership</h3>
            <p className="text-[11px] text-[#57605A]">
              Interpersonal, management, and collaborative competencies.
            </p>
          </div>
        </div>
        <span className="text-[11px] text-[#848E88]">{softSkills.length} Added</span>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Cross-Functional Leadership, Technical Mentorship"
          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E1D7] bg-[#FAF8F5] text-[#1C201D] focus:bg-white focus:border-[#1B4332] outline-none transition-colors"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleAdd()}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add
        </Button>
      </div>

      {/* Suggested Quick Adds */}
      {unselectedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#848E88] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#1B4332]" />
            <span>Quick add:</span>
          </span>
          {unselectedSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAdd(suggestion)}
              className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#57605A] border border-[#E5E1D7] hover:border-[#1B4332] hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Active Soft Skills Badges */}
      {softSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {softSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF2EC] text-[#1B4332] text-xs font-medium border border-[#D1E3D6]"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemove(skill)}
                className="hover:text-red-600 transition-colors cursor-pointer"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#848E88] italic pt-1">
          No soft skills added yet. Add relevant communication, leadership, or architectural soft skills above.
        </p>
      )}
    </div>
  );
};
