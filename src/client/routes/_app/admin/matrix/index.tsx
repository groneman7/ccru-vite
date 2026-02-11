import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~/client/components";

export const Route = createFileRoute("/_app/admin/matrix/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>Matrix</WorkspaceHeader>
      <WorkspaceContent>
        <div>Matrix here</div>
      </WorkspaceContent>
    </>
  );
}
