import { WorkspaceContent, WorkspaceHeader } from "@/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/attributes/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>Attributes</WorkspaceHeader>
      <WorkspaceContent>test</WorkspaceContent>
    </>
  );
}
