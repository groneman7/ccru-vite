import { TestForm } from "@/components/temp/test-form";
import { createFileRoute } from "@tanstack/react-router";

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
