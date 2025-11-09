import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/src/lib/router";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import "./styles.css";
import { authClient } from "@/src/lib/auth-client";

const convex = new ConvexReactClient(import.meta.env.CONVEX_URL as string, {
  expectAuth: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}>
      <RouterProvider router={router} />
    </ConvexBetterAuthProvider>
  </StrictMode>
);
