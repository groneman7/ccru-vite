import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~/client/components";
import { trpc } from "~/client/lib/router";
import { cn } from "~/client/utils";

export const Route = createFileRoute("/_app/admin/positions")({
  loader: async ({ context: { trpc, queryClient } }) => {
    await queryClient.ensureQueryData(
      trpc.calendar.positions.listAllPositions.queryOptions(),
    );
    return;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const selectedId = useParams({
    from: "/_app/admin/positions/$positionId",
    shouldThrow: false,
  })?.positionId;

  const { data: positions, isLoading: positionsIsLoading } = useQuery(
    trpc.calendar.positions.listAllPositions.queryOptions(),
  );

  if (positionsIsLoading) return "loading positions";
  if (!positions) return null;

  return (
    <>
      <WorkspaceHeader>Position Manager</WorkspaceHeader>
      <WorkspaceContent orientation="horizontal">
        <div className="flex flex-1 flex-col border">
          {positions.map((p) => (
            <Link
              className={cn(
                p.id === selectedId &&
                  "bg-accent font-semibold text-accent-foreground",
              )}
              to="/admin/positions/$positionId"
              params={{ positionId: p.id }}
            >
              {p.name}
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
