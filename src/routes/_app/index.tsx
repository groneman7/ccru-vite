import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(trpc.events.list.queryOptions());
  // console.log(data);
  return <div className="flex h-full gap-4">Hello world!</div>;
}
