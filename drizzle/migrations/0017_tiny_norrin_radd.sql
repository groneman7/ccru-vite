ALTER TABLE "better-auth"."user" RENAME COLUMN "id" TO "test";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "better_auth_id";