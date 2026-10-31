/**
 * Client service for calling server-side Gemini AI endpoints.
 * Never exposes API keys or imports @google/genai directly in client code.
 */

export interface GenerateSummaryParams {
  targetRole: string;
  targetIndustry?: string;
  experience?: string;
  skills?: string[];
  userNotes?: string;
}

export interface RewriteBulletsParams {
  rawBullets: string;
  roleTitle?: string;
  company?: string;
}

export interface RecommendSkillsParams {
  targetRole: string;
  currentSkills: string[];
}

export const geminiService = {
  /**
   * Generates a professional summary using only candidate-supplied facts.
   */
  async generateSummary(params: GenerateSummaryParams): Promise<string> {
    try {
      const response = await fetch('/api/gemini/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      return data.summary;
    } catch {
      // Deterministic client fallback without hallucinating facts
      const role = params.targetRole || 'Professional';
      const skillsStr = params.skills && params.skills.length > 0 ? params.skills.slice(0, 4).join(', ') : '';
      return `Results-driven ${role}${
        skillsStr ? ` with core expertise in ${skillsStr}` : ''
      }. Committed to driving operational excellence and contributing technical rigor to mission-critical initiatives in ${
        params.targetIndustry || 'the organization'
      }.`;
    }
  },

  /**
   * Rewrites responsibilities into ATS-optimized action bullets without inventing metrics.
   */
  async rewriteBullets(params: RewriteBulletsParams): Promise<string[]> {
    try {
      const response = await fetch('/api/gemini/rewrite-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error('Failed to rewrite bullets');
      const data = await response.json();
      return data.rewrittenBullets;
    } catch {
      // Deterministic client fallback
      return params.rawBullets
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean)
        .map((b) => {
          const clean = b.replace(/^[•\-\*\d\.\s]+/, '').trim();
          if (/^(managed|led|architected|built|developed|engineered|designed|implemented|streamlined|delivered)/i.test(clean)) {
            return clean;
          }
          return `Spearheaded ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
        });
    }
  },

  /**
   * Recommends standard industry skills/keywords relevant for target role.
   */
  async recommendSkills(params: RecommendSkillsParams): Promise<string[]> {
    try {
      const response = await fetch('/api/gemini/recommend-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error('Failed to recommend skills');
      const data = await response.json();
      return data.recommendedSkills;
    } catch {
      // Domain-specific fallback keyword recommendations
      const roleLower = (params.targetRole || '').toLowerCase();
      let suggestions = ['Git', 'CI/CD Pipelines', 'REST APIs', 'Unit Testing', 'System Architecture'];

      if (roleLower.includes('product') || roleLower.includes('pm')) {
        suggestions = ['Product Roadmap', 'User Research', 'A/B Testing', 'Agile/Scrum', 'Data Analytics', 'Cross-Functional Leadership'];
      } else if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('web')) {
        suggestions = ['TypeScript', 'Tailwind CSS', 'Next.js', 'State Management', 'Web Accessibility (WCAG)', 'Performance Profiling'];
      } else if (roleLower.includes('backend') || roleLower.includes('system') || roleLower.includes('data')) {
        suggestions = ['Distributed Systems', 'Kafka / Event Streaming', 'Docker & Kubernetes', 'PostgreSQL', 'Microservices Architecture'];
      }

      return suggestions.filter((s) => !params.currentSkills.includes(s));
    }
  },
};
