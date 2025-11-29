CREATE SCHEMA "authz";
--> statement-breakpoint
CREATE TABLE "authz"."user_attributes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "authz"."authz.user_attributes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"attribute_id" integer
);
--> statement-breakpoint
ALTER TABLE "authz"."user_attributes" ADD CONSTRAINT "user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authz"."user_attributes" ADD CONSTRAINT "attribute_id" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute_values"("id") ON DELETE no action ON UPDATE no action;