import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/positions/$positionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const positionId = Route.useParams().positionId;
  const position = useQuery(api.positions.getPositionById, {
    id: positionId as Id<"eventPositions">,
  });
  if (!position) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
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
      <div className="!font-mono font-bold text-red-700">
        Requirement logic goes here
      </div>
    </>
  );
}
