import { routeTree } from "~client/routeTree.gen";
import { createRouter } from "@tanstack/react-router";

export const router = createRouter({
  defaultPendingComponent: () => (
    <div className={`p-2 text-2xl`}>Pending component...</div>
  ),
  defaultPreload: "intent",
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
