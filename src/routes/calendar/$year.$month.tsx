import { api } from "@/convex/_generated/api";
import { Calendar } from "@/src/components/calendar";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import dayjs from "dayjs";

export const Route = createFileRoute("/calendar/$year/$month")({
    component: RouteComponent,
});

function RouteComponent() {
    const { year, month } = Route.useParams();
    const eventsByMonth = useQuery(api.events.getEventsByMonth, { year, month });

    return (
        <div className="flex flex-col flex-1">
            <Calendar
                events={eventsByMonth || []}
                month={dayjs(`${year}-${month}`)}
            />
        </div>
    );
}
