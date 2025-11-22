import { WorkspaceContent, WorkspaceHeader } from "@/components";
import { UsersTable } from "@/components/users-table";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: users, isLoading: usersIsLoading } = useQuery(
    trpc.users.getAllUsers.queryOptions(),
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
