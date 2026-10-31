import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Settings, Terminal, Database, Cpu, Check, RotateCcw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [resetDone, setResetDone] = useState(false);

  const handleResetStorage = () => {
    localStorage.removeItem('resume_architect_dev_resumes');
    setResetDone(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C201D] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1B4332]" />
          <span>Platform & Integration Settings</span>
        </h2>
        <p className="text-xs text-[#57605A]">
          Review backend interoperability status and local development storage controls.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 sm:p-8 shadow-card space-y-6">
        <h3 className="font-bold text-sm text-[#1C201D]">Backend & Service Architecture Status</h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EBF2EC] text-[#1B4332] flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1C201D] block">Python FastAPI Backend</span>
                <span className="text-[11px] text-[#57605A]">
                  Prepared endpoint routes at <code>/api/v1</code>
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded">
              Ready
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EBF2EC] text-[#1B4332] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1C201D] block">SQLite Database Engine</span>
                <span className="text-[11px] text-[#57605A]">
                  Schema mapped for User, Resume, and Score tables
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded">
              Ready
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EBF2EC] text-[#1B4332] flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1C201D] block">Gemini AI Model Pipeline</span>
                <span className="text-[11px] text-[#57605A]">
                  Deterministic parsing prompts calibrated
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold text-[#1B4332] bg-[#EBF2EC] px-2 py-0.5 rounded">
              Ready
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-[#F0ECE1] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#1C201D] block">Reset Development Data</span>
            <span className="text-[11px] text-[#57605A]">
              Clears local sample resumes and restores canonical benchmark data.
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetStorage}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#57605A]" />}
          >
            {resetDone ? 'Restoring...' : 'Restore Benchmark Resumes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
