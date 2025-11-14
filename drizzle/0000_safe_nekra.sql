-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "user_attributes" (
	"id" serial NOT NULL,
	"user_clerk_id" varchar(255) NOT NULL,
	"value_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attribute_keys" (
	"id" serial NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"label" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "attribute_values" (
	"id" serial NOT NULL,
	"key_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"label" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"clerk_id" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"id" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_attributes" ADD CONSTRAINT "user_attributes_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_attributes" ADD CONSTRAINT "user_attributes_value_id_fkey" FOREIGN KEY ("value_id") REFERENCES "public"."attribute_values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "public"."attribute_keys"("id") ON DELETE cascade ON UPDATE no action;
*/