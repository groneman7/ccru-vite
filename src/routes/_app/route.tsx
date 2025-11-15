import { AppSidebar, Workspace } from "@/components";
import { SidebarProvider } from "@/components/ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="my-2 mr-2 flex flex-1 flex-col rounded-lg border-2 border-blue-100 bg-white">
        <Workspace>
          <Outlet />
        </Workspace>
      </div>
    </SidebarProvider>
  );
}
