import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

export const Route = createRootRouteWithContext()({
  component: RootLayout,
  head: () => ({
    meta: [{ title: "CCRU" }],
  }),
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <Toaster />
      <div className="h-svh">
        <Outlet />
      </div>
    </>
  );
}
