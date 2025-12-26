import { pgTable, index, foreignKey, integer, text, timestamp, unique, varchar, pgSchema, boolean, uuid, time, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const authz = pgSchema("authz");
export const betterAuth = pgSchema("better-auth");
export const shiftStatus = pgEnum("shift_status", ['active', 'deleted'])
export const singleMultiple = pgEnum("single_multiple", ['single', 'multiple'])
export const slotStatus = pgEnum("slot_status", ['active', 'deleted'])


export const eventShiftSlots = pgTable("event_shift_slots", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "event_shift_slots_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	shiftId: integer("shift_id").notNull(),
	userId: integer("user_id"),
	status: slotStatus().default('active').notNull(),
}, (table) => [
	index("by_shift_id").using("btree", table.shiftId.asc().nullsLast().op("int4_ops")),
	index("by_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.shiftId],
			foreignColumns: [eventShifts.id],
			name: "shift_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_id"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	nameFirst: text("name_first").notNull(),
	nameMiddle: text("name_middle"),
	nameLast: text("name_last").notNull(),
	betterAuthId: text("better_auth_id"),
	timestampFirstLogin: timestamp("timestamp_first_login", { withTimezone: true, mode: 'string' }),
	timestampOnboardingCompleted: timestamp("timestamp_onboarding_completed", { withTimezone: true, mode: 'string' }),
	timestampCreated: timestamp("timestamp_created", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const attributeKeys = pgTable("attribute_keys", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "attribute_keys_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	display: text().notNull(),
	type: singleMultiple().notNull(),
}, (table) => [
	unique("attribute_keys_name_key").on(table.name),
]);

export const eventShifts = pgTable("event_shifts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "event_shifts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	eventId: integer("event_id").notNull(),
	positionId: integer("position_id").notNull(),
	quantity: integer().notNull(),
	status: shiftStatus().default('active').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.positionId],
			foreignColumns: [eventPositions.id],
			name: "position_id"
		}).onDelete("restrict"),
]);

export const events = pgTable("events", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "events_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdBy: integer("created_by").notNull(),
	description: text(),
	location: text(),
	name: varchar({ length: 256 }),
	timeBegin: timestamp("time_begin", { withTimezone: true, mode: 'string' }).notNull(),
	timeEnd: timestamp("time_end", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "created_by"
		}),
]);

export const eventPositions = pgTable("event_positions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "event_positions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 64 }).notNull(),
	label: varchar({ length: 64 }).notNull(),
	description: text(),
});

export const attributeValues = pgTable("attribute_values", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "attribute_values_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	display: text().notNull(),
	keyId: integer("key_id"),
}, (table) => [
	foreignKey({
			columns: [table.keyId],
			foreignColumns: [attributeKeys.id],
			name: "key_id"
		}),
	unique("attribute_values_name_key").on(table.name),
]);

export const userAttributesInAuthz = authz.table("user_attributes", {
	id: integer().generatedAlwaysAsIdentity({ name: "authz.user_attributes_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id"),
	attributeId: integer("attribute_id"),
}, (table) => [
	foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributeValues.id],
			name: "attribute_id"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_id"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const accountInBetterAuth = betterAuth.table("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});

export const sessionInBetterAuth = betterAuth.table("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	unique("session_token_unique").on(table.token),
]);

export const userInBetterAuth = betterAuth.table("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	phoneNumber: text("phone_number"),
	phoneNumberVerified: boolean("phone_number_verified"),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const verificationInBetterAuth = betterAuth.table("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const eventTemplates = pgTable("event_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	display: text().notNull(),
	description: text(),
	timeBegin: time("time_begin"),
	timeEnd: time("time_end"),
	location: text(),
}, (table) => [
	unique("event_templates_name_key").on(table.name),
]);
