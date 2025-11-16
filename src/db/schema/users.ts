import { foreignKey, integer, pgTable, text } from "drizzle-orm/pg-core";
import { userInBetterAuth } from "./auth";

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
  },
  (table) => [
    foreignKey({
      columns: [table.betterAuthId],
      foreignColumns: [userInBetterAuth.id],
      name: "better_auth_id",
    }),
  ],
);
