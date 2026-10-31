import { ResumeItem } from '../types';
import { apiClient } from './api';

const STORAGE_KEY_RESUMES = 'resume_architect_dev_resumes';

function mapBackendResumeToItem(b: any): ResumeItem {
  const score = typeof b.latest_score === 'number' ? b.latest_score : undefined;
  const scoreGrade: ResumeItem['scoreGrade'] =
    score !== undefined
      ? score >= 90
        ? 'Exceptional'
        : score >= 78
        ? 'Strong'
        : score >= 65
        ? 'Competitive'
        : 'Needs Revision'
      : undefined;

  const rData = b.resume_data || {};
  const skillsObj = rData.skills || {};
  const tags: string[] = Array.isArray(skillsObj)
    ? skillsObj.slice(0, 5)
    : [
        ...(skillsObj.programmingLanguages || skillsObj.technical || []),
        ...(skillsObj.frameworks || []),
        ...(skillsObj.developerTools || []),
      ].slice(0, 5);

  const summarySnippet =
    rData.careerObjective?.professionalSummary ||
    rData.summary ||
    `${rData.personalInfo?.fullName || 'Candidate'} — ${b.target_role || 'Professional'}`;

  return {
    id: b.id,
    title: b.title,
    targetJobTitle: b.target_role || 'Software Engineer',
    targetCompany: b.target_company || '',
    updatedAt: b.updated_at,
    createdAt: b.created_at,
    version: `v${b.version_count || 1}.0`,
    format: 'ATS Minimalist',
    score: b.latest_score ?? undefined,
    scoreGrade,
    pageCount: 1,
    wordCount: JSON.stringify(rData).length > 200 ? Math.round(JSON.stringify(rData).length / 5) : 350,
    tags: tags.length > 0 ? tags : ['General'],
    summarySnippet,
    resume_data: rData,
  };
}

export const resumeService = {
  /**
   * Retrieves all resumes for the authenticated user from SQLite via FastAPI.
   */
  async getResumes(): Promise<ResumeItem[]> {
    try {
      const data = await apiClient<any[]>('/resumes');
      return data.map(mapBackendResumeToItem);
    } catch (err) {
      console.warn('API /resumes failed, checking local backup:', err);
      const stored = localStorage.getItem(STORAGE_KEY_RESUMES);
      return stored ? JSON.parse(stored) : [];
    }
  },

  /**
   * Retrieves single resume by ID from SQLite.
   */
  async getResumeById(id: string): Promise<ResumeItem | null> {
    try {
      const data = await apiClient<any>(`/resumes/${id}`);
      return mapBackendResumeToItem(data);
    } catch {
      const resumes = await this.getResumes();
      return resumes.find((r) => r.id === id) || null;
    }
  },

  /**
   * Creates a new resume draft in SQLite.
   */
  async createResume(data: Partial<ResumeItem> & { resume_data?: any }): Promise<ResumeItem> {
    const payload = {
      title: data.title || 'Untitled Tailored Resume',
      target_role: data.targetJobTitle || 'Software Engineer',
      target_company: data.targetCompany || '',
      resume_data: data.resume_data || {},
    };

    try {
      const backendRes = await apiClient<any>('/resumes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return mapBackendResumeToItem(backendRes);
    } catch (err) {
      console.error('Failed to create resume in backend:', err);
      // Fallback
      const newResume: ResumeItem = {
        id: 'res_' + Math.random().toString(36).substring(2, 9),
        title: data.title || 'Untitled Tailored Resume',
        targetJobTitle: data.targetJobTitle || 'Software Engineer',
        targetCompany: data.targetCompany || '',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        version: 'v1.0',
        format: 'ATS Minimalist',
        score: 70,
        scoreGrade: 'Competitive',
        pageCount: 1,
        wordCount: 350,
        tags: data.tags || ['General'],
        summarySnippet: data.summarySnippet || 'Draft resume created from scratch.',
        resume_data: data.resume_data || {},
      };
      const current = await this.getResumes();
      localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify([newResume, ...current]));
      return newResume;
    }
  },

  /**
   * Duplicates an existing resume in SQLite.
   */
  async duplicateResume(id: string): Promise<ResumeItem | null> {
    const original = await this.getResumeById(id);
    if (!original) return null;

    return await this.createResume({
      title: `${original.title} (Copy)`,
      targetJobTitle: original.targetJobTitle,
      targetCompany: original.targetCompany,
      resume_data: original.resume_data,
    });
  },

  /**
   * Deletes a resume from SQLite.
   */
  async deleteResume(id: string): Promise<boolean> {
    try {
      await apiClient(`/resumes/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      const current = await this.getResumes();
      const updated = current.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(updated));
      return true;
    }
  },

  /**
   * Updates resume details and saves a new version snapshot in SQLite.
   */
  async updateResume(
    id: string,
    updates: Partial<ResumeItem> & { resume_data?: any; changelog?: string; create_version?: boolean; latest_score?: number }
  ): Promise<ResumeItem | null> {
    const payload: any = {
      title: updates.title,
      target_role: updates.targetJobTitle,
      target_company: updates.targetCompany,
      resume_data: updates.resume_data,
      create_version: updates.create_version ?? false,
      changelog: updates.changelog || 'Updated resume',
    };
    if (typeof updates.score === 'number') {
      payload.latest_score = updates.score;
    } else if (typeof updates.latest_score === 'number') {
      payload.latest_score = updates.latest_score;
    }

    try {
      const backendRes = await apiClient<any>(`/resumes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return mapBackendResumeToItem(backendRes);
    } catch (err) {
      console.error('Failed to update resume in backend:', err);
      return null;
    }
  },
};
