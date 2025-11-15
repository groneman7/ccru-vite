import { WorkspaceContent } from "@/components";
import { Calendar } from "@/components/calendar";
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
  const eventsByMonth = useQuery(api.events.getEventsByMonth, { year, month });

  return (
    <WorkspaceContent className="p-0">
      <Calendar
        events={eventsByMonth || []}
        month={dayjs(`${year}-${month}`)}
      />
    </WorkspaceContent>
  );
}
