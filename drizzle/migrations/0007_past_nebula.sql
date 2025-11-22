CREATE TABLE "status_code_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "status_code_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "status_code_users_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "timestamp_first_login" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timestamp_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "status_code_id" FOREIGN KEY ("status") REFERENCES "public"."status_code_users"("id") ON DELETE no action ON UPDATE no action;