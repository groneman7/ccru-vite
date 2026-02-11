import { IconEye } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~/client/components";
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/client/components/ui";
import { authClient } from "~/client/lib/auth-client";
import { queryClient, trpc } from "~/client/lib/router";
import type { SystemRole, UserType } from "~/shared/types";
import { ListFilterIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const nav = useNavigate();
  const { currentUser } = Route.useRouteContext();
  const usersKey = trpc.users.getAllUsers.queryKey();
  const [filters, setFilters] = useState({
    systemRoleId: null as string | null,
    userTypeId: null as string | null,
    search: "",
  });

  // Queries
  const { data: users, isLoading: usersIsLoading } = useQuery(
    trpc.users.getAllUsers.queryOptions(),
  );
  const { data: systemRoles } = useQuery(
    trpc.authz.getAllSystemRoles.queryOptions(),
  );
  const { data: userTypes } = useQuery(
    trpc.authz.getAllUserTypes.queryOptions(),
  );

  // Mutations
  const { mutate: updateSystemRoleId } = useMutation(
    trpc.users.updateSystemRoleId.mutationOptions({
      onMutate: async ({ userId, systemRoleId }) => {
        await queryClient.cancelQueries({ queryKey: usersKey });

        const rollback = queryClient.getQueryData(usersKey) ?? [];
        const user = rollback.find((x) => x.id === userId);

        queryClient.setQueryData(usersKey, (prev) => {
          if (!prev) return prev;
          // `_user` with underscore to avoid collision with `user` const above
          return prev.map((_user) =>
            _user.id === userId ? { ..._user, systemRoleId } : _user,
          );
        });
        return { rollback, user };
      },
      onSuccess: (_data, _variables, ctx) => {
        toast.success(
          `Successfully updated System Role for ${ctx?.user?.displayName}.`,
        );
      },
      onError: (_error, _variables, ctx) => {
        toast.error(
          `Failed to update System Role for ${ctx?.user?.displayName}.`,
        );
        queryClient.setQueryData(usersKey, ctx?.rollback);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: usersKey });
      },
    }),
  );
  const { mutate: updateUserTypeId } = useMutation(
    trpc.users.updateUserTypeId.mutationOptions({
      onMutate: async ({ userId, userTypeId }) => {
        await queryClient.cancelQueries({ queryKey: usersKey });

        const rollback = queryClient.getQueryData(usersKey) ?? [];
        const user = rollback.find((u) => u.id === userId);

        queryClient.setQueryData(usersKey, (prev) => {
          if (!prev) return prev;
          return prev.map((_user) =>
            _user.id === userId ? { ..._user, userTypeId } : _user,
          );
        });
        return { rollback, user };
      },
      onSuccess: (_data, _variables, ctx) => {
        toast.success(
          `Successfully updated User Type for ${ctx?.user?.displayName}.`,
        );
      },
      onError: (_error, _variables, ctx) => {
        toast.error(
          `Failed to update User Type for ${ctx?.user?.displayName}.`,
        );
        queryClient.setQueryData(usersKey, ctx?.rollback);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: usersKey });
      },
    }),
  );

  const systemRoleOptions = [
    { id: "any", display: "Any" },
    ...(systemRoles ?? []).map((role) => ({
      id: role.id,
      display: role.display,
    })),
  ];
  const userTypeOptions = [
    { id: "any", display: "Any" },
    ...(userTypes ?? []).map((userType) => ({
      id: userType.id,
      display: userType.display,
    })),
  ];
  const selectedSystemRoleOption =
    systemRoleOptions.find((option) => option.id === filters.systemRoleId) ??
    systemRoleOptions[0];
  const selectedUserTypeOption =
    userTypeOptions.find((option) => option.id === filters.userTypeId) ??
    userTypeOptions[0];
  const filteredUsers = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    if (!users) return [];
    return users.filter((user) => {
      if (filters.systemRoleId && user.systemRoleId !== filters.systemRoleId) {
        return false;
      }
      if (filters.userTypeId && user.userTypeId !== filters.userTypeId) {
        return false;
      }
      if (!search) return true;
      return [user.displayName, user.email, user.nameFirst, user.nameLast]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search));
    });
  }, [filters.search, filters.systemRoleId, filters.userTypeId, users]);
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      a.nameLast!.localeCompare(b.nameLast!),
    );
  }, [filteredUsers]);
  const hasActiveFilters =
    filters.systemRoleId !== null ||
    filters.userTypeId !== null ||
    filters.search.trim().length > 0;

  if (usersIsLoading) return <div>Loading users...</div>;

  if (!users) return null;
  return (
    <>
      <WorkspaceHeader>Users</WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline">
                  <ListFilterIcon />
                  Filters
                </Button>
              }
            />
            <PopoverContent align="start" className="w-80">
              <div className="flex flex-col gap-3">
                <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  System Role
                </div>
                <Combobox
                  items={systemRoleOptions}
                  value={selectedSystemRoleOption}
                  itemToStringLabel={(option) => option.display}
                  itemToStringValue={(option) => option.id}
                  onValueChange={(value) => {
                    if (!value || value.id === "any") {
                      setFilters((prev) => ({
                        ...prev,
                        systemRoleId: null,
                      }));
                      return;
                    }
                    setFilters((prev) => ({
                      ...prev,
                      systemRoleId: value.id,
                    }));
                  }}
                >
                  <ComboboxTrigger
                    render={
                      <Button
                        className="w-full justify-start text-left font-normal"
                        variant="outline"
                      >
                        <ComboboxValue />
                      </Button>
                    }
                  />
                  <ComboboxContent>
                    <ComboboxInput
                      className="!mb-1 !h-7 text-sm"
                      placeholder="Filter system roles..."
                      showTrigger={false}
                    />
                    <ComboboxEmpty>No system roles found.</ComboboxEmpty>
                    <ComboboxList>
                      {(option) => (
                        <ComboboxItem key={option.id} value={option}>
                          {option.display}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  User Type
                </div>
                <Combobox
                  items={userTypeOptions}
                  value={selectedUserTypeOption}
                  itemToStringLabel={(option) => option.display}
                  itemToStringValue={(option) => option.id}
                  onValueChange={(value) => {
                    if (!value || value.id === "any") {
                      setFilters((prev) => ({
                        ...prev,
                        userTypeId: null,
                      }));
                      return;
                    }
                    setFilters((prev) => ({
                      ...prev,
                      userTypeId: value.id,
                    }));
                  }}
                >
                  <ComboboxTrigger
                    render={
                      <Button
                        className="w-full justify-start text-left font-normal"
                        variant="outline"
                      >
                        <ComboboxValue />
                      </Button>
                    }
                  />
                  <ComboboxContent>
                    <ComboboxInput
                      className="!mb-1 !h-7 text-sm"
                      placeholder="Filter user types..."
                      showTrigger={false}
                    />
                    <ComboboxEmpty>No user types found.</ComboboxEmpty>
                    <ComboboxList>
                      {(option) => (
                        <ComboboxItem key={option.id} value={option}>
                          {option.display}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    disabled={!hasActiveFilters}
                    onClick={() =>
                      setFilters({
                        systemRoleId: null,
                        userTypeId: null,
                        search: "",
                      })
                    }
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex justify-end gap-2">
            <Input
              placeholder="Search"
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {sortedUsers.map((user) => {
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 rounded-sm p-2 shadow-sm"
              >
                <div className="flex w-1/5 flex-col gap-1">
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
                <div className="w-1/6 text-sm">
                  <Combobox
                    defaultValue={systemRoles?.find(
                      (systemRole) => systemRole.id === user.systemRoleId,
                    )}
                    items={systemRoles ?? []}
                    itemToStringLabel={(systemRole: SystemRole) =>
                      systemRole.display
                    }
                    itemToStringValue={(systemRole: SystemRole) =>
                      systemRole.id
                    }
                    onValueChange={(value) => {
                      if (!value) return;
                      updateSystemRoleId({
                        userId: user.id,
                        systemRoleId: value.id,
                      });
                    }}
                  >
                    <ComboboxTrigger
                      render={
                        <Button
                          className="w-full justify-start text-left font-normal"
                          variant="ghost"
                        >
                          <ComboboxValue />
                        </Button>
                      }
                    />
                    <ComboboxContent>
                      <ComboboxInput
                        className="!mb-1 !h-7 text-sm"
                        placeholder="Search"
                        showTrigger={false}
                      />
                      <ComboboxEmpty>No system roles defined.</ComboboxEmpty>
                      <ComboboxList>
                        {(systemRole) => (
                          <ComboboxItem key={systemRole.id} value={systemRole}>
                            {systemRole.display}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <div className="w-1/5 text-sm">
                  <Combobox
                    items={
                      userTypes?.sort((a, b) => a.name.localeCompare(b.name)) ??
                      []
                    }
                    itemToStringLabel={(userType: UserType) => userType.display}
                    itemToStringValue={(userType: UserType) => userType.id}
                    defaultValue={userTypes?.find(
                      (userType) => userType.id === user.userTypeId,
                    )}
                    onValueChange={(value) => {
                      if (!value) return;
                      updateUserTypeId({
                        userId: user.id,
                        userTypeId: value.id,
                      });
                    }}
                  >
                    <ComboboxTrigger
                      render={
                        <Button
                          className="w-full justify-start text-left font-normal"
                          variant="ghost"
                        >
                          <ComboboxValue />
                        </Button>
                      }
                    />
                    <ComboboxContent>
                      <ComboboxInput
                        className="!mb-1 !h-7 text-sm"
                        placeholder="Search"
                        showTrigger={false}
                      />
                      <ComboboxEmpty>No system roles defined.</ComboboxEmpty>
                      <ComboboxList>
                        {(role) => (
                          <ComboboxItem key={role.id} value={role}>
                            {role.display}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <div className="flex flex-1 items-center justify-end">
                  {user.id !== currentUser.id && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <div>
                            <Button
                              disabled={currentUser.isImporsonated}
                              size="icon"
                              onClick={async () => {
                                if (currentUser.isImporsonated) return;
                                const response =
                                  await authClient.admin.impersonateUser({
                                    userId: user.id,
                                  });
                                if (response.error) return;
                                nav({ reloadDocument: true });
                              }}
                            >
                              <IconEye />
                            </Button>
                          </div>
                        }
                      />
                      <TooltipContent sideOffset={8}>
                        {currentUser.isImporsonated
                          ? "Alerady impersonating a user"
                          : "Impersonate user"}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </WorkspaceContent>
    </>
  );
}
