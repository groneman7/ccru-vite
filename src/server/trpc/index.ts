import "dotenv/config";
import * as trpcExpress from "@trpc/server/adapters/express";
import { auth } from "~/server/auth";
import {
  authzRouter,
  calendarRouter,
  usersRouter,
} from "~/server/trpc/routers";
import { createTRPCContext, router } from "~/server/trpc/trpc";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "../uploadthing";

const appRouter = router({
  authz: authzRouter,
  calendar: calendarRouter,
  users: usersRouter,
});

const app = express();

app.use(
  cors({
    origin: process.env.VITE_SITE_URL!,
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
// TODO: Not sure what I'm doing here
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    // config: { ... },
  }),
);

const port = Number(process.env.PORT || 5174);
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

// Export type router type signature, NOT the router itself.
export type AppRouter = typeof appRouter;
