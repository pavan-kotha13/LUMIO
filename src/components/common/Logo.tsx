import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  isLink?: boolean;
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', isLink = true, collapsed = false }) => {
  const content = (
    <span className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-[#1C201D] text-lg select-none ${className}`}>
      {/* Architectural drafting mark */}
      <span className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden" title="Resume Architect">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-[#F3EFE7]"
        >
          {/* Architectural drafting compass & cross-section line */}
          <path d="M12 2L4 20h16L12 2z" />
          <path d="M7.5 13h9" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
        </svg>
      </span>
      {!collapsed && (
        <span className="whitespace-nowrap tracking-tight font-semibold text-[17px]">
          Resume <span className="text-[#1B4332] font-bold">Architect</span>
        </span>
      )}
    </span>
  );

  if (isLink) {
    return (
      <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
