import { WorkspaceContent, WorkspaceHeader } from "@/components";
import { EventForm } from "@/components/event-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/calendar/events/new")({
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
