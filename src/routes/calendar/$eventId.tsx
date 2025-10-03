import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/calendar/$eventId")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div className="flex flex-col flex-1"></div>;
}
