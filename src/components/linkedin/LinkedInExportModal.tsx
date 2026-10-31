import React, { useState, useEffect } from 'react';
import { LinkedInProfileData, LinkedInSavedDraft } from '../../types/linkedin';
import { linkedInOptimizerService } from '../../services/linkedInOptimizerService';
import { Button } from '../common/Button';
import {
  X,
  Copy,
  Check,
  Save,
  Trash2,
  Share2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface LinkedInExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: LinkedInProfileData;
  score?: number;
  scoreGrade?: string;
  onRestoreDraft: (draft: LinkedInSavedDraft) => void;
}

export const LinkedInExportModal: React.FC<LinkedInExportModalProps> = ({
  isOpen,
  onClose,
  profileData,
  score,
  scoreGrade,
  onRestoreDraft,
}) => {
  const [drafts, setDrafts] = useState<LinkedInSavedDraft[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'copy' | 'drafts'>('copy');

  const loadDrafts = () => {
    setDrafts(linkedInOptimizerService.getSavedDrafts());
  };

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
      setDraftTitle(`${profileData.personalInfo.fullName || 'Candidate'} — ${profileData.personalInfo.targetRole || 'Profile'} (${new Date().toLocaleDateString()})`);
    }
  }, [isOpen, profileData]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveDraft = () => {
    linkedInOptimizerService.saveDraft(draftTitle, profileData, score, scoreGrade);
    loadDrafts();
    setActiveTab('drafts');
  };

  const handleDeleteDraft = (id: string) => {
    linkedInOptimizerService.deleteDraft(id);
    loadDrafts();
  };

  // Build full profile formatted string
  const fullProfileContent = `==================================================
RESUME ARCHITECT — OPTIMISED LINKEDIN PROFILE
==================================================

CANDIDATE: ${profileData.personalInfo.fullName || 'Candidate'}
TARGET ROLE: ${profileData.personalInfo.targetRole || 'Not specified'}
LOCATION: ${profileData.personalInfo.location || 'Not specified'}

--------------------------------------------------
HEADLINE:
--------------------------------------------------
${profileData.headline || 'None provided'}

--------------------------------------------------
ABOUT SUMMARY:
--------------------------------------------------
${profileData.about || 'None provided'}

--------------------------------------------------
EXPERIENCE:
--------------------------------------------------
${profileData.experience
  .map(
    (exp) =>
      `${exp.jobTitle} | ${exp.company} (${exp.startDate} - ${exp.endDate})\n` +
      exp.bullets.map((b) => `• ${b}`).join('\n')
  )
  .join('\n\n')}

--------------------------------------------------
EDUCATION:
--------------------------------------------------
${profileData.education
  .map((edu) => `${edu.degree} — ${edu.institution} (${edu.graduationYear})\n${edu.details}`)
  .join('\n\n')}

--------------------------------------------------
PROJECTS:
--------------------------------------------------
${profileData.projects
  .map(
    (p) =>
      `${p.title} [Tech: ${p.tech}]\n${p.description}\n` +
      p.bullets.map((b) => `• ${b}`).join('\n')
  )
  .join('\n\n')}

--------------------------------------------------
SKILLS & KEYWORDS:
--------------------------------------------------
Technical: ${profileData.skills.technical.join(', ')}
Tools & Practices: ${profileData.skills.softAndTools.join(', ')}

--------------------------------------------------
CERTIFICATIONS:
--------------------------------------------------
${profileData.certifications.map((c) => `${c.name} (${c.issuer}, ${c.year})`).join('\n')}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E5E1D7] shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E1D7] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#1B4332]" />
            <div>
              <h3 className="text-base font-bold text-[#1C201D]">Save & Export LinkedIn Content</h3>
              <p className="text-xs text-[#57605A]">
                Copy verified content to manually update your live LinkedIn profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#57605A] hover:text-[#1C201D] hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Explicit Disclaimer Notice */}
        <div className="px-5 py-3 bg-[#EBF2EC] border-b border-[#1B4332]/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
          <p className="text-xs text-[#1B4332] font-semibold leading-relaxed">
            Resume Architect prepares optimised LinkedIn content. Review and manually apply the approved changes to your LinkedIn profile.
          </p>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#E5E1D7] px-5 bg-[#FAF8F5]">
          <button
            onClick={() => setActiveTab('copy')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'copy'
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            Section-by-Section Copy
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'drafts'
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            Saved Drafts & Revisions ({drafts.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'copy' && (
            <div className="space-y-4">
              {/* Headline */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#1C201D] block">1. Headline</span>
                  <p className="text-xs text-[#57605A] truncate">{profileData.headline || 'No headline set'}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(profileData.headline, 'hl')}
                  leftIcon={copiedKey === 'hl' ? <Check className="w-3.5 h-3.5 text-[#1B4332]" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedKey === 'hl' ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* About Section */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#1C201D] block">2. About Section</span>
                  <p className="text-xs text-[#57605A] truncate">{profileData.about || 'No about section set'}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(profileData.about, 'about')}
                  leftIcon={copiedKey === 'about' ? <Check className="w-3.5 h-3.5 text-[#1B4332]" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedKey === 'about' ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* Experience Bullets */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#1C201D] block">3. Experience Descriptions</span>
                  <p className="text-xs text-[#57605A]">
                    {profileData.experience.length} roles, formatted with action verbs
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      profileData.experience
                        .map(
                          (e) =>
                            `${e.jobTitle} at ${e.company}:\n` +
                            e.bullets.map((b) => `• ${b}`).join('\n')
                        )
                        .join('\n\n'),
                      'exp'
                    )
                  }
                  leftIcon={copiedKey === 'exp' ? <Check className="w-3.5 h-3.5 text-[#1B4332]" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedKey === 'exp' ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* Skills */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#1C201D] block">4. Skills List</span>
                  <p className="text-xs text-[#57605A] truncate">
                    {profileData.skills.technical.join(', ')}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      profileData.skills.technical.join('\n'),
                      'skills'
                    )
                  }
                  leftIcon={copiedKey === 'skills' ? <Check className="w-3.5 h-3.5 text-[#1B4332]" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedKey === 'skills' ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* Save Draft Box */}
              <div className="p-4 bg-white rounded-xl border border-[#E5E1D7] space-y-2 pt-3">
                <label className="block text-xs font-bold text-[#1C201D]">Save Draft Revision</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Draft title..."
                    className="flex-1 text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-lg px-3 py-1.5 outline-none focus:border-[#1B4332]"
                  />
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} leftIcon={<Save className="w-3.5 h-3.5" />}>
                    Save Draft
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="space-y-3">
              {drafts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#57605A] bg-[#FAF8F5] rounded-xl border border-[#E5E1D7]">
                  No saved drafts yet. Save your current revisions from the Section-by-Section tab.
                </div>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#1C201D] block truncate">{d.title}</span>
                      <div className="flex items-center gap-2 text-[11px] text-[#57605A] mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(d.savedAt).toLocaleDateString()} at {new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {d.score && (
                          <span className="font-mono font-semibold text-[#1B4332]">
                            • Score: {d.score}/100
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          onRestoreDraft(d);
                          onClose();
                        }}
                      >
                        Restore
                      </Button>
                      <button
                        onClick={() => handleDeleteDraft(d.id)}
                        className="p-1.5 text-[#848E88] hover:text-[#8C2E2E] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E1D7] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleCopy(fullProfileContent, 'full')}
            leftIcon={copiedKey === 'full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedKey === 'full' ? 'All Content Copied!' : 'Copy All Optimised Content'}
          </Button>
        </div>
      </div>
    </div>
  );
};
