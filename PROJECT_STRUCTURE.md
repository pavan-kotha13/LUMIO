# RESUME ARCHITECT — Project Foundation & Architecture

**Tagline**: *Don't just match the job. Prove your fit.*

Resume Architect is an AI-powered resume analysis, scoring and improvement platform. All core resume-building, reviewing, editing, and LinkedIn optimization features are accessible without payment-related restrictions.

---

## 1. Directory Structure

```
├── .env.example                       # Environment variables (GEMINI_API_KEY, VITE_API_URL)
├── index.html                         # Entry HTML with typography & metadata
├── metadata.json                      # Applet descriptor
├── package.json                       # Dependencies (React 19, Vite, Tailwind v4, React Router)
├── server.ts                          # Express server with Gemini AI API endpoints & Vite middlewares
├── PROJECT_STRUCTURE.md               # Project documentation
├── src/
│   ├── App.tsx                        # Root Router configuration
│   ├── index.css                      # Global design system tokens & shadows
│   ├── main.tsx                       # React application entrypoint
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx             # Reusable design system button
│   │   │   ├── Input.tsx              # Reusable input with validation & icon support
│   │   │   ├── Logo.tsx               # Brand mark & wordmark
│   │   │   ├── Navbar.tsx             # 3-Zone top navigation (no pricing)
│   │   │   └── Footer.tsx             # Quiet footer with 4 core capabilities
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx            # 9-item sidebar with Lucide React icons
│   │   │   ├── DashboardHeader.tsx    # Breadcrumbs & quick actions header
│   │   │   ├── HomeOverview.tsx       # Tools Hub, stats, recent score & resumes
│   │   │   ├── ResumeHistory.tsx      # Comprehensive My Resumes repository & actions
│   │   │   ├── CreateResumeModal.tsx  # Document creation modal
│   │   │   ├── ReviewResumeModal.tsx  # AI Score Engine compatibility review modal
│   │   │   ├── EditorView.tsx         # Resume Editor bullet quantification workspace
│   │   │   ├── LinkedInView.tsx       # LinkedIn Optimizer workspace
│   │   │   ├── ProfileView.tsx        # Candidate profile settings
│   │   │   └── SettingsView.tsx       # Integration status & local data controls
│   │   ├── studio/
│   │   │   ├── ResumeStudioView.tsx   # AI Resume Studio primary workspace & tab manager
│   │   │   ├── PersonalInfoSection.tsx# Section A: Personal Information
│   │   │   ├── CareerObjectiveSection.tsx # Section B: Objective & Gemini summary generator
│   │   │   ├── EducationSection.tsx   # Section C: Multi-entry education
│   │   │   ├── SkillsSection.tsx      # Section D: 6 categories & Gemini keyword recommender
│   │   │   ├── ProjectsSection.tsx    # Section E: Multi-entry projects & Gemini enhancer
│   │   │   ├── ExperienceSection.tsx  # Section F: Multi-entry experience & Gemini bullet rewriter
│   │   │   ├── ResumeDocumentPreview.tsx # Live single-column ATS document preview & export
│   │   │   └── ImproveExistingTab.tsx # Tab 2: Resume Reviewer integration preparation
│   │   ├── landing/
│   │   │   ├── Hero.tsx               # Specified hero heading & value proposition
│   │   │   ├── FeaturesSection.tsx    # 4 Core features (Score Engine, Builder, Reviewer, LinkedIn)
│   │   │   ├── ScoreEngineSpotlight.tsx # Central spotlight showcasing Score Engine
│   │   │   ├── HowItWorksSection.tsx  # 4-step workflow overview
│   │   │   └── CtaSection.tsx         # Conversion banner (free access, no paywalls)
│   │   └── score-engine/
│   │       ├── CircularScoreIndicator.tsx # Circular percentage indicator
│   │       ├── ScoreDisplay.tsx           # Master compatibility score card
│   │       ├── CategoryScoreBreakdown.tsx # 6-Pillar category breakdown
│   │       ├── MissingKeywordList.tsx     # Absent job keywords by importance
│   │       ├── SkillGapAnalysis.tsx       # Mandate vs. candidate evidence analysis
│   │       └── ImprovementRecommendations.tsx # Prioritized rewrites with score deltas
│   ├── context/
│   │   └── AuthContext.tsx            # Local dev auth state & hooks
│   ├── layouts/
│   │   ├── MainLayout.tsx             # General application layout
│   │   ├── AuthLayout.tsx             # Centered authentication layout
│   │   └── DashboardLayout.tsx        # Authenticated layout with 256px sidebar
│   ├── pages/
│   │   ├── LandingPage.tsx            # Marketing & platform overview
│   │   ├── LoginPage.tsx              # Email, password, show/hide, remember me, forgot modal
│   │   ├── SignupPage.tsx             # Full name, email, password, confirm password, validation
│   │   └── DashboardPage.tsx          # Authenticated Tools Dashboard & Resume History
│   ├── services/
│   │   ├── api.ts                     # Fetch client configured for FastAPI baseURL
│   │   ├── authService.ts             # Temporary dev auth service with backend hooks
│   │   ├── resumeService.ts           # Resume repository & history CRUD operations
│   │   └── scoreEngineService.ts      # Score engine service prepared for /api/v1/score-engine
│   ├── types/
│   │   └── index.ts                   # Domain models (ResumeItem, ScoreCategory, etc.)
│   └── utils/
│       ├── scoreCalculation.ts        # Transparent 6-pillar scoring formula & benchmark
│       └── validation.ts              # Form validation helpers
```

---

## 2. Design System Tokens

* **Canvas Background**: Warm off-white / cream (`#FAF8F5`, `#FCFBF8`, `#F3EFE7`)
* **Surfaces**: Crisp white (`#FFFFFF`) and warm surface (`#FAF8F5`)
* **Primary Accent**: Forest Green (`#1B4332`, hover `#143627`, tints `#EBF2EC`, `#2D6A4F`)
* **Charcoal Text**: Primary (`#1C201D`), Muted (`#57605A`), Subtle (`#848E88`)
* **Subtle Borders**: `#E5E1D7` (light grey / sand hairline)
* **Shadows**: Subtle, crisp card shadows (`shadow-card`, `shadow-subtle`)
* **Typography**: Plus Jakarta Sans for clean readability, monospace tabular figures for scores.

---

## 3. Four Core Capabilities

1. **AI Resume Score Engine**: Analyse resumes against job descriptions and calculate a transparent match score.
2. **Resume Builder**: Create ATS-conscious resumes using candidate information.
3. **Resume Reviewer**: Identify skill gaps, missing keywords and formatting issues.
4. **LinkedIn Optimizer**: Improve LinkedIn headlines, About sections, experience and skills.

---

## 4. Score Engine Architecture (6 Evaluation Pillars)

The future scoring engine deterministically calculates overall match scores using transparent weighted categories (no hallucinated random numbers):

1. **Job Description Keyword Alignment (25%)**
2. **Technical Skill Alignment (25%)**
3. **Work Experience Relevance (20%)**
4. **Project Relevance (15%)**
5. **Resume Formatting & Readability (10%)**
6. **Education Relevance (5%)**

$$\text{Overall Score} = \sum (\text{Category Score} \times \text{Weight})$$

---

## 5. Backend & AI Readiness

* **FastAPI Backend**: `src/services/api.ts` connects to `VITE_API_URL` (defaults to `/api/v1`) with automatic Bearer token handling.
* **SQLite Database**: Models in `src/types/index.ts` map directly to SQLite tables for users, resumes, job descriptions, and scoring evaluations.
* **Gemini AI API**: Prepared for prompt pipelines to extract keywords and rewrite bullets without inventing final score numbers.
* **PDF & DOCX Processing**: Architectural hooks ready for multipart file uploads and ATS semantic text extraction.
