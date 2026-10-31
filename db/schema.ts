import { pgTable, text, boolean, integer, doublePrecision, timestamp, index } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("users", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  fullName: text("full_name"),
  role: text().notNull().default("USER"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appSecrets = pgTable("app_secrets", {
  name: text().primaryKey(),
  value: text().notNull(),
  createdAt: createdAt(),
});

export const investigations = pgTable(
  "investigations",
  {
    id: text().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text().notNull(),
    researchQuestion: text("research_question").notNull(),
    objective: text().notNull(),
    domain: text().notNull().default("General"),
    status: text().notNull().default("DRAFT"),
    readinessScore: doublePrecision("readiness_score").notNull().default(0),
    readinessBreakdown: text("readiness_breakdown").notNull().default("{}"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("investigations_user_idx").on(t.userId)],
);

const investigationRef = () =>
  text("investigation_id").notNull().references(() => investigations.id, { onDelete: "cascade" });

export const requirements = pgTable(
  "research_requirements",
  {
    id: text().primaryKey(),
    investigationId: investigationRef(),
    category: text().notNull().default("GENERAL"),
    description: text().notNull(),
    importance: text().notNull().default("HIGH"),
    expectedEvidence: text("expected_evidence").notNull(),
    verificationCriteria: text("verification_criteria").notNull(),
    coverageStatus: text("coverage_status").notNull().default("UNVERIFIED"),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("requirements_inv_idx").on(t.investigationId)],
);

export const sources = pgTable(
  "sources",
  {
    id: text().primaryKey(),
    investigationId: investigationRef(),
    sourceType: text("source_type").notNull().default("URL"),
    url: text(),
    title: text().notNull(),
    domain: text(),
    retrievalTimestamp: timestamp("retrieval_timestamp", { withTimezone: true }).notNull().defaultNow(),
    publicationDate: text("publication_date"),
    lastUpdatedDate: text("last_updated_date"),
    rawContent: text("raw_content").notNull(),
    contentHash: text("content_hash").notNull(),
    reliabilityScore: doublePrecision("reliability_score").notNull().default(0.8),
    status: text().notNull().default("PARSED"),
    createdAt: createdAt(),
  },
  (t) => [index("sources_inv_idx").on(t.investigationId)],
);

export const passages = pgTable(
  "evidence_passages",
  {
    id: text().primaryKey(),
    sourceId: text("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
    passageIndex: integer("passage_index").notNull(),
    text: text().notNull(),
    charOffsetStart: integer("char_offset_start").notNull().default(0),
    charOffsetEnd: integer("char_offset_end").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("passages_source_idx").on(t.sourceId)],
);

export const gaps = pgTable(
  "information_gaps",
  {
    id: text().primaryKey(),
    investigationId: investigationRef(),
    requirementId: text("requirement_id"),
    gapTitle: text("gap_title").notNull(),
    description: text().notNull(),
    category: text().notNull().default("General"),
    classification: text().notNull().default("MISSING"),
    impactLevel: text("impact_level").notNull().default("HIGH"),
    suggestedAction: text("suggested_action").notNull(),
    epistemicNote: text("epistemic_note").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("gaps_inv_idx").on(t.investigationId)],
);

export const conflicts = pgTable(
  "conflicts",
  {
    id: text().primaryKey(),
    investigationId: investigationRef(),
    claimAText: text("claim_a_text").notNull(),
    claimBText: text("claim_b_text").notNull(),
    sourceATitle: text("source_a_title").notNull(),
    sourceBTitle: text("source_b_title").notNull(),
    sourceAUrl: text("source_a_url"),
    sourceBUrl: text("source_b_url"),
    sourceADate: text("source_a_date"),
    sourceBDate: text("source_b_date"),
    conflictType: text("conflict_type").notNull().default("DIRECT_FACTUAL"),
    differenceExplanation: text("difference_explanation").notNull(),
    priority: text().notNull().default("HIGH"),
    resolutionGuidance: text("resolution_guidance").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("conflicts_inv_idx").on(t.investigationId)],
);

export const tasks = pgTable(
  "verification_tasks",
  {
    id: text().primaryKey(),
    investigationId: investigationRef(),
    title: text().notNull(),
    reasonItMatters: text("reason_it_matters").notNull(),
    suggestedOfficialSource: text("suggested_official_source").notNull(),
    supportingEvidenceSnippet: text("supporting_evidence_snippet"),
    priority: text().notNull().default("HIGH"),
    status: text().notNull().default("PENDING"),
    isCompleted: boolean("is_completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text(),
    createdAt: createdAt(),
  },
  (t) => [index("tasks_inv_idx").on(t.investigationId)],
);

export const reports = pgTable(
  "investigation_reports",
  {
    id: text().primaryKey(),
    investigationId: investigationRef(),
    title: text().notNull(),
    summary: text().notNull(),
    reportJson: text("report_json").notNull(),
    htmlContent: text("html_content").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("reports_inv_idx").on(t.investigationId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text().primaryKey(),
    userId: text("user_id"),
    action: text().notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    ipAddress: text("ip_address"),
    details: text(),
    createdAt: createdAt(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);
