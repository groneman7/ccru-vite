import { trpc } from "~client/lib/trpc";
import { WorkspaceContent } from "~client/components";
import { Calendar } from "~client/components/calendar";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute("/_app/calendar/$year/$month")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Calendar" }],
  }),
});

function RouteComponent() {
  const { year, month } = Route.useParams();
  const { data: eventsByMonth } = useQuery(
    trpc.events.getEventsByMonth.queryOptions({
      month: Number(month),
      year: Number(year),
    }),
  );

  return (
    <WorkspaceContent className="p-0">
      <Calendar
        events={eventsByMonth || []}
        month={dayjs(`${year}-${month}`)}
      />
    </WorkspaceContent>
  );
}
