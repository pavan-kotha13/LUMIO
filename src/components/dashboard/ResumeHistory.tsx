import React, { useState, useMemo } from 'react';
import { ResumeItem } from '../../types';
import { Button } from '../common/Button';
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  FileText,
  Copy,
  Trash2,
  Download,
  Gauge,
  Edit3,
  Building2,
  Clock,
  Layers,
  LayoutGrid,
  List,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ResumeHistoryProps {
  resumes: ResumeItem[];
  onSelectResumeToReview: (resume: ResumeItem) => void;
  onSelectResumeToEdit: (resume: ResumeItem) => void;
  onDuplicateResume: (id: string) => Promise<void>;
  onDeleteResume: (id: string) => Promise<void>;
  onCreateNewClick: () => void;
}

export const ResumeHistory: React.FC<ResumeHistoryProps> = ({
  resumes,
  onSelectResumeToReview,
  onSelectResumeToEdit,
  onDuplicateResume,
  onDeleteResume,
  onCreateNewClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'score' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [downloadModalResume, setDownloadModalResume] = useState<ResumeItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Filter & Sort logic
  const filteredResumes = useMemo(() => {
    return resumes
      .filter((r) => {
        const matchesQuery =
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.targetJobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.targetCompany && r.targetCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
          r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFormat =
          selectedFormat === 'all' || r.format.toLowerCase() === selectedFormat.toLowerCase();

        return matchesQuery && matchesFormat;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return (b.score || 0) - (a.score || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [resumes, searchQuery, selectedFormat, sortBy]);

  const handleDownload = (resume: ResumeItem, formatType: 'PDF' | 'DOCX') => {
    setDownloadModalResume(null);
    setDownloadToast(`Preparing ${formatType} export for "${resume.title}"...`);
    setTimeout(() => {
      setDownloadToast(`Successfully downloaded ${formatType} for "${resume.title}".`);
      setTimeout(() => setDownloadToast(null), 3500);
    }, 800);
  };

  const getScoreBadgeClass = (score: number = 0) => {
    if (score >= 85) return 'bg-[#EBF2EC] text-[#1B4332] border-[#C8DFCF]';
    if (score >= 75) return 'bg-[#EBF2EC] text-[#2D6A4F] border-[#D5E3DA]';
    if (score >= 65) return 'bg-[#FDF6EA] text-[#8C5D1E] border-[#EEDBBA]';
    return 'bg-[#FDF0F0] text-[#9E3838] border-[#E8C2C2]';
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-elevated flex items-center gap-2">
          <Check className="w-4 h-4 text-[#A3C4B0]" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Top Header & Metrics Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C201D]">
            Resume History & Repository
          </h2>
          <p className="text-xs text-[#57605A]">
            Manage, review, compare scores, and export your tailored career dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNewClick}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Create New Resume
          </Button>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E1D7] p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#848E88] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, role, company, or skill tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-[#1C201D] bg-[#FAF8F5] border border-[#E5E1D7] rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:border-[#1B4332] focus:bg-white transition-all shadow-subtle"
          />
        </div>

        {/* Filter Tabs & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Format Tabs (Segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7] text-xs">
            <button
              onClick={() => setSelectedFormat('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedFormat === 'all'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setSelectedFormat('ats minimalist')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedFormat === 'ats minimalist'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              ATS Minimalist
            </button>
            <button
              onClick={() => setSelectedFormat('executive modern')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedFormat === 'executive modern'
                  ? 'bg-white text-[#1C201D] shadow-sm font-semibold'
                  : 'text-[#57605A] hover:text-[#1C201D]'
              }`}
            >
              Executive
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[#57605A] bg-[#FAF8F5] px-3 py-2 rounded-xl border border-[#E5E1D7]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#848E88]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-[#1C201D] font-medium outline-none cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="score">Highest Match Score</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* View Toggle Button */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#E5E1D7]">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-[#1B4332] shadow-sm'
                  : 'text-[#848E88] hover:text-[#1C201D]'
              }`}
              aria-label="Grid card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#1B4332] shadow-sm'
                  : 'text-[#848E88] hover:text-[#1C201D]'
              }`}
              aria-label="Table list view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Resume Content Area */}
      {filteredResumes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E1D7] p-12 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E5E1D7] text-[#848E88] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#1C201D]">No resumes found</h3>
            <p className="text-xs text-[#57605A]">
              {searchQuery || selectedFormat !== 'all'
                ? 'No documents matched your search or format criteria. Try resetting the filters.'
                : 'You have not created any resumes yet. Start building your first tailored dossier.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            {searchQuery || selectedFormat !== 'all' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFormat('all');
                }}
              >
                Reset Search Filters
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={onCreateNewClick}>
                Create Your First Resume
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card hover:border-[#1B4332] hover:shadow-elevated transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header row: Version and Score */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded">
                      {resume.version}
                    </span>
                    <span className="text-xs text-[#848E88]">{resume.format}</span>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getScoreBadgeClass(
                      resume.score
                    )}`}
                  >
                    {resume.score}% Match
                  </span>
                </div>

                {/* Title & Role */}
                <div>
                  <h3 className="font-bold text-base text-[#1C201D] group-hover:text-[#1B4332] transition-colors leading-snug line-clamp-1">
                    {resume.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#57605A] mt-1">
                    <Building2 className="w-3.5 h-3.5 text-[#848E88] shrink-0" />
                    <span className="truncate">
                      {resume.targetJobTitle}
                      {resume.targetCompany ? ` · ${resume.targetCompany}` : ''}
                    </span>
                  </div>
                </div>

                {/* Summary snippet */}
                <p className="text-xs text-[#57605A] leading-relaxed line-clamp-2">
                  {resume.summarySnippet}
                </p>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {resume.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-[#57605A] bg-[#FAF8F5] border border-[#E5E1D7] px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Metadata and Action Toolbar */}
              <div className="pt-5 mt-5 border-t border-[#F0ECE1] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#848E88]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </span>
                  <span>{resume.wordCount} words</span>
                </div>

                <div className="grid grid-cols-4 gap-1 pt-1">
                  <button
                    onClick={() => onSelectResumeToReview(resume)}
                    title="Run AI Score Review against Job Spec"
                    className="flex items-center justify-center gap-1 p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#EBF2EC] text-[#1B4332] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Score</span>
                  </button>

                  <button
                    onClick={() => onSelectResumeToEdit(resume)}
                    title="Edit Resume Details"
                    className="flex items-center justify-center gap-1 p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFE7] text-[#1C201D] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => onDuplicateResume(resume.id)}
                    title="Duplicate Resume Version"
                    className="flex items-center justify-center gap-1 p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFE7] text-[#57605A] hover:text-[#1C201D] text-xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    onClick={() => setDownloadModalResume(resume)}
                    title="Export PDF / DOCX"
                    className="flex items-center justify-center gap-1 p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFE7] text-[#57605A] hover:text-[#1C201D] text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-[#E5E1D7] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E1D7] text-[#848E88] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Resume Title & Role</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Compatibility</th>
                  <th className="py-3.5 px-4">Last Modified</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D7]">
                {filteredResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1C201D]">{resume.title}</span>
                          <span className="text-[10px] font-mono text-[#1B4332] bg-[#EBF2EC] px-1.5 py-0.5 rounded">
                            {resume.version}
                          </span>
                        </div>
                        <p className="text-xs text-[#57605A]">
                          {resume.targetJobTitle}
                          {resume.targetCompany ? ` · ${resume.targetCompany}` : ''}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[#57605A]">{resume.format}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border inline-block ${getScoreBadgeClass(
                          resume.score
                        )}`}
                      >
                        {resume.score}% Match
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#848E88] font-mono tabular-nums">
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectResumeToReview(resume)}
                          title="Run Score Review"
                          className="p-1.5 rounded-lg text-[#1B4332] hover:bg-[#EBF2EC] transition-colors cursor-pointer"
                        >
                          <Gauge className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectResumeToEdit(resume)}
                          title="Edit Document"
                          className="p-1.5 rounded-lg text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateResume(resume.id)}
                          title="Duplicate"
                          className="p-1.5 rounded-lg text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDownloadModalResume(resume)}
                          title="Export"
                          className="p-1.5 rounded-lg text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(resume.id)}
                          title="Delete Resume"
                          className="p-1.5 rounded-lg text-[#8C2E2E] hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export / Download Modal */}
      {downloadModalResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5E1D7] max-w-md w-full p-6 shadow-elevated space-y-4">
            <h3 className="text-lg font-bold text-[#1C201D]">Export Resume Dossier</h3>
            <p className="text-xs text-[#57605A] leading-relaxed">
              Choose an export format for{' '}
              <span className="font-semibold text-[#1C201D]">{downloadModalResume.title}</span>.
              Both formats maintain clean semantic headings for ATS parsers.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleDownload(downloadModalResume, 'PDF')}
                className="p-4 rounded-xl border border-[#E5E1D7] hover:border-[#1B4332] hover:bg-[#FAFDFB] text-center space-y-2 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#1C201D] block">PDF Document</span>
                  <span className="text-[11px] text-[#57605A]">Print-ready vector</span>
                </div>
              </button>

              <button
                onClick={() => handleDownload(downloadModalResume, 'DOCX')}
                className="p-4 rounded-xl border border-[#E5E1D7] hover:border-[#1B4332] hover:bg-[#FAFDFB] text-center space-y-2 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#1C201D] block">Word DOCX</span>
                  <span className="text-[11px] text-[#57605A]">Fully editable format</span>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDownloadModalResume(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5E1D7] max-w-sm w-full p-6 shadow-elevated space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1C201D]">Delete this resume?</h3>
              <p className="text-xs text-[#57605A]">
                This will remove the resume version from your local development repository.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  await onDeleteResume(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Delete Resume
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
