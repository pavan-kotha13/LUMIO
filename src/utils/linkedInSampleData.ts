import { LinkedInProfileData } from '../types/linkedin';
import { ResumeItem, ResumeStudioData } from '../types';

export const EMPTY_LINKEDIN_PROFILE: LinkedInProfileData = {
  personalInfo: {
    fullName: '',
    currentTitleOrStatus: '',
    location: '',
    targetRole: '',
    targetIndustry: '',
    openToWork: true,
  },
  headline: '',
  about: '',
  experience: [
    {
      id: 'exp_1',
      company: '',
      jobTitle: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: true,
      bullets: [''],
    },
  ],
  education: [
    {
      id: 'edu_1',
      degree: '',
      institution: '',
      graduationYear: '',
      details: '',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: '',
      tech: '',
      description: '',
      bullets: [''],
    },
  ],
  skills: {
    technical: [],
    softAndTools: [],
  },
  certifications: [],
};

export const SAMPLE_EXPERIENCED_LINKEDIN_PROFILE: LinkedInProfileData = {
  personalInfo: {
    fullName: 'Sarah Lindqvist',
    currentTitleOrStatus: 'Senior Infrastructure Engineer',
    location: 'San Francisco Bay Area',
    targetRole: 'Staff Distributed Systems Architect',
    targetIndustry: 'Cloud Platforms & High-Concurrency Systems',
    openToWork: true,
  },
  headline: 'Senior Infrastructure Engineer at Stratos | Cloud Architecture & High-Concurrency Systems',
  about:
    'Systems engineer with 6+ years designing fault-tolerant, high-throughput distributed infrastructure on AWS and Kubernetes. Led cross-functional teams decoupling core microservices, cutting p99 latency by 45%, and keeping 99.999% SLA availability for enterprise platforms. Passionate about consensus algorithms, eBPF telemetry, and chaos engineering.',
  experience: [
    {
      id: 'exp_1',
      company: 'Stratos Cloud Systems',
      jobTitle: 'Senior Infrastructure Engineer',
      location: 'San Francisco, CA',
      startDate: 'Apr 2022',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Orchestrated multi-region Kubernetes cluster federation across 3 AWS cloud regions.',
        'Designed automated canary deployment pipelines with Prometheus metric threshold verification.',
        'Mentored 6 software engineers on distributed tracing and eBPF network profiling.',
        'Reduced p99 API latency from 142ms to 12ms and sustained zero unplanned downtime during peak traffic.',
      ],
    },
    {
      id: 'exp_2',
      company: 'Apex Payment Gateway',
      jobTitle: 'Software Engineer II (Backend)',
      location: 'San Jose, CA',
      startDate: 'Jul 2020',
      endDate: 'Mar 2022',
      isCurrent: false,
      bullets: [
        'Engineered core transaction routing microservices handling 4.2M daily API invocations.',
        'Refactored monolithic PostgreSQL stored procedures into idiomatic Go microservices with connection pooling.',
        'Achieved 99.99% transaction reliability and lowered database CPU utilization by 40% through Redis caching.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_1',
      degree: 'B.S. in Computer Science & Engineering',
      institution: 'University of California, Berkeley',
      graduationYear: '2020',
      details: 'GPA: 3.86/4.00. Focus on Distributed Systems and Computer Networks.',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'High-Concurrency Event Ledger',
      tech: 'Go, Kafka, Redis, PostgreSQL, Docker',
      description:
        'Engineered an append-only transaction ledger capable of processing 25,000 requests/sec with strict serializability.',
      bullets: [
        'Implemented Raft consensus log compaction and pipeline buffering, cutting memory usage by 34%.',
        'Adopted across 4 microservices as the reference event streaming architecture.',
      ],
      link: 'github.com/slindqvist/event-ledger',
    },
  ],
  skills: {
    technical: [
      'Go',
      'Kubernetes',
      'Kafka',
      'AWS',
      'Docker',
      'PostgreSQL',
      'Redis',
      'gRPC',
      'Terraform',
      'TypeScript',
      'Prometheus',
      'Distributed Systems',
    ],
    softAndTools: [
      'System Architecture',
      'Cross-functional Leadership',
      'Zero-Downtime Migration',
      'Engineering Mentorship',
      'Technical Incident Response',
    ],
  },
  certifications: [
    {
      id: 'cert_1',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Linux Foundation / CNCF',
      year: '2023',
    },
    {
      id: 'cert_2',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      year: '2022',
    },
  ],
};

export const SAMPLE_FRESHER_LINKEDIN_PROFILE: LinkedInProfileData = {
  personalInfo: {
    fullName: 'David K. Chen',
    currentTitleOrStatus: 'Computer Science Graduate | Aspiring Full-Stack Software Engineer',
    location: 'Seattle, WA',
    targetRole: 'Junior Full-Stack Software Engineer',
    targetIndustry: 'Technology & Web Applications',
    openToWork: true,
  },
  headline: 'CS Graduate @ UW | Full-Stack Developer (React, TypeScript, Node.js, Python) | Open to Entry-Level Roles',
  about:
    'Recent Computer Science graduate from University of Washington passionate about building responsive, user-centric web applications and robust REST APIs. Built 4 full-stack applications with React, TypeScript, Node.js, and PostgreSQL. Experienced in agile collaborative team projects, git workflows, and unit testing. Seeking an entry-level software engineering role where I can contribute clean code and learn from seasoned engineering leaders.',
  experience: [
    {
      id: 'exp_1',
      company: 'TechBridge Solutions',
      jobTitle: 'Software Engineering Intern',
      location: 'Seattle, WA',
      startDate: 'Jun 2024',
      endDate: 'Aug 2024',
      isCurrent: false,
      bullets: [
        'Developed reusable UI components in React and TypeScript for internal customer onboarding portal.',
        'Collaborated with backend engineers to integrate RESTful API endpoints and validate payload schemas with Zod.',
        'Authored Jest and React Testing Library unit tests achieving 88% test coverage on new UI modules.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_1',
      degree: 'B.S. in Computer Science',
      institution: 'University of Washington',
      graduationYear: '2025',
      details: 'Dean’s Honor List. Coursework: Data Structures, Algorithms, Web Programming, Database Systems.',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'DevCollab — Real-Time Developer Workspace',
      tech: 'React, Node.js, WebSocket, Tailwind CSS, PostgreSQL',
      description: 'Collaborative task and code snippet sharing application with real-time websocket synchronization.',
      bullets: [
        'Built full-stack web app with JWT authentication, responsive UI, and persistent Postgres storage.',
        'Integrated WebSockets for instant document update broadcasts across concurrent client sessions.',
      ],
      link: 'github.com/davidkchen/devcollab',
    },
    {
      id: 'proj_2',
      title: 'SmartExpense — Automated Receipt Scanner',
      tech: 'Python, FastAPI, React, SQLite, OpenCV',
      description: 'Web dashboard allowing users to upload receipts and automatically categorize expense records.',
      bullets: [
        'Created RESTful endpoints with FastAPI and processed image inputs with OCR pipeline.',
      ],
    },
  ],
  skills: {
    technical: [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'PostgreSQL',
      'Tailwind CSS',
      'Git / GitHub',
      'REST APIs',
      'HTML5/CSS3',
      'Jest',
    ],
    softAndTools: [
      'Agile / Scrum',
      'Problem Solving',
      'Team Collaboration',
      'Fast Learner',
      'Code Reviews',
    ],
  },
  certifications: [
    {
      id: 'cert_1',
      name: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Coursera / Meta',
      year: '2024',
    },
  ],
};

/**
 * Transforms an existing Resume Architect resume or studio data into initial LinkedInProfileData.
 */
export function convertResumeToLinkedInProfile(
  resume: ResumeItem,
  studioData?: ResumeStudioData | null
): LinkedInProfileData {
  if (studioData) {
    return {
      personalInfo: {
        fullName: studioData.personalInfo.fullName || resume.title.split('—')[0].trim(),
        currentTitleOrStatus:
          studioData.experience[0]?.jobTitle ||
          studioData.careerObjective.targetJobRole ||
          'Software Professional',
        location: studioData.personalInfo.location || 'United States',
        targetRole: studioData.careerObjective.targetJobRole || resume.targetJobTitle,
        targetIndustry: studioData.careerObjective.targetIndustry || resume.targetCompany || 'Technology',
        openToWork: true,
      },
      headline: `${studioData.careerObjective.targetJobRole || resume.targetJobTitle} | ${
        resume.tags.slice(0, 4).join(', ') || 'Software Engineering'
      }`,
      about: studioData.careerObjective.professionalSummary || resume.summarySnippet,
      experience: studioData.experience.map((exp, idx) => ({
        id: `exp_${idx + 1}`,
        company: exp.organisation,
        jobTitle: exp.jobTitle,
        startDate: exp.startDate,
        endDate: exp.isCurrent ? 'Present' : exp.endDate,
        isCurrent: !!exp.isCurrent,
        bullets: [
          ...exp.responsibilities.split('\n').filter((b) => b.trim().length > 0),
          ...(exp.keyAchievements ? exp.keyAchievements.split('\n').filter((b) => b.trim().length > 0) : []),
        ],
      })),
      education: studioData.education.map((edu, idx) => ({
        id: `edu_${idx + 1}`,
        degree: `${edu.degree} ${edu.branch ? `in ${edu.branch}` : ''}`.trim(),
        institution: edu.institutionName,
        graduationYear: edu.graduationYear,
        details: edu.cgpaOrPercentage ? `GPA / Score: ${edu.cgpaOrPercentage}` : '',
      })),
      projects: studioData.projects.map((proj, idx) => ({
        id: `proj_${idx + 1}`,
        title: proj.projectName,
        tech: proj.technologiesUsed,
        description: proj.projectDescription,
        bullets: [
          ...(proj.keyContributions ? proj.keyContributions.split('\n').filter((b) => b.trim().length > 0) : []),
          ...(proj.projectOutcome ? [proj.projectOutcome] : []),
        ],
        link: proj.projectLink,
      })),
      skills: {
        technical: [
          ...studioData.skills.programmingLanguages,
          ...studioData.skills.frameworks,
          ...studioData.skills.databases,
          ...studioData.skills.developerTools,
        ],
        softAndTools: [
          ...studioData.skills.coreSubjects,
          ...studioData.skills.otherSkills,
        ],
      },
      certifications: [
        {
          id: 'cert_1',
          name: 'Professional Industry Certification',
          issuer: 'Accredited Authority',
          year: '2024',
        },
      ],
    };
  }

  // Fallback from ResumeItem alone
  return {
    personalInfo: {
      fullName: resume.title.split('—')[0].trim() || 'Candidate Name',
      currentTitleOrStatus: resume.targetJobTitle,
      location: 'San Francisco, CA',
      targetRole: resume.targetJobTitle,
      targetIndustry: resume.targetCompany || 'Technology',
      openToWork: true,
    },
    headline: `${resume.targetJobTitle} | Specializing in ${resume.tags.slice(0, 3).join(', ')}`,
    about: resume.summarySnippet,
    experience: [
      {
        id: 'exp_1',
        company: resume.targetCompany || 'Enterprise Tech Co',
        jobTitle: resume.targetJobTitle,
        startDate: '2022',
        endDate: 'Present',
        isCurrent: true,
        bullets: [
          `Spearheaded development initiatives focused on ${resume.tags.slice(0, 2).join(' and ')}.`,
          'Collaborated with cross-functional product and engineering teams to deliver high-impact deliverables.',
          'Maintained high standards of code quality, testing coverage, and technical documentation.',
        ],
      },
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Technology',
        graduationYear: '2021',
        details: 'Core focus in Distributed Systems, Data Structures, and Software Architecture.',
      },
    ],
    projects: [
      {
        id: 'proj_1',
        title: `${resume.tags[0] || 'Cloud'} Architecture Project`,
        tech: resume.tags.join(', '),
        description: 'Engineered high-throughput service handling production transaction volume.',
        bullets: [
          'Engineered resilient modular services improving throughput and lowering operational latency.',
        ],
      },
    ],
    skills: {
      technical: resume.tags.length > 0 ? resume.tags : ['TypeScript', 'React', 'Node.js'],
      softAndTools: ['System Design', 'Agile/Scrum', 'Git Workflow', 'API Architecture'],
    },
    certifications: [],
  };
}
