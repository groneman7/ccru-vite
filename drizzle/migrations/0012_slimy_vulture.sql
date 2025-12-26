CREATE TYPE "public"."shift_status" AS ENUM('active', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."slot_status" AS ENUM('active', 'deleted');--> statement-breakpoint
ALTER TABLE "authz"."user_attributes" DROP CONSTRAINT "user_id";
--> statement-breakpoint
ALTER TABLE "authz"."user_attributes" DROP CONSTRAINT "attribute_id";
--> statement-breakpoint
ALTER TABLE "event_shift_slots" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "event_shift_slots" ADD COLUMN "status" "slot_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_shifts" ADD COLUMN "status" "shift_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "authz"."user_attributes" ADD CONSTRAINT "user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "authz"."user_attributes" ADD CONSTRAINT "attribute_id" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute_values"("id") ON DELETE cascade ON UPDATE cascade;