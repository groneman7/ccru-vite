import { db } from "@/db";
import { publicProcedure, router } from "@/trpc/trpc";

export const eventsRouter = router({
  list: publicProcedure.query(async () => {
    const events = await db.query.events.findMany();
    return events;
  }),
});
