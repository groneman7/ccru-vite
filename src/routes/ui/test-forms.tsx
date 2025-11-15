import { EventForm } from "@/components/event-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ui/test-forms")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4">
      <EventForm />
    </div>
  );
}
