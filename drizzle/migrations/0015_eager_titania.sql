ALTER TABLE "better-auth"."user" RENAME COLUMN "name" TO "display_name";--> statement-breakpoint
ALTER TABLE "better-auth"."user" RENAME COLUMN "created_at" TO "timestamp_created_at";--> statement-breakpoint
ALTER TABLE "better-auth"."user" RENAME COLUMN "updated_at" TO "timestamp_updated_at";--> statement-breakpoint
ALTER TABLE "better-auth"."user" ADD COLUMN "name_first" text NOT NULL;--> statement-breakpoint
ALTER TABLE "better-auth"."user" ADD COLUMN "name_middle" text NOT NULL;--> statement-breakpoint
ALTER TABLE "better-auth"."user" ADD COLUMN "name_last" text NOT NULL;--> statement-breakpoint
ALTER TABLE "better-auth"."user" ADD COLUMN "post_nominals" text;--> statement-breakpoint
ALTER TABLE "better-auth"."user" ADD COLUMN "timestamp_first_login" timestamp;--> statement-breakpoint
ALTER TABLE "better-auth"."user" ADD COLUMN "timestamp_onboarding_completed" timestamp;