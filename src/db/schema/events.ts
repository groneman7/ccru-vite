import {
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Events Table
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
    timeBegin: timestamp("time_begin", { mode: "string" }).notNull(),
    timeEnd: timestamp("time_end", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "created_by",
    }),
  ],
);

// Shift Slots + User Id Junction Table
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

// Event Positions Table
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
// Event Shifts Table
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
