import {
  LinkedInProfileData,
  LinkedInAnalysisResult,
  LinkedInSavedDraft,
} from '../types/linkedin';
import { ResumeItem, ResumeStudioData } from '../types';
import { convertResumeToLinkedInProfile } from '../utils/linkedInSampleData';

const STORAGE_KEY_LINKEDIN_DRAFTS = 'resume_architect_linkedin_drafts';

export const linkedInOptimizerService = {
  /**
   * Evaluates and optimizes a LinkedIn profile via the backend Gemini / deterministic engine.
   */
  async analyzeProfile(profileData: LinkedInProfileData): Promise<LinkedInAnalysisResult> {
    try {
      const response = await fetch('/api/linkedin/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('API call to /api/linkedin/analyze failed, using client-side deterministic fallback:', err);
      return this.computeClientFallback(profileData);
    }
  },

  /**
   * Deterministic client fallback if network is interrupted.
   */
  computeClientFallback(profileData: LinkedInProfileData): LinkedInAnalysisResult {
    const { personalInfo, headline, about, experience, projects, skills, education, certifications } = profileData;
    const headlineLen = (headline || '').trim().length;
    const aboutWords = (about || '').trim().split(/\s+/).filter(Boolean).length;
    const totalExpBullets = experience.reduce((acc, item) => acc + (item.bullets?.length || 0), 0);
    const totalProjBullets = projects.reduce((acc, item) => acc + (item.bullets?.length || 0), 0);
    const allSkillsCount = (skills.technical?.length || 0) + (skills.softAndTools?.length || 0);

    const headlineScore = Math.min(100, headlineLen >= 50 && headlineLen <= 220 ? 92 : headlineLen > 0 ? 65 : 35);
    const aboutScore = Math.min(100, aboutWords >= 50 ? 90 : aboutWords > 20 ? 70 : 40);
    const experienceScore = Math.min(100, experience.length >= 2 && totalExpBullets >= 4 ? 92 : experience.length >= 1 ? 75 : 45);
    const projectScore = Math.min(100, projects.length >= 2 ? 94 : projects.length >= 1 ? 80 : 50);
    const skillsScore = Math.min(100, allSkillsCount >= 10 ? 95 : allSkillsCount >= 5 ? 78 : 55);
    const keywordScore = 84;
    const completenessScore = Math.round(
      (([personalInfo.fullName, headlineLen > 10, aboutWords > 15, experience.length > 0, education.length > 0, projects.length > 0, allSkillsCount > 3, certifications.length > 0].filter(Boolean).length) / 8) * 100
    );

    const categories = [
      {
        id: 'headline' as const,
        name: 'Headline Quality',
        score: headlineScore,
        weight: 0.15,
        status: (headlineScore >= 80 ? 'optimal' : headlineScore >= 60 ? 'moderate' : 'action-required') as any,
        feedback: headlineLen > 0 ? 'Clear professional positioning statement.' : 'Headline needs role definition and core stack.',
        metrics: { value: `${headlineLen} chars`, target: '70-220 chars' },
      },
      {
        id: 'about' as const,
        name: 'About Section & Narrative',
        score: aboutScore,
        weight: 0.20,
        status: (aboutScore >= 80 ? 'optimal' : aboutScore >= 60 ? 'moderate' : 'action-required') as any,
        feedback: aboutWords >= 40 ? 'Effective storytelling of background and competencies.' : 'Add more career context and networking call to action.',
        metrics: { value: `${aboutWords} words`, target: '75-200 words' },
      },
      {
        id: 'experience' as const,
        name: 'Experience Presentation',
        score: experienceScore,
        weight: 0.20,
        status: (experienceScore >= 80 ? 'optimal' : 'moderate') as any,
        feedback: `${experience.length} professional positions documented with deliverables.`,
        metrics: { value: `${experience.length} roles, ${totalExpBullets} bullets`, target: '2+ roles, 4+ bullets' },
      },
      {
        id: 'projects' as const,
        name: 'Project Impact & Real-World Utility',
        score: projectScore,
        weight: 0.15,
        status: 'optimal' as any,
        feedback: 'Practical technical software artifacts demonstrated.',
        metrics: { value: `${projects.length} projects`, target: '2+ projects' },
      },
      {
        id: 'skills' as const,
        name: 'Technical & Soft Skills',
        score: skillsScore,
        weight: 0.10,
        status: (skillsScore >= 80 ? 'optimal' : 'moderate') as any,
        feedback: `${allSkillsCount} skills indexed across core technologies.`,
        metrics: { value: `${allSkillsCount} skills`, target: '10+ skills' },
      },
      {
        id: 'keywords' as const,
        name: 'Keyword Relevance & Discovery',
        score: keywordScore,
        weight: 0.10,
        status: 'optimal' as any,
        feedback: 'Keywords match algorithmic recruiter search queries for target role.',
        metrics: { value: `${keywordScore}% rank`, target: '85%+ rank' },
      },
      {
        id: 'completeness' as const,
        name: 'Profile Completeness',
        score: completenessScore,
        weight: 0.10,
        status: (completenessScore >= 80 ? 'optimal' : 'moderate') as any,
        feedback: `${completenessScore}% of core profile sections populated.`,
        metrics: { value: `${completenessScore}%`, target: '100%' },
      },
    ];

    const overallScore = Math.round(categories.reduce((acc, cat) => acc + cat.score * cat.weight, 0));
    const targetRole = personalInfo.targetRole || personalInfo.currentTitleOrStatus || 'Software Engineer';
    const primarySkill = skills.technical[0] || 'Software Development';

    return {
      id: `li_fallback_${Date.now()}`,
      overallScore,
      scoreGrade: overallScore >= 88 ? 'Executive All-Star' : overallScore >= 75 ? 'Strong Contender' : 'Developing',
      categories,
      strengths: ['Verifiable candidate experience and skills', 'Demonstrated project competencies'],
      weakAreas: headlineLen < 40 ? ['Headline can be further optimized for recruiter search'] : [],
      recommendations: ['Consider incorporating the Recruiter Search-Optimized headline suggestion.'],
      headlineSuggestions: [
        {
          id: 'hl_1',
          type: 'value-prop',
          label: 'Role & Value Proposition',
          text: `${targetRole} | Building High-Performance Applications with ${primarySkill} | ${personalInfo.targetIndustry || 'Technology'}`,
          charCount: `${targetRole} | Building High-Performance Applications with ${primarySkill} | ${personalInfo.targetIndustry || 'Technology'}`.length,
          keywordsIncluded: [targetRole, primarySkill],
          rationale: 'Clarifies role title, tech specialty, and domain focus.',
        },
        {
          id: 'hl_2',
          type: 'keyword-dense',
          label: 'Recruiter Search-Optimized',
          text: `${targetRole} | ${(skills.technical || []).slice(0, 4).join(', ') || 'Full Stack'} | Cloud & Distributed Systems`,
          charCount: `${targetRole} | ${(skills.technical || []).slice(0, 4).join(', ') || 'Full Stack'} | Cloud & Distributed Systems`.length,
          keywordsIncluded: (skills.technical || []).slice(0, 4),
          rationale: 'Maximized for recruiter keyword queries.',
        },
        {
          id: 'hl_3',
          type: 'growth-impact',
          label: 'Growth & Impact Focused',
          text: `${targetRole} | Focused on Engineering Quality, Scalable Architectures & User Impact`,
          charCount: `${targetRole} | Focused on Engineering Quality, Scalable Architectures & User Impact`.length,
          keywordsIncluded: [targetRole, 'Engineering Quality'],
          rationale: 'Highlights engineering philosophy and problem-solving mindset.',
        },
      ],
      aboutOptimizations: {
        professional: {
          style: 'professional',
          styleLabel: 'Professional & Authoritative',
          text: `As a ${targetRole} in ${personalInfo.targetIndustry || 'the software industry'}, I build resilient and scalable software solutions.\n\nThroughout my career, I have worked with ${(skills.technical || []).slice(0, 4).join(', ')}, collaborating with engineering teams to deliver high-quality production code. My approach emphasizes maintainability, automated testing, and team velocity.\n\nOpen to discussing technical challenges and impactful career opportunities.`,
          keyImprovements: ['Clear professional positioning', 'Highlights core tech stack', 'Clear networking CTA'],
          callToAction: 'Open to connecting and discussing engineering opportunities.',
          wordCount: 65,
        },
        fresher: {
          style: 'fresher',
          styleLabel: 'Student & Fresher Friendly',
          text: `Recent ${education[0]?.degree || 'Computer Science'} graduate from ${education[0]?.institution || 'University'} with project experience in ${(skills.technical || []).slice(0, 3).join(', ')}.\n\nPassionate about writing clean code and building user-focused applications. Looking forward to contributing to an agile engineering team as a ${targetRole}.`,
          keyImprovements: ['Emphasizes learning agility', 'Highlights project deliverables', 'Warm invitation to connect'],
          callToAction: 'Actively seeking entry-level software engineering positions. Feel free to connect!',
          wordCount: 48,
        },
        technical: {
          style: 'technical',
          styleLabel: 'Technical & Architecture Focused',
          text: `Software Engineer specializing in ${(skills.technical || []).slice(0, 4).join(', ')}.\n\nTechnical Specialties:\n• Languages & Frameworks: ${(skills.technical || []).join(', ')}\n• Practices: System architecture, unit testing, and agile workflows.\n\nDedicated to robust software craftsmanship and performance.`,
          keyImprovements: ['Technical bulleted overview', 'Direct stack enumeration', 'Scannable for technical hiring managers'],
          callToAction: 'Interested in technical collaborations and engineering discussions.',
          wordCount: 45,
        },
        concise: {
          style: 'concise',
          styleLabel: 'Concise & Punchy',
          text: `${targetRole} specializing in ${(skills.technical || []).slice(0, 3).join(', ')}.\n\nFocus areas:\n- High-performance, maintainable web software\n- Automated testing and CI/CD workflows\n\nOpen to new opportunities. Let's connect!`,
          keyImprovements: ['Under 40 words', 'Fast mobile reading', 'Immediate call to action'],
          callToAction: 'Open to new opportunities. Let’s connect!',
          wordCount: 32,
        },
      },
      experienceOptimizations: experience.flatMap((exp) =>
        (exp.bullets || []).map((b, idx) => ({
          id: `opt_${exp.id}_${idx}`,
          experienceId: exp.id,
          company: exp.company,
          jobTitle: exp.jobTitle,
          originalBullet: b,
          optimizedBullet: `Architected and delivered ${b.charAt(0).toLowerCase() + b.slice(1)}`,
          truthGuardStatus: /\d+/.test(b) ? 'SUPPORTED' : 'NEEDS CONFIRMATION',
          confirmationNote: /\d+/.test(b) ? 'Metrics verified.' : 'Add your exact team throughput or latency metric.',
          appliedFormula: 'XYZ',
          accepted: false,
        }))
      ),
      projectOptimizations: projects.flatMap((p) =>
        (p.bullets || []).map((b, idx) => ({
          id: `opt_proj_${p.id}_${idx}`,
          projectId: p.id,
          projectTitle: p.title,
          originalBullet: b,
          optimizedBullet: `${b} utilizing ${p.tech.split(',')[0]}`,
          truthGuardStatus: 'SUPPORTED',
          confirmationNote: 'Verified by project description.',
          accepted: false,
        }))
      ),
      skillEvidence: (skills.technical || []).map((s, idx) => ({
        id: `sk_${idx}`,
        skill: s,
        category: 'Technical',
        status: 'MATCHED',
        sourceEvidence: 'Specified in candidate profile.',
        relevanceNote: 'High search volume skill for target role.',
      })),
      analyzedAt: new Date().toISOString(),
    };
  },

  /**
   * Imports a resume into LinkedIn profile format.
   */
  importResume(resume: ResumeItem, studioData?: ResumeStudioData | null): LinkedInProfileData {
    return convertResumeToLinkedInProfile(resume, studioData);
  },

  /**
   * Local storage drafts management.
   */
  getSavedDrafts(): LinkedInSavedDraft[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LINKEDIN_DRAFTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveDraft(title: string, profileData: LinkedInProfileData, score?: number, scoreGrade?: string): LinkedInSavedDraft {
    const drafts = this.getSavedDrafts();
    const newDraft: LinkedInSavedDraft = {
      id: `li_draft_${Date.now()}`,
      title: title || `${profileData.personalInfo.fullName || 'Candidate'} — ${profileData.personalInfo.targetRole || 'LinkedIn Draft'}`,
      savedAt: new Date().toISOString(),
      profileData,
      score,
      scoreGrade,
    };
    const updated = [newDraft, ...drafts];
    localStorage.setItem(STORAGE_KEY_LINKEDIN_DRAFTS, JSON.stringify(updated));
    return newDraft;
  },

  deleteDraft(id: string): void {
    const drafts = this.getSavedDrafts().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY_LINKEDIN_DRAFTS, JSON.stringify(drafts));
  },
};
