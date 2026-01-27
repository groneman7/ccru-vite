import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import { trpc } from "~client/lib/trpc";

export const Route = createFileRoute("/_app/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: users, isLoading: usersIsLoading } = useQuery(
    trpc.users.getAllUsersForTable.queryOptions(),
  );

  if (usersIsLoading) return <div>Loading users...</div>;

  if (!users) return null;
  return (
    <>
      <WorkspaceHeader>Users</WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex flex-col gap-2">
          {users.map((user) => {
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 rounded-sm p-2 shadow-sm"
              >
                <div className="flex w-1/3 flex-col gap-1">
                  <div>
                    <Link
                      to="/admin/users/$userId"
                      params={{ userId: user.id }}
                    >
                      {user.displayName}
                    </Link>
                  </div>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="w-1/4 text-sm">
                  <span>{user["USER ROLE"]}</span>
                </div>
                <div className="w-1/6 text-sm">
                  <span>{user["ACCOUNT TYPE"]}</span>
                </div>
                <div className="flex flex-1 border">actions</div>
              </div>
            );
          })}
        </div>
      </WorkspaceContent>
    </>
  );
}
