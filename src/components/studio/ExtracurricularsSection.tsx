import React from 'react';
import { ExtracurricularEntry } from '../../types';
import { Input } from '../common/Input';
import { Compass, Plus, Trash2 } from 'lucide-react';

interface ExtracurricularsSectionProps {
  extracurriculars?: ExtracurricularEntry[];
  onChange: (updated: ExtracurricularEntry[]) => void;
}

export const ExtracurricularsSection: React.FC<ExtracurricularsSectionProps> = ({
  extracurriculars = [],
  onChange,
}) => {
  const handleAdd = () => {
    const newEntry: ExtracurricularEntry = {
      id: 'extra_' + Math.random().toString(36).substring(2, 9),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    onChange([...extracurriculars, newEntry]);
  };

  const handleRemove = (id: string) => {
    onChange(extracurriculars.filter((e) => e.id !== id));
  };

  const handleUpdate = (id: string, field: keyof ExtracurricularEntry, value: string) => {
    onChange(
      extracurriculars.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            J
          </span>
          <div>
            <h3 className="font-bold text-sm text-[#1C201D]">Extracurricular Activities & Leadership</h3>
            <p className="text-[11px] text-[#57605A]">
              Clubs, open-source communities, meetup organizing, collegiate governance, or volunteer initiatives.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Activity</span>
        </button>
      </div>

      {extracurriculars.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-[#E5E1D7] rounded-xl bg-[#FAF8F5]">
          <Compass className="w-8 h-8 text-[#A3C4B0] mx-auto mb-2 opacity-60" />
          <p className="text-xs text-[#57605A] font-medium">No extracurricular activities added yet.</p>
          <p className="text-[11px] text-[#848E88] mt-0.5">
            Add open-source contributions, engineering societies, campus leadership, or volunteering.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add an activity</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {extracurriculars.map((item, index) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Activity #{index + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-[#848E88] hover:text-[#8C2E2E] p-1 rounded transition-colors cursor-pointer"
                  title="Remove activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Organization / Society / Club"
                  type="text"
                  placeholder="e.g. CNCF Community Chapter / ACM Student Chapter"
                  value={item.organization}
                  onChange={(e) => handleUpdate(item.id, 'organization', e.target.value)}
                  required
                />

                <Input
                  label="Role / Title"
                  type="text"
                  placeholder="e.g. Lead Organizer / Open Source Maintainer"
                  value={item.role}
                  onChange={(e) => handleUpdate(item.id, 'role', e.target.value)}
                  required
                />

                <Input
                  label="Start Date / Year"
                  type="text"
                  placeholder="e.g. 2021"
                  value={item.startDate || ''}
                  onChange={(e) => handleUpdate(item.id, 'startDate', e.target.value)}
                />

                <Input
                  label="End Date / Year"
                  type="text"
                  placeholder="e.g. Present or 2023"
                  value={item.endDate || ''}
                  onChange={(e) => handleUpdate(item.id, 'endDate', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1C201D]">
                  Impact / Description
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                  placeholder="Organized monthly cloud workshops for 300+ students, managed community budget, and mentored junior contributors."
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
