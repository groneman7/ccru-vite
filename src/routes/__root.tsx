import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { useState } from "react";

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
      <div className="h-svh">
        <Outlet />
      </div>
    </>
  );
}
