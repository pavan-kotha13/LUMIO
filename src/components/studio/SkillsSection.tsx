import React, { useState } from 'react';
import { SkillCategoryGroup } from '../../types';
import { Code, Sparkles, X, Plus, Check } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

interface SkillsSectionProps {
  skills: SkillCategoryGroup;
  targetRole: string;
  onChange: (updated: SkillCategoryGroup) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  targetRole,
  onChange,
}) => {
  const [newSkillInput, setNewSkillInput] = useState<Record<string, string>>({});
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommended, setRecommended] = useState<string[]>([]);

  const categories: { key: keyof SkillCategoryGroup; label: string }[] = [
    { key: 'programmingLanguages', label: 'Programming Languages' },
    { key: 'frameworks', label: 'Frameworks & Libraries' },
    { key: 'databases', label: 'Databases & Message Brokers' },
    { key: 'developerTools', label: 'Developer Tools & Cloud' },
    { key: 'coreSubjects', label: 'Core Computer Science Subjects' },
    { key: 'otherSkills', label: 'Other Skills & Competencies' },
  ];

  const handleAddSkill = (catKey: keyof SkillCategoryGroup, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (skills[catKey].includes(trimmed)) return;

    onChange({
      ...skills,
      [catKey]: [...skills[catKey], trimmed],
    });

    setNewSkillInput({ ...newSkillInput, [catKey]: '' });
  };

  const handleRemoveSkill = (catKey: keyof SkillCategoryGroup, skillName: string) => {
    onChange({
      ...skills,
      [catKey]: skills[catKey].filter((s) => s !== skillName),
    });
  };

  const handleRecommendKeywords = async () => {
    setIsRecommending(true);
    try {
      const allCurrent = Object.values(skills).flat();
      const recs = await geminiService.recommendSkills({
        targetRole: targetRole || 'Software Engineer',
        currentSkills: allCurrent,
      });
      setRecommended(recs);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleAddRecommended = (recSkill: string) => {
    // Add to developerTools or otherSkills by default
    handleAddSkill('developerTools', recSkill);
    setRecommended(recommended.filter((s) => s !== recSkill));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            D
          </span>
          <div>
            <h3 className="font-bold text-sm text-[#1C201D]">Technical Skills</h3>
            <p className="text-[11px] text-[#57605A]">
              Grouped for ATS semantic parsing and recruiter review.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRecommendKeywords}
          disabled={isRecommending}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-3 py-1.5 rounded-lg border border-[#D5E3DA] transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#1B4332]" />
          <span>{isRecommending ? 'Analyzing Role...' : 'Recommend Relevant Keywords'}</span>
        </button>
      </div>

      {/* AI Recommendation Banner */}
      {recommended.length > 0 && (
        <div className="p-4 rounded-xl bg-[#FAFDFB] border border-[#C8DFCF] space-y-2">
          <span className="text-xs font-semibold text-[#1B4332] block">
            Gemini Recommended Industry Keywords for "{targetRole || 'Your Role'}":
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommended.map((rec, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAddRecommended(rec)}
                className="text-xs bg-white text-[#1C201D] border border-[#D5E3DA] hover:border-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title="Click to add to skills"
              >
                <Plus className="w-3 h-3 text-[#1B4332]" />
                <span>{rec}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map(({ key, label }) => {
          const list = skills[key] || [];
          const inputValue = newSkillInput[key] || '';

          return (
            <div
              key={key}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-3 flex flex-col justify-between"
            >
              <div>
                <label className="block text-xs font-bold text-[#1C201D] mb-2">{label}</label>

                {/* Skills tags list */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {list.length === 0 ? (
                    <span className="text-xs text-[#848E88] italic">No skills added yet.</span>
                  ) : (
                    list.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white border border-[#E5E1D7] text-[#1C201D] text-xs px-2.5 py-1 rounded-md shadow-subtle"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(key, skill)}
                          className="text-[#848E88] hover:text-[#8C2E2E] cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Add skill input */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-[#EAE6DC]">
                <input
                  type="text"
                  placeholder={`Add ${label.toLowerCase()}...`}
                  value={inputValue}
                  onChange={(e) =>
                    setNewSkillInput({ ...newSkillInput, [key]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(key, inputValue);
                    }
                  }}
                  className="flex-1 text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1B4332]"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(key, inputValue)}
                  className="text-xs font-semibold text-[#1B4332] bg-white border border-[#D5E3DA] hover:bg-[#EBF2EC] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
