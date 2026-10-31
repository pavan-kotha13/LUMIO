import React, { useState } from 'react';
import { ProjectEntry } from '../../types';
import { Input } from '../common/Input';
import { FolderGit2, Plus, Trash2, Sparkles, Check, Globe } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

interface ProjectsSectionProps {
  projects: ProjectEntry[];
  onChange: (updated: ProjectEntry[]) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, onChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newProj: ProjectEntry = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      projectName: '',
      projectDescription: '',
      technologiesUsed: '',
      projectLink: '',
      keyContributions: '',
      projectOutcome: '',
    };
    onChange([...projects, newProj]);
  };

  const handleRemove = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
  };

  const handleUpdate = (id: string, field: keyof ProjectEntry, value: string) => {
    onChange(
      projects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleImproveContributions = async (proj: ProjectEntry) => {
    if (!proj.keyContributions) return;
    setLoadingId(proj.id);
    try {
      const rewritten = await geminiService.rewriteBullets({
        rawBullets: proj.keyContributions,
        roleTitle: `Project Contributor for ${proj.projectName}`,
        company: proj.technologiesUsed,
      });
      handleUpdate(proj.id, 'keyContributions', rewritten.join('\n'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            E
          </span>
          <h3 className="font-bold text-sm text-[#1C201D]">Technical Projects</h3>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="space-y-6">
        {projects.map((proj, index) => (
          <div
            key={proj.id}
            className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-4 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4" />
                <span>Project #{index + 1}</span>
              </span>

              {projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(proj.id)}
                  className="text-[#848E88] hover:text-[#8C2E2E] p-1 rounded transition-colors cursor-pointer"
                  title="Remove project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Project Name"
                type="text"
                placeholder="e.g. Distributed Event Ledger"
                value={proj.projectName}
                onChange={(e) => handleUpdate(proj.id, 'projectName', e.target.value)}
                required
              />

              <Input
                label="Technologies Used"
                type="text"
                placeholder="e.g. Go, Kafka, Redis, Docker"
                value={proj.technologiesUsed}
                onChange={(e) => handleUpdate(proj.id, 'technologiesUsed', e.target.value)}
                required
              />

              <div className="sm:col-span-2">
                <Input
                  label="Project Link / Repository URL"
                  type="text"
                  placeholder="github.com/username/project"
                  value={proj.projectLink || ''}
                  onChange={(e) => handleUpdate(proj.id, 'projectLink', e.target.value)}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-[#1C201D]">
                  Project Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Concise overview of what this project accomplishes..."
                  value={proj.projectDescription}
                  onChange={(e) => handleUpdate(proj.id, 'projectDescription', e.target.value)}
                  className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] shadow-subtle resize-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1C201D]">
                    Key Contributions & Engineering Highlights
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImproveContributions(proj)}
                    disabled={loadingId === proj.id || !proj.keyContributions}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className="w-3 h-3 text-[#1B4332]" />
                    <span>{loadingId === proj.id ? 'Refining...' : 'Improve Clarity with AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Detail your specific architecture decisions or implementations (one per line)..."
                  value={proj.keyContributions}
                  onChange={(e) => handleUpdate(proj.id, 'keyContributions', e.target.value)}
                  className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-xl p-3 outline-none focus:border-[#1B4332] shadow-subtle resize-none leading-relaxed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-[#1C201D]">
                  Project Outcome (Only if measured / supplied by you)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adopted by 4,000+ developers; processed 25k req/sec with zero drops."
                  value={proj.projectOutcome || ''}
                  onChange={(e) => handleUpdate(proj.id, 'projectOutcome', e.target.value)}
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
