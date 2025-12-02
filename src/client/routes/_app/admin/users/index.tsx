import { trpc } from "~client/lib/trpc";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import { UsersTable } from "~client/components/users-table";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: users, isLoading: usersIsLoading } = useQuery(
    trpc.users.getAllUsersForTable.queryOptions(),
  );

  return (
    <>
      <WorkspaceHeader>Users</WorkspaceHeader>
      <WorkspaceContent>
        <UsersTable users={users ?? []} />
      </WorkspaceContent>
    </>
  );
}
