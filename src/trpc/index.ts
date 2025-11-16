import "dotenv/config";
import { auth } from "@/lib/auth";
import { eventsRouter, usersRouter } from "@/trpc/routers";
import { createTRPCContext, router } from "@/trpc/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

const appRouter = router({
  events: eventsRouter,
  users: usersRouter,
});

const app = express();

const ORIGIN = process.env.SITE_URL || "http://localhost:5173";
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  }),
);

app.all("/api/auth/*", toNodeHandler(auth));
app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  }),
);

const port = Number(process.env.PORT || 5174);
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

// Export type router type signature, NOT the router itself.
export type AppRouter = typeof appRouter;
