import { createRouter } from "@tanstack/react-router";

import { routeTree } from "@/src/routeTree.gen";

export const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPendingComponent: () => <div className={`p-2 text-2xl`}>Pending component...</div>,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
