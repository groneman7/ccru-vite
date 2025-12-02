import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/users/$userId/history")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_app/admin/users/$userId/history"!</div>;
}
