/**
 * Resume Architect Core Domain Types
 * Clean, decoupled domain types prepared for FastAPI + SQLite + Gemini AI backend.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * 6 Core Pillars of the Resume Architect Score Engine:
 * 1. Job Description Keyword Alignment
 * 2. Technical Skill Alignment
 * 3. Project Relevance
 * 4. Work Experience Relevance
 * 5. Education Relevance
 * 6. Resume Formatting & Readability
 */
export type ScoreCategoryId =
  | 'keyword-alignment'
  | 'technical-skills'
  | 'project-relevance'
  | 'experience-relevance'
  | 'education-relevance'
  | 'formatting-readability';

export interface ScoreCategory {
  id: ScoreCategoryId;
  name: string;
  score: number; // 0 - 100
  weight: number; // Decimal (e.g., 0.20)
  status: 'optimal' | 'moderate' | 'action-required';
  summary: string;
  metrics: {
    matched: number;
    total: number;
    unit?: string;
  };
}

export interface MissingKeyword {
  id: string;
  term: string;
  category: 'Critical Mandate' | 'Technical Tool' | 'Industry Practice' | 'Leadership';
  jobFrequency: number;
  importance: 'critical' | 'important' | 'beneficial';
}

export interface SkillGap {
  id: string;
  skillName: string;
  category: string;
  status: 'matched' | 'partial' | 'missing';
  requiredContext: string;
  candidateEvidence: string | null;
  recommendation: string;
}

export interface ImprovementRecommendation {
  id: string;
  category: ScoreCategoryId;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedScoreDelta: number; // Estimated points gained if addressed
  sampleBefore?: string;
  sampleAfter?: string;
}

export interface ResumeScoreEvaluation {
  id: string;
  overallScore: number; // Calculated deterministically via weighted categories
  scoreGrade: 'Exceptional' | 'Strong' | 'Competitive' | 'Needs Revision';
  evaluatedAt: string;
  jobTitle: string;
  companyName?: string;
  resumeFileName: string;
  categories: ScoreCategory[];
  missingKeywords: MissingKeyword[];
  skillGaps: SkillGap[];
  recommendations: ImprovementRecommendation[];
  methodologyNotes: string;
}

export interface ResumeItem {
  id: string;
  title: string;
  targetJobTitle: string;
  targetCompany?: string;
  updatedAt: string;
  createdAt: string;
  version: string;
  format: 'ATS Minimalist' | 'Executive Modern' | 'Technical Specialist';
  score?: number; // 0 - 100
  scoreGrade?: 'Exceptional' | 'Strong' | 'Competitive' | 'Needs Revision';
  pageCount: number;
  wordCount: number;
  tags: string[];
  summarySnippet: string;
  resume_data?: any;
}

export interface EducationEntry {
  id: string;
  institutionName: string;
  degree: string;
  branch: string;
  startYear: string;
  graduationYear: string;
  cgpaOrPercentage: string;
}

export interface SkillCategoryGroup {
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  developerTools: string[];
  coreSubjects: string[];
  otherSkills: string[];
}

export interface ProjectEntry {
  id: string;
  projectName: string;
  projectDescription: string;
  technologiesUsed: string;
  projectLink?: string;
  keyContributions: string;
  projectOutcome?: string;
}

export interface ExperienceEntry {
  id: string;
  organisation: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  responsibilities: string;
  keyAchievements?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  date?: string;
  description: string;
}

export interface ExtracurricularEntry {
  id: string;
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface ResumeStudioData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  careerObjective: {
    targetJobRole: string;
    targetIndustry: string;
    professionalSummary: string;
  };
  education: EducationEntry[];
  skills: SkillCategoryGroup;
  softSkills?: string[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications?: (string | CertificationEntry)[];
  achievements?: AchievementEntry[];
  extracurriculars?: ExtracurricularEntry[];
  selectedTemplate?: string;
}


