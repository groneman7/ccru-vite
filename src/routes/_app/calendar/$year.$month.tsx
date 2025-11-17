import { WorkspaceContent } from "@/components";
import { Calendar } from "@/components/calendar";
import { trpc } from "@/lib/trpc";
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
