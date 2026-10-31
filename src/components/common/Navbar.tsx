import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + sectionId);
      return;
    }
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5E1D7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single brand wordmark */}
          <div className="shrink-0 flex items-center">
            <Logo />
          </div>

          {/* Zone 2: 4-5 concise single-line nav links (NO PRICING) */}
          {!isAuthPage ? (
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57605A]">
              <button
                onClick={() => handleNavClick('#features')}
                className="hover:text-[#1C201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('#score-engine')}
                className="hover:text-[#1C201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                AI Score Engine
              </button>
              <button
                onClick={() => handleNavClick('#how-it-works')}
                className="hover:text-[#1C201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                How It Works
              </button>
            </nav>
          ) : (
            <div className="hidden md:block text-xs text-[#57605A]">
              Don't just match the job. Prove your fit.
            </div>
          )}

          {/* Zone 3: 1 primary action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/app">
                  <Button variant="secondary" size="sm">
                    Workspace ({user?.name.split(' ')[0]})
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : isAuthPage ? (
              location.pathname === '/login' ? (
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Create Account
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
              )
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1C201D] hover:bg-[#F3EFE7] rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E1D7] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#1C201D]">
            <button
              onClick={() => handleNavClick('#features')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F3EFE7] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('#score-engine')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F3EFE7] transition-colors"
            >
              AI Score Engine
            </button>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F3EFE7] transition-colors"
            >
              How It Works
            </button>
          </nav>
          <div className="pt-3 border-t border-[#E5E1D7] flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/app" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Open Workspace
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
