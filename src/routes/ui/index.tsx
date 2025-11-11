import { WorkspaceContent, WorkspaceHeader } from "@/src/components";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ui/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>UI Components</WorkspaceHeader>
      <WorkspaceContent>
        <Link to="/ui/buttons">Buttons</Link>
        <Link to="/ui/inputs">Inputs</Link>
        <Link to="/ui/test-forms">Forms</Link>
      </WorkspaceContent>
    </>
  );
}
