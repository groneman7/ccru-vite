import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~/client/components";

export const Route = createFileRoute("/_app/ui/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>UI Components</WorkspaceHeader>
      <WorkspaceContent>
        <Link to="/ui/buttons">Button</Link>
        <Link to="/ui/combobox">Combobox</Link>
        <Link to="/ui/inputs">Input</Link>
        <Link to="/ui/test-forms">Form</Link>
      </WorkspaceContent>
    </>
  );
}
