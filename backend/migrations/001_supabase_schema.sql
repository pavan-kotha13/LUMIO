-- ==============================================================================
-- RESUME ARCHITECT – SUPABASE POSTGRESQL SCHEMA (MIGRATION 001)
-- ==============================================================================
-- Designed for Supabase PostgreSQL, Supabase Auth, and Row Level Security (RLS).
-- Supports all 11 relational tables with backward-compatible legacy ID tracking.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Schema Migration Tracking Table
CREATE TABLE IF NOT EXISTS public._migration_id_map (
    legacy_table TEXT NOT NULL,
    legacy_id TEXT NOT NULL,
    new_uuid UUID NOT NULL,
    migrated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (legacy_table, legacy_id)
);

-- ==============================================================================
-- TABLE 1: PROFILES (Extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile row on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- TABLE 2: CANDIDATE_PROFILES (Structured Background & Facts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    personal_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    education JSONB NOT NULL DEFAULT '[]'::jsonb,
    skills JSONB NOT NULL DEFAULT '{"programmingLanguages": [], "frameworks": [], "databases": [], "developerTools": []}'::jsonb,
    projects JSONB NOT NULL DEFAULT '[]'::jsonb,
    experience JSONB NOT NULL DEFAULT '[]'::jsonb,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user ON public.candidate_profiles(user_id);
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own candidate profile" ON public.candidate_profiles;
CREATE POLICY "Users can manage own candidate profile" ON public.candidate_profiles
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TABLE 3: RESUMES (Active Candidate Resume Documents)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE, -- Preserves SQLite IDs (e.g., 'res-a-001') for non-breaking client calls
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_role TEXT NOT NULL DEFAULT 'Software Engineer',
    target_company TEXT,
    resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    latest_score INTEGER,
    score_grade TEXT DEFAULT 'Competitive',
    storage_pdf_path TEXT, -- Pointer to Supabase Storage PDF asset
    storage_docx_path TEXT, -- Pointer to Supabase Storage DOCX asset
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_legacy_id ON public.resumes(legacy_id);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own resumes" ON public.resumes;
CREATE POLICY "Users can manage own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TABLE 4: RESUME_VERSIONS (Immutable Version History Snapshots)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE,
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changelog TEXT DEFAULT 'Snapshot created',
    resume_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_resume_version UNIQUE(resume_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_legacy ON public.resume_versions(legacy_id);
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view versions of their resumes" ON public.resume_versions;
CREATE POLICY "Users view versions of their resumes" ON public.resume_versions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_versions.resume_id AND r.user_id = auth.uid())
    );

-- ==============================================================================
-- TABLE 5: JOB_DESCRIPTIONS (Saved Benchmark Postings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT,
    source_url TEXT,
    raw_text TEXT NOT NULL,
    extracted_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_job_descriptions_user ON public.job_descriptions(user_id);
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own job descriptions" ON public.job_descriptions;
CREATE POLICY "Users manage own job descriptions" ON public.job_descriptions
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TABLE 6: RESUME_ANALYSES (Score Engine Evaluation Runs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE SET NULL,
    job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    target_role TEXT,
    target_job_description TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    score_grade TEXT NOT NULL DEFAULT 'Competitive',
    category_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
    matched_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    partially_matched JSONB NOT NULL DEFAULT '[]'::jsonb,
    unmentioned_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    scoring_explanation TEXT,
    analysis_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analyses_resume ON public.resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_analyses_legacy_id ON public.resume_analyses(legacy_id);
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view analyses of own resumes" ON public.resume_analyses;
CREATE POLICY "Users view analyses of own resumes" ON public.resume_analyses
    FOR ALL USING (
        resume_id IS NULL OR EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_analyses.resume_id AND r.user_id = auth.uid())
    );

-- ==============================================================================
-- TABLE 7: EVIDENCE_MAPS (Normalized Mandate vs Candidate Proof)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evidence_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Technical Qualification',
    status TEXT NOT NULL CHECK (status IN ('MATCHED', 'PARTIAL', 'NOT FOUND')),
    resume_evidence TEXT,
    location TEXT,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_evidence_maps_analysis ON public.evidence_maps(analysis_id);
ALTER TABLE public.evidence_maps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view evidence map of own analyses" ON public.evidence_maps;
CREATE POLICY "Users view evidence map of own analyses" ON public.evidence_maps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.resume_analyses a
            JOIN public.resumes r ON r.id = a.resume_id
            WHERE a.id = evidence_maps.analysis_id AND r.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- TABLE 8: TRUTHGUARD_RESULTS (Audited AI Rewrites & Fact Validation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.truthguard_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE SET NULL,
    section TEXT NOT NULL DEFAULT 'experience',
    original_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    truthguard_status TEXT NOT NULL CHECK (truthguard_status IN ('SUPPORTED', 'NEEDS_CONFIRMATION', 'UNSUPPORTED')),
    verification_rationale TEXT NOT NULL,
    candidate_approved BOOLEAN NOT NULL DEFAULT FALSE,
    applied_to_resume BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_truthguard_resume ON public.truthguard_results(resume_id);
ALTER TABLE public.truthguard_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage TruthGuard results for own resumes" ON public.truthguard_results;
CREATE POLICY "Users manage TruthGuard results for own resumes" ON public.truthguard_results
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = truthguard_results.resume_id AND r.user_id = auth.uid())
    );

-- ==============================================================================
-- TABLE 9: LINKEDIN_PROFILES (Candidate LinkedIn Data & Optimizations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.linkedin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    optimised_content JSONB DEFAULT '{}'::jsonb,
    latest_score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_user ON public.linkedin_profiles(user_id);
ALTER TABLE public.linkedin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own LinkedIn profile" ON public.linkedin_profiles;
CREATE POLICY "Users manage own LinkedIn profile" ON public.linkedin_profiles
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TABLE 10: LINKEDIN_VERSIONS (Version History for LinkedIn Headlines & Bios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.linkedin_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_profile_id UUID NOT NULL REFERENCES public.linkedin_profiles(id) ON DELETE CASCADE,
    version_name TEXT NOT NULL,
    profile_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_linkedin_versions_profile ON public.linkedin_versions(linkedin_profile_id);
ALTER TABLE public.linkedin_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own LinkedIn versions" ON public.linkedin_versions;
CREATE POLICY "Users view own LinkedIn versions" ON public.linkedin_versions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.linkedin_profiles lp WHERE lp.id = linkedin_versions.linkedin_profile_id AND lp.user_id = auth.uid())
    );

-- ==============================================================================
-- TABLE 11: ACTIVITY_LOGS (User Audit Events)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own activity logs" ON public.activity_logs;
CREATE POLICY "Users view own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);
