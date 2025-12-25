import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";

export const Route = createFileRoute("/_app/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>Admin</WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex flex-col gap-1">
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/attributes">Attributes</Link>
          <Link to="/admin/matrix">Matrix</Link>
        </div>
      </WorkspaceContent>
    </>
  );
}
