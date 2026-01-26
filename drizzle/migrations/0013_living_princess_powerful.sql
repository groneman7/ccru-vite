CREATE TABLE "event_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display" text NOT NULL,
	"description" text,
	"time_begin" time,
	"time_end" time,
	"location" text,
	CONSTRAINT "event_templates_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "better-auth"."account" DROP CONSTRAINT "account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "better-auth"."session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "better_auth_id";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'authz'
                AND table_name = 'user_attributes'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "user_attributes" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "better-auth"."user" ADD COLUMN "status" text;