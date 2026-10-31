import { ResumeScoreEvaluation, ScoreCategory } from '../types';

/**
 * Transparent Scoring Architecture:
 * The overall score is calculated as a weighted arithmetic mean of the 6 pillars.
 * Exact canonical weights matching Resume Architect specification:
 * - Technical Skills: 30% (0.30)
 * - Keyword Alignment: 20% (0.20)
 * - Project Relevance: 20% (0.20)
 * - Work Experience: 15% (0.15)
 * - Education Relevance: 5% (0.05)
 * - Formatting & Readability: 10% (0.10)
 * Total = 100%
 */

export const CATEGORY_WEIGHTS: Record<string, number> = {
  'technical-skills': 0.30,
  'keyword-alignment': 0.20,
  'project-relevance': 0.20,
  'experience-relevance': 0.15,
  'education-relevance': 0.05,
  'formatting-readability': 0.10,
};

/**
 * Calculate the overall score deterministically from category scores.
 */
export const calculateOverallScore = (categories: ScoreCategory[]): number => {
  const weightedSum = categories.reduce((acc, cat) => {
    const weight = CATEGORY_WEIGHTS[cat.id] ?? cat.weight ?? 0;
    return acc + cat.score * weight;
  }, 0);

  return Math.round(weightedSum);
};

export const getScoreGrade = (score: number): ResumeScoreEvaluation['scoreGrade'] => {
  if (score >= 90) return 'Exceptional';
  if (score >= 78) return 'Strong';
  if (score >= 65) return 'Competitive';
  return 'Needs Revision';
};

/**
 * Canonical benchmark evaluation for component testing and visual verification.
 * Deterministic and non-random, calibrated against a Staff Systems Engineer role.
 */
export const CANONICAL_BENCHMARK_EVALUATION: ResumeScoreEvaluation = {
  id: 'eval_benchmark_staff_eng_01',
  overallScore: 82, // (74*0.25) + (88*0.25) + (85*0.20) + (80*0.15) + (90*0.10) + (70*0.05) = 18.5 + 22.0 + 17.0 + 12.0 + 9.0 + 3.5 = 82
  scoreGrade: 'Strong',
  evaluatedAt: '2026-10-30T10:00:00Z',
  jobTitle: 'Staff Distributed Systems Engineer',
  companyName: 'High-Concurrency Cloud Platform',
  resumeFileName: 'Marcus_Vance_Resume_Staff.pdf',
  methodologyNotes:
    'Score computed using the Resume Architect 6-Pillar Weighted Alignment Formula. All metrics verify against explicit job description requirements and technical keywords.',
  categories: [
    {
      id: 'keyword-alignment',
      name: 'Job Description Keyword Alignment',
      score: 74,
      weight: 0.25,
      status: 'moderate',
      summary: '17 of 23 required keywords and phrases detected in the resume text.',
      metrics: { matched: 17, total: 23, unit: 'keywords' },
    },
    {
      id: 'technical-skills',
      name: 'Technical Skill Alignment',
      score: 88,
      weight: 0.25,
      status: 'optimal',
      summary: 'Strong match on Go, Kubernetes, Kafka, and Redis; missing gRPC and eBPF observability.',
      metrics: { matched: 14, total: 16, unit: 'skills' },
    },
    {
      id: 'experience-relevance',
      name: 'Work Experience Relevance',
      score: 85,
      weight: 0.20,
      status: 'optimal',
      summary: '6+ years in high-concurrency microservices directly maps to the 5+ years requirement.',
      metrics: { matched: 6, total: 7, unit: 'reqs' },
    },
    {
      id: 'project-relevance',
      name: 'Project Relevance',
      score: 80,
      weight: 0.15,
      status: 'optimal',
      summary: 'Payment ledger decoupling project validates high-scale distributed transaction ability.',
      metrics: { matched: 4, total: 5, unit: 'projects' },
    },
    {
      id: 'formatting-readability',
      name: 'Resume Formatting & Readability',
      score: 90,
      weight: 0.10,
      status: 'optimal',
      summary: 'Single-column ATS-friendly semantic layout, clean margins, standard section headers.',
      metrics: { matched: 9, total: 10, unit: 'checks' },
    },
    {
      id: 'education-relevance',
      name: 'Education Relevance',
      score: 70,
      weight: 0.05,
      status: 'moderate',
      summary: 'B.S. in Computer Science satisfies the minimum degree requirement.',
      metrics: { matched: 1, total: 1, unit: 'degree' },
    },
  ],
  missingKeywords: [
    {
      id: 'kw_1',
      term: 'gRPC Protobuf',
      category: 'Critical Mandate',
      jobFrequency: 4,
      importance: 'critical',
    },
    {
      id: 'kw_2',
      term: 'eBPF Kernel Profiling',
      category: 'Technical Tool',
      jobFrequency: 2,
      importance: 'important',
    },
    {
      id: 'kw_3',
      term: 'Chaos Engineering / Litmus',
      category: 'Industry Practice',
      jobFrequency: 2,
      importance: 'important',
    },
    {
      id: 'kw_4',
      term: 'OpenTelemetry Tracing',
      category: 'Technical Tool',
      jobFrequency: 3,
      importance: 'critical',
    },
    {
      id: 'kw_5',
      term: 'Zero-Downtime Blue/Green Deployments',
      category: 'Critical Mandate',
      jobFrequency: 3,
      importance: 'critical',
    },
  ],
  skillGaps: [
    {
      id: 'sg_1',
      skillName: 'gRPC & Protobuf Service Definitions',
      category: 'API Protocols',
      status: 'missing',
      requiredContext: 'Mandatory for inter-service RPC communication layer with sub-millisecond overhead.',
      candidateEvidence: null,
      recommendation:
        'Highlight experience designing Protocol Buffer contracts and streaming RPC endpoints under microservices experience.',
    },
    {
      id: 'sg_2',
      skillName: 'Distributed Tracing (OpenTelemetry)',
      category: 'Observability',
      status: 'partial',
      requiredContext: 'Required to instrument multi-service latency bottlenecks across the payment pipeline.',
      candidateEvidence: 'Mentioned Prometheus and Grafana dashboards, but no distributed trace propagation.',
      recommendation:
        'Specify how you propagated span context across microservice boundaries to diagnose p99 latency regressions.',
    },
    {
      id: 'sg_3',
      skillName: 'eBPF / Low-level Linux Networking',
      category: 'System Internals',
      status: 'missing',
      requiredContext: 'Preferred for network debugging and packet inspection in cloud-native clusters.',
      candidateEvidence: null,
      recommendation:
        'If you have used Cilium or kernel-level network profiling, add a clear mention in your infrastructure competencies.',
    },
  ],
  recommendations: [
    {
      id: 'rec_1',
      category: 'keyword-alignment',
      title: 'Incorporate Missing High-Frequency Protocol Keywords',
      description:
        'The job post mentions gRPC and Protocol Buffers 4 times. Add explicit phrasing where you built service-to-service communication.',
      priority: 'high',
      estimatedScoreDelta: 6,
      sampleBefore: 'Built REST APIs for transaction processing between microservices.',
      sampleAfter:
        'Designed high-throughput gRPC and Protobuf RPC contracts between 12 microservices, reducing payload serialization latency by 45%.',
    },
    {
      id: 'rec_2',
      category: 'technical-skills',
      title: 'Substantiate Distributed Tracing & Observability Evidence',
      description:
        'Demonstrate distributed trace context propagation to prove you diagnose bottlenecks at enterprise scale.',
      priority: 'high',
      estimatedScoreDelta: 5,
      sampleBefore: 'Set up logging and monitoring with Prometheus and Grafana.',
      sampleAfter:
        'Instrumented OpenTelemetry distributed tracing across 18 microservices, enabling root-cause isolation of p99 latency spikes within 4 minutes.',
    },
    {
      id: 'rec_3',
      category: 'experience-relevance',
      title: 'Highlight Zero-Downtime Deployment SLA Achievements',
      description:
        'The hiring team explicitly emphasizes zero-downtime reliability in the job description.',
      priority: 'medium',
      estimatedScoreDelta: 4,
      sampleBefore: 'Maintained production deployments on Kubernetes.',
      sampleAfter:
        'Executed zero-downtime canary and blue/green deployments on EKS clusters handling 8.4M daily transactions.',
    },
  ],
};
