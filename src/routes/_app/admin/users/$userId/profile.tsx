import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/users/$userId/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span>General</span>
      </div>
      <div>
        <span>Contact</span>
      </div>
      <div>
        <span>Account</span>
      </div>
    </div>
  );
}
