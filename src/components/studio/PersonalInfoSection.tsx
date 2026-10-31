import React from 'react';
import { Input } from '../common/Input';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { ResumeStudioData } from '../../types';

interface PersonalInfoSectionProps {
  data: ResumeStudioData['personalInfo'];
  onChange: (updated: ResumeStudioData['personalInfo']) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof ResumeStudioData['personalInfo'], value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            A
          </span>
          <h3 className="font-bold text-sm text-[#1C201D]">Personal Information</h3>
        </div>
        <span className="text-[11px] text-[#848E88]">Header & Contact Links</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Legal / Professional Name"
          type="text"
          placeholder="e.g. Sarah Lindqvist"
          value={data.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Professional Email"
          type="email"
          placeholder="sarah@example.com"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="Location (City, Country / State)"
          type="text"
          placeholder="San Francisco, CA"
          value={data.location}
          onChange={(e) => handleChange('location', e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
        />

        <Input
          label="LinkedIn Profile URL"
          type="text"
          placeholder="linkedin.com/in/username"
          value={data.linkedinUrl || ''}
          onChange={(e) => handleChange('linkedinUrl', e.target.value)}
          leftIcon={<Linkedin className="w-4 h-4" />}
        />

        <Input
          label="GitHub Profile URL"
          type="text"
          placeholder="github.com/username"
          value={data.githubUrl || ''}
          onChange={(e) => handleChange('githubUrl', e.target.value)}
          leftIcon={<Github className="w-4 h-4" />}
        />

        <div className="sm:col-span-2">
          <Input
            label="Portfolio or Personal Website URL"
            type="text"
            placeholder="yoursite.dev"
            value={data.portfolioUrl || ''}
            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
            leftIcon={<Globe className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};
