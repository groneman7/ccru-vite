import { pgTable, foreignKey, serial, varchar, integer, timestamp, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userAttributes = pgTable("user_attributes", {
	id: serial().notNull(),
	userClerkId: varchar("user_clerk_id", { length: 255 }).notNull(),
	valueId: integer("value_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userClerkId],
			foreignColumns: [users.clerkId],
			name: "user_attributes_user_clerk_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.valueId],
			foreignColumns: [attributeValues.id],
			name: "user_attributes_value_id_fkey"
		}).onDelete("cascade"),
]);

export const attributeKeys = pgTable("attribute_keys", {
	id: serial().notNull(),
	name: varchar({ length: 256 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	label: varchar({ length: 256 }),
});

export const attributeValues = pgTable("attribute_values", {
	id: serial().notNull(),
	keyId: integer("key_id").notNull(),
	name: varchar({ length: 256 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	label: varchar({ length: 256 }),
}, (table) => [
	foreignKey({
			columns: [table.keyId],
			foreignColumns: [attributeKeys.id],
			name: "attribute_values_key_id_fkey"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	clerkId: varchar("clerk_id", { length: 255 }).notNull(),
	name: text().notNull(),
	email: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	id: serial().notNull(),
});
