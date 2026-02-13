import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~/client/components";
import { Button } from "~/client/components/ui";
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
  const nav = useNavigate();
  const selectedId = useParams({
    from: "/_app/admin/positions/$positionId",
    shouldThrow: false,
  })?.positionId;
  const isNewPositionRoute = !!useParams({
    from: "/_app/admin/positions/new",
    shouldThrow: false,
  });

  const { data: positions, isLoading: positionsIsLoading } = useQuery(
    trpc.calendar.positions.listAllPositions.queryOptions(),
  );

  if (positionsIsLoading) return "loading positions";
  if (!positions) return null;

  return (
    <>
      <WorkspaceHeader>Position Manager</WorkspaceHeader>
      <WorkspaceContent orientation="horizontal">
        <div className="flex w-xs flex-col overflow-clip rounded border">
          <Button
            className="m-1"
            onClick={() => nav({ to: "/admin/positions/new" })}
            variant={isNewPositionRoute ? "secondary" : "ghost"}
          >
            <IconPlus />
            Add position
          </Button>
          {positions
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => (
              <Link
                className={cn(
                  "px-2 py-1",
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
