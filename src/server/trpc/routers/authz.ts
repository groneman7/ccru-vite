import { db } from "~/server/db";
import {
  systemRolesInAuthz as systemRoles,
  userTypesInAuthz as userTypes,
} from "~/server/db/schema";
import { publicProcedure, router } from "~/server/trpc/trpc";

export const authzRouter = router({
  getAllSystemRoles: publicProcedure.query(async () => {
    const rows = await db.select().from(systemRoles);
    return rows;
  }),
  getAllUserTypes: publicProcedure.query(async () => {
    const rows = await db.select().from(userTypes);
    return rows;
  }),
});
