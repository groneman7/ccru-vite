import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import dayjs from "dayjs";

export const Route = createFileRoute("/calendar/events/$eventId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { eventId } = Route.useParams();
    const event = useQuery(api.events.getEventById, { id: eventId as Id<"events"> });
    if (!event) return null;

    return (
        <div className="flex flex-col flex-1">
            <div>Event ID: {eventId}</div>
            <span className="text-2xl font-bold">{event.name}</span>
            <span>{dayjs(event.timeStart).format("dddd, MMMM D, YYYY")}</span>
            <span>
                {dayjs(event.timeStart).format("h:mm A")}
                {event.timeEnd && ` – ${dayjs(event.timeEnd).format("h:mm A")}`}
            </span>
            {event.location && <span className="">{event.location}</span>}
        </div>
    );
}
