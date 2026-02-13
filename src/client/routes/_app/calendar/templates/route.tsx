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

export const Route = createFileRoute("/_app/calendar/templates")({
  loader: async ({ context: { trpc, queryClient } }) => {
    await queryClient.ensureQueryData(
      trpc.calendar.templates.listAllTemplates.queryOptions(),
    );
    return;
  },
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Event Templates" }],
  }),
});

function RouteComponent() {
  const nav = useNavigate();
  const selectedId = useParams({
    from: "/_app/calendar/templates/$templateId",
    shouldThrow: false,
  })?.templateId;
  const isNewTemplateRoute = !!useParams({
    from: "/_app/calendar/templates/new",
    shouldThrow: false,
  });

  const { data: templates, isLoading: templatesIsLoading } = useQuery(
    trpc.calendar.templates.listAllTemplates.queryOptions(),
  );

  if (templatesIsLoading) return "loading templates";
  if (!templates) return null;

  return (
    <>
      <WorkspaceHeader>Event Templates</WorkspaceHeader>
      <WorkspaceContent orientation="horizontal">
        <div className="flex w-xs flex-col overflow-clip rounded border">
          <Button
            className="m-1"
            onClick={() => nav({ to: "/calendar/templates/new" })}
            variant={isNewTemplateRoute ? "secondary" : "ghost"}
          >
            <IconPlus />
            Add template
          </Button>
          {templates
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((template) => (
              <Link
                key={template.id}
                className={cn(
                  "px-2 py-1",
                  template.id === selectedId &&
                    "bg-accent font-semibold text-accent-foreground",
                )}
                to="/calendar/templates/$templateId"
                params={{ templateId: template.id }}
              >
                {template.name}
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
