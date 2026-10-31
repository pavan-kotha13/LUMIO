import React, { useState } from 'react';
import { ExperienceEntry } from '../../types';
import { Input } from '../common/Input';
import { Building2, Plus, Trash2, Sparkles } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

interface ExperienceSectionProps {
  experience: ExperienceEntry[];
  onChange: (updated: ExperienceEntry[]) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experience,
  onChange,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newExp: ExperienceEntry = {
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      organisation: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      responsibilities: '',
      keyAchievements: '',
    };
    onChange([...experience, newExp]);
  };

  const handleRemove = (id: string) => {
    onChange(experience.filter((e) => e.id !== id));
  };

  const handleUpdate = (id: string, field: keyof ExperienceEntry, value: any) => {
    onChange(
      experience.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleRewriteBullets = async (exp: ExperienceEntry) => {
    if (!exp.responsibilities) return;
    setLoadingId(exp.id);
    try {
      const rewritten = await geminiService.rewriteBullets({
        rawBullets: exp.responsibilities,
        roleTitle: exp.jobTitle,
        company: exp.organisation,
      });
      handleUpdate(exp.id, 'responsibilities', rewritten.join('\n'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            F
          </span>
          <h3 className="font-bold text-sm text-[#1C201D]">Work Experience</h3>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      <div className="space-y-6">
        {experience.map((exp, index) => (
          <div
            key={exp.id}
            className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-4 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Work Experience #{index + 1}</span>
              </span>

              {experience.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(exp.id)}
                  className="text-[#848E88] hover:text-[#8C2E2E] p-1 rounded transition-colors cursor-pointer"
                  title="Remove experience entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company / Organisation"
                type="text"
                placeholder="e.g. Stratos Cloud Systems"
                value={exp.organisation}
                onChange={(e) => handleUpdate(exp.id, 'organisation', e.target.value)}
                required
              />

              <Input
                label="Job Title / Role"
                type="text"
                placeholder="e.g. Senior Infrastructure Engineer"
                value={exp.jobTitle}
                onChange={(e) => handleUpdate(exp.id, 'jobTitle', e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Start Date"
                  type="text"
                  placeholder="YYYY-MM (e.g. 2022-04)"
                  value={exp.startDate}
                  onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="text"
                  placeholder={exp.isCurrent ? 'Present' : 'YYYY-MM'}
                  value={exp.isCurrent ? 'Present' : exp.endDate}
                  disabled={exp.isCurrent}
                  onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                />
              </div>

              <div className="flex items-center self-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#57605A] select-none">
                  <input
                    type="checkbox"
                    checked={exp.isCurrent || false}
                    onChange={(e) => {
                      const isCurr = e.target.checked;
                      handleUpdate(exp.id, 'isCurrent', isCurr);
                      if (isCurr) handleUpdate(exp.id, 'endDate', 'Present');
                    }}
                    className="rounded border-[#E5E1D7] text-[#1B4332] focus:ring-[#1B4332] w-4 h-4"
                  />
                  <span>Currently working in this position</span>
                </label>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1C201D]">
                    Core Responsibilities & Bullet Points
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRewriteBullets(exp)}
                    disabled={loadingId === exp.id || !exp.responsibilities}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className="w-3 h-3 text-[#1B4332]" />
                    <span>
                      {loadingId === exp.id ? 'Rewriting with AI...' : 'Rewrite Bullets Professionally'}
                    </span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Enter your key tasks and responsibilities (one per line)..."
                  value={exp.responsibilities}
                  onChange={(e) => handleUpdate(exp.id, 'responsibilities', e.target.value)}
                  className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] shadow-subtle resize-none leading-relaxed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-[#1C201D]">
                  Key Achievements / Measurable Outcomes (If any)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reduced p99 API latency from 142ms to 12ms and sustained zero unplanned downtime."
                  value={exp.keyAchievements || ''}
                  onChange={(e) => handleUpdate(exp.id, 'keyAchievements', e.target.value)}
                  className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B4332] shadow-subtle"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
