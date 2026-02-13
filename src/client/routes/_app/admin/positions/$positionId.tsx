import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAppForm } from "~/client/components/form";
import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Textarea,
} from "~/client/components/ui";
import { queryClient, trpc } from "~/client/lib/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [isEditing, setIsEditing] = useState(false);
  const positionDetailsKey = trpc.calendar.positions.getPositionById.queryKey({
    positionId,
  });
  const positionsListKey = trpc.calendar.positions.listAllPositions.queryKey();
  const { data: position, isLoading: positionIsLoading } = useQuery(
    trpc.calendar.positions.getPositionById.queryOptions({ positionId }),
  );
  const { mutateAsync: updatePositionDetails, isPending: isSaving } =
    useMutation(
      trpc.calendar.positions.updatePositionDetails.mutationOptions({
        onMutate: async ({ positionId: _positionId, ...positionData }) => {
          await queryClient.cancelQueries({ queryKey: positionDetailsKey });
          await queryClient.cancelQueries({ queryKey: positionsListKey });

          const rollbackDetails = queryClient.getQueryData(positionDetailsKey);
          const rollbackList = queryClient.getQueryData(positionsListKey);

          queryClient.setQueryData(positionDetailsKey, (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ...positionData,
            };
          });

          queryClient.setQueryData(positionsListKey, (prev) => {
            if (!prev) return prev;
            return prev.map((p) =>
              p.id === _positionId ? { ...p, ...positionData } : p,
            );
          });

          return { rollbackDetails, rollbackList };
        },
        onError: (_error, _variables, ctx) => {
          queryClient.setQueryData(positionDetailsKey, ctx?.rollbackDetails);
          queryClient.setQueryData(positionsListKey, ctx?.rollbackList);
          toast.error("Failed to update position details.");
        },
        onSuccess: () => {
          toast.success("Position details updated.");
        },
        onSettled: async () => {
          await queryClient.invalidateQueries({ queryKey: positionDetailsKey });
          await queryClient.invalidateQueries({ queryKey: positionsListKey });
        },
      }),
    );

  if (positionIsLoading) return "loading position";
  if (!position) return null;

  const form = useAppForm({
    defaultValues: {
      name: position.name,
      display: position.display,
      description: position.description ?? "",
    },
    onSubmit: async ({ value }) => {
      await updatePositionDetails({
        positionId,
        name: value.name.trim(),
        display: value.display.trim(),
        description: value.description.trim() || null,
      });
      setIsEditing(false);
    },
  });

  useEffect(() => {
    form.reset({
      name: position.name,
      display: position.display,
      description: position.description ?? "",
    });
    setIsEditing(false);
  }, [
    form,
    position.description,
    position.display,
    position.id,
    position.name,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 flex items-center justify-between border-b pb-1">
          <span className="text-xl">General</span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                disabled={isSaving}
                size="sm"
                onClick={() => {
                  form.reset();
                  setIsEditing(false);
                }}
              >
                <IconX />
                Cancel
              </Button>
              <Button
                disabled={isSaving}
                onClick={() => form.handleSubmit()}
                size="sm"
                variant="solid"
              >
                <IconCheck />
                Save
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <IconPencil />
              Edit
            </Button>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Field>
            <FieldLabel>Identifier</FieldLabel>
            <span className="pl-2">{position.id}</span>
          </Field>
          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  disabled={!isEditing || isSaving}
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>
                  The unique name of this position.
                </FieldDescription>
              </Field>
            )}
          </form.Field>
          <form.Field name="display">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Display</FieldLabel>
                <Input
                  disabled={!isEditing || isSaving}
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>
                  The name of this position shown throughout the application.
                </FieldDescription>
              </Field>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  disabled={!isEditing || isSaving}
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>
                  A short description of this position.
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </form>
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
