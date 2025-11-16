import { AppSidebar, Workspace } from "@/components";
import { SidebarProvider } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
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
