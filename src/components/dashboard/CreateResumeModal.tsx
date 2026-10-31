import React, { useState } from 'react';
import { ResumeItem } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { X, FilePlus, Sparkles, Check } from 'lucide-react';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<ResumeItem>) => Promise<void>;
}

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [format, setFormat] = useState<ResumeItem['format']>('ATS Minimalist');
  const [tagsInput, setTagsInput] = useState('Go, Kubernetes, Cloud Architecture');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetJobTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onCreate({
        title: title.trim(),
        targetJobTitle: targetJobTitle.trim(),
        targetCompany: targetCompany.trim(),
        format,
        tags,
        score: 75,
        scoreGrade: 'Strong',
        summarySnippet: `Executive candidate dossier targeted specifically for ${targetJobTitle.trim()}${
          targetCompany ? ` at ${targetCompany.trim()}` : ''
        }.`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#E5E1D7] max-w-xl w-full p-6 sm:p-8 shadow-elevated space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#1C201D] flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-[#1B4332]" />
              <span>Create New Tailored Resume</span>
            </h3>
            <p className="text-xs text-[#57605A]">
              Configure your document format and target role to begin drafting.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Resume Document Title"
            type="text"
            placeholder="e.g. Staff Distributed Systems Architect — v1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Role Title"
              type="text"
              placeholder="e.g. Staff Systems Engineer"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              required
            />
            <Input
              label="Target Company (Optional)"
              type="text"
              placeholder="e.g. Stripe, Datadog"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C201D]">
              Resume Layout Architecture
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                ['ATS Minimalist', 'Executive Modern', 'Technical Specialist'] as ResumeItem['format'][]
              ).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    format === f
                      ? 'border-[#1B4332] bg-[#EBF2EC] text-[#1B4332] font-semibold'
                      : 'border-[#E5E1D7] bg-white text-[#57605A] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="text-xs block leading-tight">{f}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Key Competency Tags (Comma Separated)"
            type="text"
            placeholder="Go, Kubernetes, Distributed Systems, SLA"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F0ECE1]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Create Resume Draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
