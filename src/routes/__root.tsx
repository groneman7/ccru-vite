import { useUser } from "@/lib/hooks";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";

export const Route = createRootRouteWithContext()({
  component: RootLayout,
  head: () => ({
    meta: [{ title: "CCRU" }],
  }),
});

function RootLayout() {
  const test = useUser();

  return (
    <>
      <HeadContent />
      <div className="h-svh">
        <Outlet />
      </div>
    </>
  );
}
