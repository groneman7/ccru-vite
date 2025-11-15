import { pgTable, pgSchema, text, timestamp, unique, boolean, integer, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const betterAuth = pgSchema("better-auth");


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

export const eventPositions = pgTable("event_positions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "event_positions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 64 }).notNull(),
	label: varchar({ length: 64 }).notNull(),
	description: text(),
});

export const eventShiftSlots = pgTable("event_shift_slots", {
	id: integer().generatedAlwaysAsIdentity({ name: "event_shift_slots_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	shiftId: integer("shift_id").notNull(),
	userId: integer("user_id"),
});

export const eventShifts = pgTable("event_shifts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "event_shifts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	eventId: integer("event_id").notNull(),
	positionId: integer("position_id").notNull(),
	quantity: integer().notNull(),
});

export const events = pgTable("events", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "events_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdBy: integer("created_by").notNull(),
	description: text(),
	location: text(),
	name: varchar({ length: 256 }),
	timeBegin: timestamp("time_begin", { mode: 'string' }).notNull(),
	timeEnd: timestamp("time_end", { mode: 'string' }),
});
