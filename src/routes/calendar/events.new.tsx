import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "@/src/components";
import { EventForm } from "@/src/components/event-form";

export const Route = createFileRoute("/calendar/events/new")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Create Event" }],
  }),
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>Create Event</WorkspaceHeader>
      <WorkspaceContent>
        <EventForm />
      </WorkspaceContent>
    </>
  );
}
