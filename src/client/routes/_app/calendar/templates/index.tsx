import { IconCalendarPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/calendar/templates/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <IconCalendarPlus className="size-24 text-gray-300" />
      <span className="text-xl text-gray-400 select-none">
        Select a template to edit.
      </span>
    </div>
  );
}
