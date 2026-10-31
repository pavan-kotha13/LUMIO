import React from 'react';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5E1D7] bg-[#FAF8F5] text-[#57605A] text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <Logo />
            <p className="text-xs text-[#57605A] leading-relaxed max-w-sm">
              Don't just match the job. Prove your fit. Resume Architect is an AI-powered resume
              analysis, scoring and improvement platform built without payment walls.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#848E88]">
              <span>Free & Accessible</span>
              <span aria-hidden="true">·</span>
              <span>FastAPI & AI Ready</span>
              <span aria-hidden="true">·</span>
              <span>v1.0</span>
            </div>
          </div>

          {/* Core Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C201D]">
              Platform Capabilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#score-engine" className="hover:text-[#1C201D] transition-colors">
                  AI Resume Score Engine
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#1C201D] transition-colors">
                  ATS Resume Builder
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#1C201D] transition-colors">
                  Resume Reviewer & Gaps
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#1C201D] transition-colors">
                  LinkedIn Profile Optimizer
                </a>
              </li>
            </ul>
          </div>

          {/* Scoring Methodology */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C201D]">
              Score Engine Pillars
            </h4>
            <ul className="space-y-2 text-xs text-[#57605A]">
              <li>Keyword Alignment (25%)</li>
              <li>Technical Skills (25%)</li>
              <li>Work Experience (20%)</li>
              <li>Project Relevance (15%)</li>
              <li>Formatting & ATS Readability (10%)</li>
              <li>Education Relevance (5%)</li>
            </ul>
          </div>

          {/* Access & Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C201D]">Access</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-[#1C201D] transition-colors">
                  Candidate Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[#1C201D] transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#1C201D] transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E5E1D7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#848E88]">
          <p>© {new Date().getFullYear()} Resume Architect. All core tools freely accessible.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#57605A] transition-colors cursor-pointer">
              Privacy Notice
            </span>
            <span>·</span>
            <span className="hover:text-[#57605A] transition-colors cursor-pointer">
              Terms of Use
            </span>
            <span>·</span>
            <span className="hover:text-[#57605A] transition-colors cursor-pointer">
              Scoring Integrity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
