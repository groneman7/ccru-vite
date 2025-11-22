import { WorkspaceContent, WorkspaceHeader } from "@/components";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>Admin</WorkspaceHeader>
      <WorkspaceContent>
        <div>
          <Link to="/admin/users">Users</Link>
        </div>
      </WorkspaceContent>
    </>
  );
}
