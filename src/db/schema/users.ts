import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
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
});
