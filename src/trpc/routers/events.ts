import { db } from "@/db";
import { events, eventShifts } from "@/db/schema";
import { publicProcedure, router } from "@/trpc/trpc";
import { and, eq, gte, lt } from "drizzle-orm";
import { number, object } from "zod";

export const eventsRouter = router({
  getEventsByMonth: publicProcedure
    .input(object({ month: number(), year: number() }))
    .query(async ({ input }) => {
      const { month, year } = input;
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 1).toISOString();

      const rows = await db.query.events.findMany({
        where: and(gte(events.timeBegin, start), lt(events.timeBegin, end)),
      });

      return rows;
    }),
  // TODO: This does not have all the joins yet
  getShiftsByEventId: publicProcedure
    .input(object({ eventId: number() }))
    .query(async ({ input }) => {
      const { eventId } = input;
      const rows = await db.query.eventShifts.findMany({
        where: eq(eventShifts.eventId, eventId),
      });

      return rows;
    }),
});
