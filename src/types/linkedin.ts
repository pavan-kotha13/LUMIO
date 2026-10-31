/**
 * Resume Architect — LinkedIn Profile Optimizer Types
 * Decoupled, production-ready types for LinkedIn analysis, scoring, and optimization.
 */

export interface LinkedInPersonalInfo {
  fullName: string;
  currentTitleOrStatus: string;
  location: string;
  targetRole: string;
  targetIndustry: string;
  openToWork: boolean;
}

export interface LinkedInExperienceItem {
  id: string;
  company: string;
  jobTitle: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface LinkedInEducationItem {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  details: string;
}

export interface LinkedInProjectItem {
  id: string;
  title: string;
  tech: string;
  description: string;
  bullets: string[];
  link?: string;
}

export interface LinkedInCertificationItem {
  id: string;
  name: string;
  issuer: string;
  year?: string;
}

export interface LinkedInProfileData {
  personalInfo: LinkedInPersonalInfo;
  headline: string;
  about: string;
  experience: LinkedInExperienceItem[];
  education: LinkedInEducationItem[];
  projects: LinkedInProjectItem[];
  skills: {
    technical: string[];
    softAndTools: string[];
  };
  certifications: LinkedInCertificationItem[];
}

export type HeadlineStyleType = 'value-prop' | 'keyword-dense' | 'growth-impact';

export interface HeadlineSuggestion {
  id: string;
  type: HeadlineStyleType;
  label: string;
  text: string;
  charCount: number;
  keywordsIncluded: string[];
  rationale: string;
}

export type AboutStyleType = 'professional' | 'fresher' | 'technical' | 'concise';

export interface AboutOptimization {
  style: AboutStyleType;
  styleLabel: string;
  text: string;
  keyImprovements: string[];
  callToAction: string;
  wordCount: number;
}

export type TruthGuardStatus = 'SUPPORTED' | 'NEEDS CONFIRMATION' | 'UNSUPPORTED';

export interface ExperienceBulletOptimization {
  id: string;
  experienceId: string;
  company: string;
  jobTitle: string;
  originalBullet: string;
  optimizedBullet: string;
  truthGuardStatus: TruthGuardStatus;
  confirmationNote?: string;
  appliedFormula: 'XYZ' | 'STAR';
  accepted?: boolean;
}

export interface ProjectBulletOptimization {
  id: string;
  projectId: string;
  projectTitle: string;
  originalBullet: string;
  optimizedBullet: string;
  truthGuardStatus: TruthGuardStatus;
  confirmationNote?: string;
  accepted?: boolean;
}

export type EvidenceStatus = 'MATCHED' | 'PARTIALLY MATCHED' | 'RECOMMENDED_TO_ADD';

export interface SkillEvidenceItem {
  id: string;
  skill: string;
  category: 'Technical' | 'Soft & Domain' | 'Industry Keyword';
  status: EvidenceStatus;
  sourceEvidence: string;
  relevanceNote: string;
}

export type LinkedInScoreCategoryId =
  | 'headline'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'keywords'
  | 'completeness';

export interface LinkedInQualityScoreCategory {
  id: LinkedInScoreCategoryId;
  name: string;
  score: number; // 0 - 100
  weight: number; // e.g. 0.15
  status: 'optimal' | 'moderate' | 'action-required';
  feedback: string;
  metrics: {
    value: string;
    target: string;
  };
}

export interface LinkedInAnalysisResult {
  id: string;
  overallScore: number; // 0 - 100
  scoreGrade: 'Executive All-Star' | 'Strong Contender' | 'Developing' | 'Needs Optimization';
  categories: LinkedInQualityScoreCategory[];
  strengths: string[];
  weakAreas: string[];
  recommendations: string[];
  headlineSuggestions: HeadlineSuggestion[];
  aboutOptimizations: Record<AboutStyleType, AboutOptimization>;
  experienceOptimizations: ExperienceBulletOptimization[];
  projectOptimizations: ProjectBulletOptimization[];
  skillEvidence: SkillEvidenceItem[];
  analyzedAt: string;
}

export interface LinkedInSavedDraft {
  id: string;
  title: string;
  savedAt: string;
  profileData: LinkedInProfileData;
  score?: number;
  scoreGrade?: string;
}
