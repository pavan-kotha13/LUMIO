import React from 'react';
import { Menu, PlusCircle, Gauge } from 'lucide-react';
import { Button } from '../common/Button';
import { DashboardTab } from './Sidebar';

interface DashboardHeaderProps {
  currentTab: DashboardTab;
  onOpenMobileSidebar: () => void;
  onCreateClick: () => void;
  onReviewClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onCreateClick,
  onReviewClick,
}) => {
  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'home':
        return 'Tools Dashboard';
      case 'create':
        return 'AI Resume Studio';
      case 'review':
        return 'Review Resume & AI Score Engine';
      case 'editor':
        return 'Resume Editor';
      case 'linkedin':
        return 'LinkedIn Optimizer';
      case 'resumes':
        return 'My Resumes (Resume History)';
      case 'profile':
        return 'Candidate Profile';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5E1D7] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-[#57605A] hover:text-[#1C201D] hover:bg-white rounded-lg transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-[#57605A]">
          <span className="hidden sm:inline">Resume Architect</span>
          <span className="hidden sm:inline" aria-hidden="true">/</span>
          <h1 className="font-bold text-sm text-[#1C201D] whitespace-nowrap">
            {getTabTitle(currentTab)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReviewClick}
          leftIcon={<Gauge className="w-3.5 h-3.5 text-[#1B4332]" />}
          className="hidden sm:inline-flex"
        >
          Review Resume
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateClick}
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
        >
          Create Resume
        </Button>
      </div>
    </header>
  );
};
