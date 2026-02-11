import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Field,
  FieldDescription,
  FieldLabel,
  Input,
} from "~/client/components/ui";
import { trpc } from "~/client/lib/router";

export const Route = createFileRoute("/_app/admin/positions/$positionId")({
  loader: async ({
    context: { trpc, queryClient },
    params: { positionId },
  }) => {
    await queryClient.ensureQueryData(
      trpc.calendar.positions.getPositionById.queryOptions({
        positionId,
      }),
    );
    return;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const positionId = Route.useParams().positionId;
  const { data: position, isLoading: positionIsLoading } = useQuery(
    trpc.calendar.positions.getPositionById.queryOptions({ positionId }),
  );

  if (positionIsLoading) return "loading position";
  if (!position) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="mb-1 flex border-b pb-1 text-xl">General</span>
        <div>
          <Field>
            <FieldLabel>Identifier</FieldLabel>
            <span className="pl-2">{position.id}</span>
          </Field>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input value={position.name} />
            <FieldDescription>
              The unique name of this position.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Display</FieldLabel>
            <Input value={position.display} />
            <FieldDescription>
              The name of this position shown throughout the application.
            </FieldDescription>
          </Field>
        </div>
      </div>
      <div>
        <span className="mb-1 flex border-b pb-1 text-xl">
          Requirement logic
        </span>
        <div>
          requirement settings here (e.g., "only allow user types `a,b,c` OR
          certifications `x,y,z` for this position")
        </div>
      </div>
    </div>
  );
}
