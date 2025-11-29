import { WorkspaceContent, WorkspaceHeader } from "@/components";
import { cn } from "@/utils";
import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/positions")({
  component: RouteComponent,
});

function RouteComponent() {
  const selectedId = useParams({
    from: "/admin/positions/$positionId",
    shouldThrow: false,
  })?.positionId;

  const positions = useQuery(api.positions.getAllPositions);
  if (!positions) return null;

  return (
    <>
      <WorkspaceHeader>Event Positions</WorkspaceHeader>
      {/* <div className="border rounded-lg p-4 bg-white">
                <h2 className="font-semibold mb-2">Create New Position</h2>
                <div className="flex flex-col gap-2">
                    <input
                        className="border p-2 rounded"
                        placeholder="Position name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Label (optional)"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                    />
                    <textarea
                        className="border p-2 rounded"
                        placeholder="Description (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-primary text-white rounded p-2 font-semibold hover:bg-primary/90">
                        Create
                    </button>
                </div>
            </div> */}
      <WorkspaceContent orientation="horizontal">
        <div className="flex flex-1 flex-col gap-2">
          {positions.map((p) => (
            <Link
              className={cn(p._id === selectedId && "bg-blue-50 text-blue-800")}
              to="/admin/positions/$positionId"
              params={{ positionId: p._id }}
            >
              {p.label || p.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-2 flex-col">
          <Outlet />
        </div>
      </WorkspaceContent>
    </>
  );
}
