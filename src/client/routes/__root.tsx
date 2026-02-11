import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "~/server/trpc";
import type { CurrentUser } from "~/shared/types";
import { Toaster } from "sonner";

export interface RouterContext {
  currentUser: CurrentUser | null;
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<AppRouter>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  head: () => ({
    meta: [{ title: "CCRU" }],
  }),
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <Toaster richColors />
      <div className="h-svh">
        <Outlet />
      </div>
    </>
  );
}
