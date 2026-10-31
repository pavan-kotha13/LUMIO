import React, { useState } from 'react';
import { Award, Plus, Trash2, ExternalLink } from 'lucide-react';
import { CertificationEntry } from '../../types';
import { Input } from '../common/Input';

interface CertificationsSectionProps {
  certifications?: (string | CertificationEntry)[];
  onChange: (updated: CertificationEntry[]) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications = [],
  onChange,
}) => {
  // Normalize string[] or CertificationEntry[] to CertificationEntry[]
  const normalizedEntries: CertificationEntry[] = certifications.map((c, i) => {
    if (typeof c === 'string') {
      return {
        id: `cert_${i + 1}`,
        name: c,
        issuer: 'Industry Standard Authority',
        issueDate: '',
        credentialId: '',
      };
    }
    return c;
  });

  const handleAdd = () => {
    const newEntry: CertificationEntry = {
      id: 'cert_' + Math.random().toString(36).substring(2, 9),
      name: '',
      issuer: '',
      issueDate: '',
      credentialId: '',
      credentialUrl: '',
    };
    onChange([...normalizedEntries, newEntry]);
  };

  const handleRemove = (id: string) => {
    onChange(normalizedEntries.filter((c) => c.id !== id));
  };

  const handleUpdate = (id: string, field: keyof CertificationEntry, value: string) => {
    onChange(
      normalizedEntries.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1D7] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#EBF2EC] text-[#1B4332] font-mono text-xs font-bold flex items-center justify-center">
            H
          </span>
          <div>
            <h3 className="font-bold text-sm text-[#1C201D]">Certifications & Licenses</h3>
            <p className="text-[11px] text-[#57605A]">
              Industry certifications, vendor credentials, and technical accreditations.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#EBF2EC] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certification</span>
        </button>
      </div>

      {normalizedEntries.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-[#E5E1D7] rounded-xl bg-[#FAF8F5]">
          <Award className="w-8 h-8 text-[#A3C4B0] mx-auto mb-2 opacity-60" />
          <p className="text-xs text-[#57605A] font-medium">No certifications added yet.</p>
          <p className="text-[11px] text-[#848E88] mt-0.5">
            Add AWS, GCP, Azure, CKA, CISSP, or other professional credentials.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add a certification</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {normalizedEntries.map((item, index) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5E1D7] space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Certification #{index + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-[#848E88] hover:text-[#8C2E2E] p-1 rounded transition-colors cursor-pointer"
                  title="Remove certification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Certification Name"
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect — Professional"
                  value={item.name}
                  onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                  required
                />

                <Input
                  label="Issuing Organization"
                  type="text"
                  placeholder="e.g. Amazon Web Services (AWS)"
                  value={item.issuer}
                  onChange={(e) => handleUpdate(item.id, 'issuer', e.target.value)}
                  required
                />

                <Input
                  label="Issue Date / Valid Through"
                  type="text"
                  placeholder="e.g. Aug 2023 - Aug 2026"
                  value={item.issueDate || ''}
                  onChange={(e) => handleUpdate(item.id, 'issueDate', e.target.value)}
                />

                <Input
                  label="Credential ID or URL"
                  type="text"
                  placeholder="e.g. AWS-PSA-994821 or verify link"
                  value={item.credentialId || item.credentialUrl || ''}
                  onChange={(e) => handleUpdate(item.id, 'credentialId', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
