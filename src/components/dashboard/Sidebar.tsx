import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  FilePlus,
  Gauge,
  Edit3,
  Share2,
  FolderArchive,
  User,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type DashboardTab =
  | 'home'
  | 'create'
  | 'improve'
  | 'review'
  | 'editor'
  | 'linkedin'
  | 'resumes'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  resumeCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  resumeCount = 3,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home' as DashboardTab, label: 'Dashboard', icon: Home },
    { id: 'create' as DashboardTab, label: 'Create Resume', icon: FilePlus },
    { id: 'improve' as DashboardTab, label: 'Improve Resume', icon: Sparkles },
    { id: 'review' as DashboardTab, label: 'Resume Reviewer', icon: Gauge },
    { id: 'linkedin' as DashboardTab, label: 'LinkedIn Optimizer', icon: Share2 },
    {
      id: 'resumes' as DashboardTab,
      label: 'My Resumes',
      icon: FolderArchive,
      badge: resumeCount.toString(),
    },
    { id: 'profile' as DashboardTab, label: 'Profile', icon: User },
  ];

  const handleNavClick = (tabId: DashboardTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    onCloseMobile();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E5E1D7] flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'
        }`}
      >
        {/* Top Header / Logo */}
        <div>
          <div className={`h-16 border-b border-[#E5E1D7] flex items-center ${isCollapsed ? 'px-3 justify-center' : 'px-6 justify-between'}`}>
            <Logo isLink={false} collapsed={isCollapsed} />
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-[#848E88]">
                Platform Tools
              </div>
            )}
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#848E88]'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F3EFE7] text-[#1C201D]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] absolute top-1 right-1" />
                  )}
                </button>
              );
            })}

            {!isCollapsed && (
              <div className="pt-4 px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-[#848E88]">
                Account
              </div>
            )}
            {navItems.slice(6).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#848E88]'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Candidate Status & Logout & Collapse Toggle */}
        <div className="p-3 border-t border-[#E5E1D7] space-y-2">
          {/* Candidate Card */}
          <div className={`p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-[#1C201D] block truncate">
                  {user?.name || 'Candidate'}
                </span>
                <span className="text-[11px] text-[#57605A] block truncate">
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            )}
            <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'} py-2 text-xs font-semibold text-[#8C2E2E] hover:bg-red-50 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0`}
          >
            <LogOut className="w-4 h-4 text-[#8C2E2E] shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          {/* Desktop Collapse/Expand Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex w-full items-center justify-center p-2 text-xs text-[#57605A] hover:text-[#1C201D] hover:bg-[#FAF8F5] rounded-xl border border-dashed border-[#E5E1D7] transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Collapse Sidebar</span>
                </div>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
