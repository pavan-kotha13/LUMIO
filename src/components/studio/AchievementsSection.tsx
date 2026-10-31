import React from 'react';
import { AchievementEntry } from '../../types';
import { Input } from '../common/Input';
import { Trophy, Plus, Trash2 } from 'lucide-react';

interface AchievementsSectionProps {
  achievements?: AchievementEntry[];
  onChange: (updated: AchievementEntry[]) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements = [],
  onChange,
}) => {
  const handleAdd = () => {
    const newEntry: AchievementEntry = {
      id: 'ach_' + Math.random().toString(36).substring(2, 9),
      title: '',
      date: '',
      description: '',
    };
    onChange([...achievements, newEntry]);
  };

  const handleRemove = (id: string) => {
    onChange(achievements.filter((a) => a.id !== id));
  };

  const handleUpdate = (id: string, field: keyof AchievementEntry, value: string) => {
    onChange(
      achievements.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            I
          </span>
          <div>
            <h3 className="font-bold text-sm text-[#1C201D]">Key Honors & Achievements</h3>
            <p className="text-[11px] text-[#57605A]">
              Distinctions, hackathon wins, awards, publications, and standout milestones.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Achievement</span>
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-[#E5E1D7] rounded-xl bg-[#FAF8F5]">
          <Trophy className="w-8 h-8 text-[#A3C4B0] mx-auto mb-2 opacity-60" />
          <p className="text-xs text-[#57605A] font-medium">No key achievements added yet.</p>
          <p className="text-[11px] text-[#848E88] mt-0.5">
            Highlight major corporate recognitions, competitive programming rankings, or awards.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add an achievement</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((item, index) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Achievement #{index + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-[#848E88] hover:text-[#8C2E2E] p-1 rounded transition-colors cursor-pointer"
                  title="Remove achievement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Achievement Title / Honor"
                    type="text"
                    placeholder="e.g. 1st Place — National Cloud Architecture Hackathon"
                    value={item.title}
                    onChange={(e) => handleUpdate(item.id, 'title', e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Date / Year"
                  type="text"
                  placeholder="e.g. 2023 or Nov 2023"
                  value={item.date || ''}
                  onChange={(e) => handleUpdate(item.id, 'date', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1C201D]">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                  placeholder="Selected out of 250+ engineering teams for architecting a low-latency event ledger with zero failover loss."
                  className="w-full text-xs p-3 rounded-xl border border-[#E5E1D7] bg-white text-[#1C201D] focus:border-[#1B4332] outline-none transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
