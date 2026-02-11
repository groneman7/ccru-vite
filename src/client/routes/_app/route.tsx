import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar, Workspace } from "~/client/components";
import { SidebarProvider } from "~/client/components/ui";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context: { queryClient, trpc } }) => {
    const currentUser = await queryClient.ensureQueryData(
      trpc.users.getCurrentUser.queryOptions(),
    );
    if (!currentUser) throw redirect({ to: "/sign-in" });
    return { currentUser };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-blue-50">
      <SidebarProvider>
        <AppSidebar />
        <div className="b my-2 mr-2 flex flex-1 flex-col rounded-lg border-2 border-blue-100 bg-white">
          <Workspace>
            <Outlet />
          </Workspace>
        </div>
      </SidebarProvider>
    </div>
  );
}
