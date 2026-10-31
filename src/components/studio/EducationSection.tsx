import React from 'react';
import { EducationEntry } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

interface EducationSectionProps {
  entries: EducationEntry[];
  onChange: (updated: EducationEntry[]) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ entries, onChange }) => {
  const handleAdd = () => {
    const newEntry: EducationEntry = {
      id: 'edu_' + Math.random().toString(36).substring(2, 9),
      institutionName: '',
      degree: '',
      branch: '',
      startYear: '',
      graduationYear: '',
      cgpaOrPercentage: '',
    };
    onChange([...entries, newEntry]);
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  const handleUpdate = (id: string, field: keyof EducationEntry, value: string) => {
    onChange(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            C
          </span>
          <h3 className="font-bold text-sm text-[#1C201D]">Education</h3>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </button>
      </div>

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-4 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Education Entry #{index + 1}</span>
              </span>

              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(entry.id)}
                  className="text-[#848E88] hover:text-[#8C2E2E] p-1 rounded transition-colors cursor-pointer"
                  title="Remove education entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Institution / University Name"
                  type="text"
                  placeholder="e.g. University of California, Berkeley"
                  value={entry.institutionName}
                  onChange={(e) => handleUpdate(entry.id, 'institutionName', e.target.value)}
                  required
                />
              </div>

              <Input
                label="Degree"
                type="text"
                placeholder="e.g. Bachelor of Science (B.S.)"
                value={entry.degree}
                onChange={(e) => handleUpdate(entry.id, 'degree', e.target.value)}
                required
              />

              <Input
                label="Branch / Specialisation"
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={entry.branch}
                onChange={(e) => handleUpdate(entry.id, 'branch', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Start Year"
                  type="text"
                  placeholder="2016"
                  value={entry.startYear}
                  onChange={(e) => handleUpdate(entry.id, 'startYear', e.target.value)}
                />
                <Input
                  label="Graduation Year"
                  type="text"
                  placeholder="2020"
                  value={entry.graduationYear}
                  onChange={(e) => handleUpdate(entry.id, 'graduationYear', e.target.value)}
                />
              </div>

              <Input
                label="CGPA / Percentage"
                type="text"
                placeholder="e.g. 3.86 / 4.00 or 88%"
                value={entry.cgpaOrPercentage}
                onChange={(e) => handleUpdate(entry.id, 'cgpaOrPercentage', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
