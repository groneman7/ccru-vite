CREATE TABLE "attribute_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attribute_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"display" text NOT NULL,
	CONSTRAINT "attribute_keys_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "attribute_values" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attribute_values_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"display" text NOT NULL,
	"key_id" integer,
	CONSTRAINT "attribute_values_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "status_code_users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "status_code_users" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "status_code_id";
--> statement-breakpoint
ALTER TABLE "attribute_values" ADD CONSTRAINT "key_id" FOREIGN KEY ("key_id") REFERENCES "public"."attribute_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "status";