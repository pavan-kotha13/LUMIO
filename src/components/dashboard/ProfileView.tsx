import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { User, Check, Briefcase, Mail } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Marcus Vance');
  const [targetRole, setTargetRole] = useState('Staff Distributed Systems Engineer');
  const [seniority, setSeniority] = useState('Lead / Staff');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C201D] flex items-center gap-2">
          <User className="w-5 h-5 text-[#1B4332]" />
          <span>Candidate Profile</span>
        </h2>
        <p className="text-xs text-[#57605A]">
          Configure your professional identity and primary target seniority level.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 sm:p-8 shadow-card space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Account Email"
            type="email"
            value={user?.email || 'user@domain.com'}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Connected local development email"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Target Role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              leftIcon={<Briefcase className="w-4 h-4" />}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1C201D]">Target Seniority</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full text-xs text-[#1C201D] bg-white border border-[#E5E1D7] rounded-xl px-3 py-2.5 outline-none shadow-subtle cursor-pointer"
              >
                <option value="Senior">Senior Specialist (5-8 yrs)</option>
                <option value="Lead / Staff">Lead / Staff / Principal</option>
                <option value="Director">Director / Head of Engineering</option>
                <option value="Executive">VP / C-Level Executive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0ECE1] flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-medium text-[#1B4332] flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Profile updated successfully
              </span>
            ) : (
              <span />
            )}
            <Button type="submit" variant="primary" size="sm">
              Save Profile Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
