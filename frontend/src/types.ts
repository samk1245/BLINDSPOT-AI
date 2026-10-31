export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  role: UserRole;
  full_name?: string;
}

export type CoverageStatus = 
  | "SUPPORTED"
  | "PARTIALLY_SUPPORTED"
  | "MISSING"
  | "CONFLICTING"
  | "POTENTIALLY_OUTDATED"
  | "UNVERIFIED";

export type RequirementCategory =
  | "ELIGIBILITY"
  | "FINANCIAL"
  | "DOCUMENTATION"
  | "DEADLINES"
  | "PROCEDURES"
  | "EXCEPTIONS"
  | "GENERAL";

export interface ResearchRequirement {
  id: string;
  category: RequirementCategory;
  description: string;
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  expected_evidence: string;
  verification_criteria: string;
  coverage_status: CoverageStatus;
  created_at: string;
}

export interface EvidencePassage {
  id: string;
  source_id: string;
  passage_index: number;
  text: string;
  char_offset_start: number;
  char_offset_end: number;
}

export interface ExtractedClaim {
  id: string;
  source_id: string;
  passage_id?: string;
  claim_text: string;
  topic_category: string;
  confidence_score: number;
  is_temporal: boolean;
  temporal_date?: string;
}

export interface Source {
  id: string;
  investigation_id: string;
  source_type: "URL" | "PDF" | "OFFICIAL_PORTAL" | "RESEARCH_REPORT";
  url?: string;
  title: string;
  domain?: string;
  retrieval_timestamp: string;
  publication_date?: string;
  last_updated_date?: string;
  content_hash: string;
  reliability_score: number;
  status: "PENDING" | "PARSED" | "FAILED";
  passages: EvidencePassage[];
  claims: ExtractedClaim[];
}

export interface InformationGap {
  id: string;
  investigation_id: string;
  requirement_id?: string;
  gap_title: string;
  description: string;
  category: string;
  classification: CoverageStatus;
  impact_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  suggested_action: string;
  epistemic_note: string;
  created_at: string;
}

export interface Conflict {
  id: string;
  investigation_id: string;
  claim_a_id?: string;
  claim_b_id?: string;
  claim_a_text: string;
  claim_b_text: string;
  source_a_title: string;
  source_b_title: string;
  source_a_url?: string;
  source_b_url?: string;
  source_a_date?: string;
  source_b_date?: string;
  conflict_type: "DIRECT_FACTUAL" | "TEMPORAL_SUPERSEDED" | "SCOPE_DIFFERENCE" | "CONDITIONAL_DIFFERENCE";
  difference_explanation: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  resolution_guidance: string;
  created_at: string;
}

export interface VerificationTask {
  id: string;
  investigation_id: string;
  title: string;
  reason_it_matters: string;
  suggested_official_source: string;
  supporting_evidence_snippet?: string;
  priority: "URGENT" | "HIGH" | "NORMAL";
  status: "PENDING" | "VERIFIED" | "DISMISSED";
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface ReadinessBreakdown {
  score: number;
  band: string;
  recommendation: string;
  components: {
    requirement_coverage: { score: number; max: number; details: string };
    source_reliability: { score: number; max: number; details: string };
    temporal_freshness: { score: number; max: number; details: string };
  };
  penalties: {
    unresolved_conflicts: { deduction: number; count: number };
    critical_gaps: { deduction: number; count: number };
    unverified_tasks: { deduction: number; count: number };
  };
  limitations: string[];
}

export interface Investigation {
  id: string;
  user_id: string;
  title: string;
  research_question: string;
  objective: string;
  domain: string;
  status: "DRAFT" | "ANALYZING" | "COMPLETED" | "FAILED";
  readiness_score: number;
  readiness_breakdown: string;
  created_at: string;
  updated_at: string;
  requirements_count: number;
  sources_count: number;
  gaps_count: number;
  conflicts_count: number;
  tasks_count: number;
}

export interface GraphNode {
  id: string;
  type?: string;
  data: {
    label: string;
    type: "OBJECTIVE" | "REQUIREMENT" | "SOURCE" | "GAP" | "CONFLICT" | "TASK";
    subtitle?: string;
    description?: string;
    domain?: string;
    readiness?: number;
    importance?: string;
    status?: string;
    sourceType?: string;
    date?: string;
    fingerprint?: string;
    evidenceSnippet?: string;
    classification?: string;
    impact?: string;
    epistemicNote?: string;
    claimA?: string;
    claimB?: string;
    sourceA?: string;
    sourceB?: string;
    explanation?: string;
    priority?: string;
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface InvestigationReport {
  id: string;
  investigation_id: string;
  title: string;
  summary: string;
  report_json: string;
  html_content: string;
  created_at: string;
}
