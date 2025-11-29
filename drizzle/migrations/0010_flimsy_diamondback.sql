CREATE TYPE "public"."single_multiple" AS ENUM('single', 'multiple');--> statement-breakpoint
ALTER TABLE "attribute_keys" ADD COLUMN "type" "single_multiple" NOT NULL;