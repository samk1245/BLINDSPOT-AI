CREATE TABLE "app_secrets" (
	"name" text PRIMARY KEY,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"ip_address" text,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conflicts" (
	"id" text PRIMARY KEY,
	"investigation_id" text NOT NULL,
	"claim_a_text" text NOT NULL,
	"claim_b_text" text NOT NULL,
	"source_a_title" text NOT NULL,
	"source_b_title" text NOT NULL,
	"source_a_url" text,
	"source_b_url" text,
	"source_a_date" text,
	"source_b_date" text,
	"conflict_type" text DEFAULT 'DIRECT_FACTUAL' NOT NULL,
	"difference_explanation" text NOT NULL,
	"priority" text DEFAULT 'HIGH' NOT NULL,
	"resolution_guidance" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "information_gaps" (
	"id" text PRIMARY KEY,
	"investigation_id" text NOT NULL,
	"requirement_id" text,
	"gap_title" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"classification" text DEFAULT 'MISSING' NOT NULL,
	"impact_level" text DEFAULT 'HIGH' NOT NULL,
	"suggested_action" text NOT NULL,
	"epistemic_note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investigations" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"research_question" text NOT NULL,
	"objective" text NOT NULL,
	"domain" text DEFAULT 'General' NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"readiness_score" double precision DEFAULT 0 NOT NULL,
	"readiness_breakdown" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_passages" (
	"id" text PRIMARY KEY,
	"source_id" text NOT NULL,
	"passage_index" integer NOT NULL,
	"text" text NOT NULL,
	"char_offset_start" integer DEFAULT 0 NOT NULL,
	"char_offset_end" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investigation_reports" (
	"id" text PRIMARY KEY,
	"investigation_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"report_json" text NOT NULL,
	"html_content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_requirements" (
	"id" text PRIMARY KEY,
	"investigation_id" text NOT NULL,
	"category" text DEFAULT 'GENERAL' NOT NULL,
	"description" text NOT NULL,
	"importance" text DEFAULT 'HIGH' NOT NULL,
	"expected_evidence" text NOT NULL,
	"verification_criteria" text NOT NULL,
	"coverage_status" text DEFAULT 'UNVERIFIED' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY,
	"investigation_id" text NOT NULL,
	"source_type" text DEFAULT 'URL' NOT NULL,
	"url" text,
	"title" text NOT NULL,
	"domain" text,
	"retrieval_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"publication_date" text,
	"last_updated_date" text,
	"raw_content" text NOT NULL,
	"content_hash" text NOT NULL,
	"reliability_score" double precision DEFAULT 0.8 NOT NULL,
	"status" text DEFAULT 'PARSED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tasks" (
	"id" text PRIMARY KEY,
	"investigation_id" text NOT NULL,
	"title" text NOT NULL,
	"reason_it_matters" text NOT NULL,
	"suggested_official_source" text NOT NULL,
	"supporting_evidence_snippet" text,
	"priority" text DEFAULT 'HIGH' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"hashed_password" text NOT NULL,
	"full_name" text,
	"role" text DEFAULT 'USER' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX "conflicts_inv_idx" ON "conflicts" ("investigation_id");--> statement-breakpoint
CREATE INDEX "gaps_inv_idx" ON "information_gaps" ("investigation_id");--> statement-breakpoint
CREATE INDEX "investigations_user_idx" ON "investigations" ("user_id");--> statement-breakpoint
CREATE INDEX "passages_source_idx" ON "evidence_passages" ("source_id");--> statement-breakpoint
CREATE INDEX "reports_inv_idx" ON "investigation_reports" ("investigation_id");--> statement-breakpoint
CREATE INDEX "requirements_inv_idx" ON "research_requirements" ("investigation_id");--> statement-breakpoint
CREATE INDEX "sources_inv_idx" ON "sources" ("investigation_id");--> statement-breakpoint
CREATE INDEX "tasks_inv_idx" ON "verification_tasks" ("investigation_id");--> statement-breakpoint
ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_investigation_id_investigations_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "information_gaps" ADD CONSTRAINT "information_gaps_investigation_id_investigations_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evidence_passages" ADD CONSTRAINT "evidence_passages_source_id_sources_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "investigation_reports" ADD CONSTRAINT "investigation_reports_investigation_id_investigations_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "research_requirements" ADD CONSTRAINT "research_requirements_investigation_id_investigations_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_investigation_id_investigations_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "verification_tasks" ADD CONSTRAINT "verification_tasks_investigation_id_investigations_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE;