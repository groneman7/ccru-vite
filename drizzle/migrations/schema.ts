import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const calendar = pgSchema("calendar");
export const betterAuth = pgSchema("better-auth");
export const authz = pgSchema("authz");
export const accountStatus = pgEnum("account_status", [
  "active",
  "inactive",
  "invited",
]);
export const shiftStatus = pgEnum("shift_status", ["active", "deleted"]);
export const singleMultiple = pgEnum("single_multiple", ["single", "multiple"]);
export const slotStatus = pgEnum("slot_status", ["active", "deleted"]);

export const eventsInCalendar = calendar.table(
  "events",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    description: text(),
    location: text(),
    timeBegin: timestamp("time_begin", { withTimezone: true, mode: "string" }),
    timeEnd: timestamp("time_end", { withTimezone: true, mode: "string" }),
    createdBy: uuid("created_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [userInBetterAuth.id],
      name: "created_by",
    }).onUpdate("cascade"),
  ],
);

export const userInBetterAuth = betterAuth.table(
  "user",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    displayName: text("display_name").notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    nameFirst: text("name_first"),
    nameMiddle: text("name_middle"),
    nameLast: text("name_last"),
    phoneNumber: text("phone_number"),
    phoneNumberVerified: boolean("phone_number_verified"),
    postNominals: text("post_nominals"),
    status: accountStatus(),
    timestampCreatedAt: timestamp("timestamp_created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    timestampFirstLogin: timestamp("timestamp_first_login", { mode: "string" }),
    timestampOnboardingCompleted: timestamp("timestamp_onboarding_completed", {
      mode: "string",
    }),
    timestampUpdatedAt: timestamp("timestamp_updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("user_email_unique").on(table.email)],
);

export const attributeKeysInAuthz = authz.table(
  "attribute_keys",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    display: text().notNull(),
    type: singleMultiple().default("single").notNull(),
  },
  (table) => [unique("attribute_keys_name_key").on(table.name)],
);

export const attributeValuesInAuthz = authz.table(
  "attribute_values",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    display: text().notNull(),
    keyId: uuid("key_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.keyId],
      foreignColumns: [attributeKeysInAuthz.id],
      name: "key_id",
    }),
    unique("attribute_values_name_key").on(table.name),
  ],
);

export const positionsInCalendar = calendar.table(
  "positions",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    display: text().notNull(),
    description: text(),
  },
  (table) => [unique("positions_name_key").on(table.name)],
);

export const templatesInCalendar = calendar.table(
  "templates",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    display: text().notNull(),
    description: text(),
    timeBegin: time("time_begin").notNull(),
    timeEnd: time("time_end"),
    location: text(),
  },
  (table) => [unique("templates_name_key").on(table.name)],
);

export const junctionShiftsInCalendar = calendar.table(
  "junction_shifts",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    eventId: uuid("event_id").notNull(),
    positionId: uuid("position_id").notNull(),
    quantity: integer().default(1).notNull(),
    status: shiftStatus().default("active"),
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [eventsInCalendar.id],
      name: "event_id",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.positionId],
      foreignColumns: [positionsInCalendar.id],
      name: "position_id",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const accountInBetterAuth = betterAuth.table("account", {
  id: uuid()
    .default(sql`uuid_generate_v7()`)
    .primaryKey()
    .notNull(),
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
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
});

export const sessionInBetterAuth = betterAuth.table(
  "session",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
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
  (table) => [unique("session_token_unique").on(table.token)],
);

export const verificationInBetterAuth = betterAuth.table("verification", {
  id: uuid()
    .default(sql`uuid_generate_v7()`)
    .primaryKey()
    .notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const junctionUserAttributesInAuthz = authz.table(
  "junction_user_attributes",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id"),
    valueId: uuid("value_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInBetterAuth.id],
      name: "user_id",
    }),
    foreignKey({
      columns: [table.valueId],
      foreignColumns: [attributeValuesInAuthz.id],
      name: "value_id",
    }),
  ],
);

export const junctionSlotsInCalendar = calendar.table(
  "junction_slots",
  {
    id: uuid()
      .default(sql`uuid_generate_v7()`)
      .primaryKey()
      .notNull(),
    shiftId: uuid("shift_id").notNull(),
    userId: uuid("user_id").notNull(),
    status: slotStatus().default("active"),
  },
  (table) => [
    foreignKey({
      columns: [table.shiftId],
      foreignColumns: [junctionShiftsInCalendar.id],
      name: "shift_id",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInBetterAuth.id],
      name: "user_id",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);
export const testView1InBetterAuth = betterAuth
  .view("test_view1", { id: uuid(), displayName: text("display_name") })
  .as(sql`SELECT id, display_name FROM "better-auth"."user"`);
