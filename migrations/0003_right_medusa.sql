CREATE TABLE "approval_request_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" varchar NOT NULL,
	"step_order" integer NOT NULL,
	"approver_id" varchar NOT NULL,
	"action" text NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_workflow_steps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" varchar NOT NULL,
	"step_order" integer NOT NULL,
	"approver_role" text NOT NULL,
	"approver_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "approval_workflows" ALTER COLUMN "approver_role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD COLUMN "current_step" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD COLUMN "name" text DEFAULT 'Standard Approval' NOT NULL;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "approval_request_actions" ADD CONSTRAINT "approval_request_actions_request_id_approval_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."approval_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_request_actions" ADD CONSTRAINT "approval_request_actions_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflow_steps" ADD CONSTRAINT "approval_workflow_steps_workflow_id_approval_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."approval_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflow_steps" ADD CONSTRAINT "approval_workflow_steps_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;