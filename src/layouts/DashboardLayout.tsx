import React, { useState } from 'react';
import { Sidebar, DashboardTab } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';

interface DashboardLayoutProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onCreateClick: () => void;
  onReviewClick: () => void;
  resumeCount?: number;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  onCreateClick,
  onReviewClick,
  resumeCount = 3,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // If in editor view, default sidebar to collapsed on desktop to give maximum workspace room
  const isEditor = currentTab === 'editor';

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex selection:bg-[#1B4332] selection:text-white">
      {/* Persistent Left Sidebar (Desktop: Collapsible 80px/256px; Mobile: sliding drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        resumeCount={resumeCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area (Offset by 80px or 256px on lg screens) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <DashboardHeader
          currentTab={currentTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onCreateClick={onCreateClick}
          onReviewClick={onReviewClick}
        />

        <main
          className={`flex-1 w-full mx-auto ${
            isEditor ? 'max-w-[1750px] p-2 sm:p-4 lg:p-6' : 'max-w-7xl p-4 sm:p-6 lg:p-8'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
