import React, { useState, useEffect } from 'react';
import { ResumeItem } from '../../types';
import {
  LinkedInProfileData,
  LinkedInAnalysisResult,
  LinkedInSavedDraft,
} from '../../types/linkedin';
import { SAMPLE_EXPERIENCED_LINKEDIN_PROFILE } from '../../utils/linkedInSampleData';
import { linkedInOptimizerService } from '../../services/linkedInOptimizerService';
import { LinkedInFormPanel } from '../linkedin/LinkedInFormPanel';
import { LinkedInAnalysisPanel } from '../linkedin/LinkedInAnalysisPanel';
import { LinkedInExportModal } from '../linkedin/LinkedInExportModal';
import { Button } from '../common/Button';
import { Share2, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface LinkedInViewProps {
  resumes?: ResumeItem[];
  onNavigateToStudio?: (profileData?: LinkedInProfileData) => void;
}

export const LinkedInView: React.FC<LinkedInViewProps> = ({
  resumes = [],
  onNavigateToStudio,
}) => {
  const [profileData, setProfileData] = useState<LinkedInProfileData>(
    SAMPLE_EXPERIENCED_LINKEDIN_PROFILE
  );
  const [analysis, setAnalysis] = useState<LinkedInAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'form' | 'analysis'>('form');

  // Run initial baseline analysis on mount
  useEffect(() => {
    runOptimization(profileData);
  }, []);

  const runOptimization = async (dataToAnalyze: LinkedInProfileData = profileData) => {
    setIsAnalyzing(true);
    try {
      const result = await linkedInOptimizerService.analyzeProfile(dataToAnalyze);
      setAnalysis(result);
      if (window.innerWidth < 1024) {
        setMobilePane('analysis');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProfileChange = (updated: LinkedInProfileData) => {
    setProfileData(updated);
  };

  const handleRestoreDraft = (draft: LinkedInSavedDraft) => {
    setProfileData(draft.profileData);
    runOptimization(draft.profileData);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C201D] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#1B4332]" />
            <span>LinkedIn Profile Optimizer</span>
          </h2>
          <p className="text-xs text-[#57605A] mt-0.5">
            Build a stronger professional identity and showcase your skills with confidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToStudio && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateToStudio(profileData)}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Export to AI Resume Studio
            </Button>
          )}
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center p-1 bg-white border border-[#E5E1D7] rounded-xl shadow-xs self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setMobilePane('form')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mobilePane === 'form'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            Profile Form
          </button>
          <button
            onClick={() => setMobilePane('analysis')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mobilePane === 'analysis'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#57605A] hover:text-[#1C201D]'
            }`}
          >
            AI Analysis & Preview
          </button>
        </div>
      </div>

      {/* Two-Panel Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Profile Information Form */}
        <div
          className={`lg:col-span-5 h-[calc(100vh-190px)] min-h-[620px] ${
            mobilePane === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          <LinkedInFormPanel
            profileData={profileData}
            onChange={handleProfileChange}
            resumes={resumes}
            isAnalyzing={isAnalyzing}
            onRunOptimization={() => runOptimization(profileData)}
          />
        </div>

        {/* RIGHT PANEL: AI Analysis & Preview */}
        <div
          className={`lg:col-span-7 h-[calc(100vh-190px)] min-h-[620px] ${
            mobilePane === 'analysis' ? 'block' : 'hidden lg:block'
          }`}
        >
          <LinkedInAnalysisPanel
            analysis={analysis}
            profileData={profileData}
            onUpdateProfile={handleProfileChange}
            isAnalyzing={isAnalyzing}
            onOpenExportModal={() => setExportModalOpen(true)}
          />
        </div>
      </div>

      {/* Export & Save Draft Modal */}
      <LinkedInExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        profileData={profileData}
        score={analysis?.overallScore}
        scoreGrade={analysis?.scoreGrade}
        onRestoreDraft={handleRestoreDraft}
      />
    </div>
  );
};
