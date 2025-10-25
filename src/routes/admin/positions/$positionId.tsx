import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/admin/positions/$positionId")({
    component: RouteComponent,
});

function RouteComponent() {
    const positionId = Route.useParams().positionId;
    const position = useQuery(api.positions.getPositionById, { id: positionId as Id<"eventPositions"> });
    if (!position) return null;

    return (
        <>
            <div className="flex gap-2 items-center justify-between">
                <span className="text-xl">{position.name}</span>
                <span className="text-xs text-slate-400">{position._id}</span>
            </div>
            <div>
                <span>Label: </span>
                <span>{position.label}</span>
            </div>
            <div>
                <span>Description: </span>
                <span>{position.description}</span>
            </div>
            <div className="!font-mono text-red-700 font-bold">Requirement logic goes here</div>
        </>
    );
}
