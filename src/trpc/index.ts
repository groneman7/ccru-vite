import { eventsRouter } from "@/trpc/routers/events";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { router } from "./trpc";

const appRouter = router({
  events: eventsRouter,
});

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
});

server.listen(5174);
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
