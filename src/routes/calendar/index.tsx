import { Calendar } from "@/src/components/calendar";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute("/calendar/")({
    component: RouteComponent,
});

function RouteComponent() {
    const test = dayjs();
    return (
        <div className="flex flex-col flex-1">
            <Calendar month={test} />
        </div>
    );
}
