import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const betterAuth = pgSchema("better-auth");

export const sessionInBetterAuth = betterAuth.table(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInBetterAuth.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("session_token_unique").on(table.token),
  ],
);

export const eventShifts = pgTable(
  "event_shifts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "event_shifts_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    eventId: integer("event_id").notNull(),
    positionId: integer("position_id").notNull(),
    quantity: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: "event_id",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.positionId],
      foreignColumns: [eventPositions.id],
      name: "position_id",
    }).onDelete("restrict"),
  ],
);

export const eventShiftSlots = pgTable(
  "event_shift_slots",
  {
    id: integer().generatedAlwaysAsIdentity({
      name: "event_shift_slots_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    shiftId: integer("shift_id").notNull(),
    userId: integer("user_id"),
  },
  (table) => [
    index("by_shift_id").using(
      "btree",
      table.shiftId.asc().nullsLast().op("int4_ops"),
    ),
    index("by_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.shiftId],
      foreignColumns: [eventShifts.id],
      name: "shift_id",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_id",
    }).onDelete("cascade"),
  ],
);

export const verificationInBetterAuth = betterAuth.table("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const eventPositions = pgTable("event_positions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "event_positions_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  name: varchar({ length: 64 }).notNull(),
  label: varchar({ length: 64 }).notNull(),
  description: text(),
});

export const events = pgTable(
  "events",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "events_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    createdBy: integer("created_by").notNull(),
    description: text(),
    location: text(),
    name: varchar({ length: 256 }),
    timeBegin: timestamp("time_begin", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    timeEnd: timestamp("time_end", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "created_by",
    }),
  ],
);

export const userInBetterAuth = betterAuth.table(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("user_email_unique").on(table.email)],
);

export const accountInBetterAuth = betterAuth.table(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInBetterAuth.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "users_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nameFirst: text("name_first").notNull(),
    nameMiddle: text("name_middle"),
    nameLast: text("name_last").notNull(),
    betterAuthId: text("better_auth_id"),
    timestampFirstLogin: timestamp("timestamp_first_login", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    timestampOnboardingCompleted: timestamp("timestamp_onboarding_completed", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    foreignKey({
      columns: [table.betterAuthId],
      foreignColumns: [userInBetterAuth.id],
      name: "better_auth_id",
    }),
  ],
);
