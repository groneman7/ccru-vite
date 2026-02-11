import { createFileRoute } from "@tanstack/react-router";
import { TestForm } from "~/client/components/temp/test-form";

export const Route = createFileRoute("/_app/ui/test-forms")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4">
      <TestForm />
    </div>
  );
}
