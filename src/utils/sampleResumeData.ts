import { ResumeStudioData } from '../types';

export const INITIAL_EMPTY_STUDIO_DATA: ResumeStudioData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  },
  careerObjective: {
    targetJobRole: '',
    targetIndustry: '',
    professionalSummary: '',
  },
  education: [
    {
      id: 'edu_1',
      institutionName: '',
      degree: '',
      branch: '',
      startYear: '',
      graduationYear: '',
      cgpaOrPercentage: '',
    },
  ],
  skills: {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    developerTools: [],
    coreSubjects: [],
    otherSkills: [],
  },
  projects: [
    {
      id: 'proj_1',
      projectName: '',
      projectDescription: '',
      technologiesUsed: '',
      projectLink: '',
      keyContributions: '',
      projectOutcome: '',
    },
  ],
  experience: [
    {
      id: 'exp_1',
      organisation: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      responsibilities: '',
      keyAchievements: '',
    },
  ],
  softSkills: [],
  certifications: [],
  achievements: [],
  extracurriculars: [],
  selectedTemplate: 'ATS Minimalist',
};

export const SAMPLE_CANDIDATE_DATA: ResumeStudioData = {
  personalInfo: {
    fullName: 'Sarah Lindqvist',
    email: 'sarah.lindqvist@eng.io',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedinUrl: 'linkedin.com/in/sarah-lindqvist',
    githubUrl: 'github.com/slindqvist',
    portfolioUrl: 'sarahlindqvist.dev',
  },
  careerObjective: {
    targetJobRole: 'Senior Cloud Systems Architect',
    targetIndustry: 'Enterprise Distributed Systems & Cloud Platforms',
    professionalSummary:
      'Senior Systems Architect with 6+ years designing high-throughput, fault-tolerant distributed infrastructure on AWS and Kubernetes. Demonstrated track record decoupling legacy microservices, slashing p99 latency by 45%, and maintaining 99.999% SLA uptime for multi-tenant enterprise platforms.',
  },
  education: [
    {
      id: 'edu_1',
      institutionName: 'University of California, Berkeley',
      degree: 'Bachelor of Science (B.S.)',
      branch: 'Computer Science & Engineering',
      startYear: '2016',
      graduationYear: '2020',
      cgpaOrPercentage: '3.86 / 4.00',
    },
  ],
  skills: {
    programmingLanguages: ['Go', 'TypeScript', 'Python', 'Rust', 'SQL'],
    frameworks: ['Node.js', 'Express', 'React', 'gRPC', 'Protobuf'],
    databases: ['PostgreSQL', 'Redis', 'Kafka', 'DynamoDB'],
    developerTools: ['Kubernetes (EKS)', 'Docker', 'Terraform', 'Prometheus', 'Git'],
    coreSubjects: ['Distributed Systems', 'Computer Networks', 'Operating Systems', 'Database Internals'],
    otherSkills: ['Zero-Downtime Migration', 'Chaos Engineering', 'API Design', 'System Architecture'],
  },
  projects: [
    {
      id: 'proj_1',
      projectName: 'High-Concurrency Event Ledger',
      projectDescription:
        'Engineered an append-only transaction ledger capable of processing 25,000 requests/sec with strict serializability guarantees.',
      technologiesUsed: 'Go, Kafka, Redis, PostgreSQL, Docker',
      projectLink: 'github.com/slindqvist/event-ledger',
      keyContributions:
        'Implemented Raft consensus log compaction and pipeline buffering, reducing memory consumption by 34% under peak burst loads.',
      projectOutcome: 'Adopted as the foundational reference architecture for real-time payment settlement pipeline.',
    },
  ],
  experience: [
    {
      id: 'exp_1',
      organisation: 'Stratos Cloud Systems',
      jobTitle: 'Senior Infrastructure Engineer',
      startDate: '2022-04',
      endDate: 'Present',
      isCurrent: true,
      responsibilities:
        'Orchestrated multi-region Kubernetes cluster federation across 3 cloud regions.\nDesigned automated canary rollout pipelines with Prometheus metric threshold validation.\nMentored 6 software engineers on distributed tracing and eBPF network profiling.',
      keyAchievements:
        'Reduced p99 API latency from 142ms to 12ms and sustained zero unplanned downtime during Black Friday 2024 peak traffic.',
    },
    {
      id: 'exp_2',
      organisation: 'Apex Payment Gateway',
      jobTitle: 'Software Engineer II (Backend)',
      startDate: '2020-07',
      endDate: '2022-03',
      isCurrent: false,
      responsibilities:
        'Engineered core transaction routing microservices handling 4.2M daily API invocations.\nRefactored monolithic PostgreSQL stored procedures into idiomatic Go microservices with database connection pooling.',
      keyAchievements:
        'Achieved 99.99% transaction reliability and lowered database CPU utilization by 40% through Redis caching.',
    },
  ],
  softSkills: [
    'Cross-Functional Leadership',
    'Distributed Systems Design',
    'Root-Cause Analysis (RCA)',
    'Agile Architecture Governance',
    'Technical Mentorship',
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Solutions Architect — Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2023-08',
      credentialId: 'AWS-PSA-994821',
    },
    {
      id: 'cert_2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: '2022-11',
      credentialId: 'CKA-883019',
    },
  ],
  achievements: [
    {
      id: 'ach_1',
      title: 'Global Tech Excellence Award (Platform Engineering)',
      date: '2023',
      description: 'Awarded for architecting zero-downtime multi-region Kubernetes migration across 3 cloud regions.',
    },
    {
      id: 'ach_2',
      title: 'Open Source Contributor of the Year',
      date: '2022',
      description: 'Recognized for upstream performance patches to Go HTTP client connection pooling.',
    },
  ],
  extracurriculars: [
    {
      id: 'extra_1',
      organization: 'Cloud Native Computing Foundation (CNCF) Meetup',
      role: 'Co-Organizer & Speaker',
      startDate: '2021',
      endDate: 'Present',
      description: 'Host bi-monthly technical workshops on Kubernetes reliability patterns and eBPF profiling for 400+ engineers.',
    },
  ],
  selectedTemplate: 'ATS Minimalist',
};
