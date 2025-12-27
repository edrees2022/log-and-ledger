ALTER TABLE "approval_workflows" ADD COLUMN IF NOT EXISTS "name" text NOT NULL DEFAULT 'Standard Approval';
--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "approval_workflows" ALTER COLUMN "approver_role" DROP NOT NULL;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "approval_workflow_steps" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflow_id" varchar NOT NULL REFERENCES "approval_workflows"("id") ON DELETE CASCADE,
  "step_order" integer NOT NULL,
  "approver_role" text NOT NULL,
  "approver_id" varchar REFERENCES "users"("id"),
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "current_step" integer NOT NULL DEFAULT 1;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "approval_request_actions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_id" varchar NOT NULL REFERENCES "approval_requests"("id") ON DELETE CASCADE,
  "step_order" integer NOT NULL,
  "approver_id" varchar NOT NULL REFERENCES "users"("id"),
  "action" text NOT NULL,
  "comments" text,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
