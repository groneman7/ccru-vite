import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/src/lib/router";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import "./styles.css";

const PUBLISHABLE_KEY = import.meta.env.CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
    throw new Error("Add your Clerk Publishable Key to the .env file");
}

const convex = new ConvexReactClient(import.meta.env.CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <ConvexProviderWithClerk
                client={convex}
                useAuth={useAuth}>
                <RouterProvider router={router} />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    </StrictMode>
);
