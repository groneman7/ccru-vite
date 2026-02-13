import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/positions/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const nav = useNavigate();
  const positionsListKey = trpc.calendar.positions.listAllPositions.queryKey();

  const { mutateAsync: createPosition, isPending: isCreating } = useMutation(
    trpc.calendar.positions.createPosition.mutationOptions({
      onError: () => {
        toast.error("Failed to create position.");
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: positionsListKey });
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      name: "",
      display: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      const name = value.name.trim();
      const display = value.display.trim();

      if (!name || !display) {
        toast.error("Name and Display are required.");
        return;
      }

      const newPositionId = await createPosition({
        name,
        display,
        description: value.description.trim() || null,
      });

      toast.success("Position created.");
      nav({
        to: "/admin/positions/$positionId",
        params: { positionId: newPositionId },
      });
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div>
        <div className="mb-1 flex items-center justify-between border-b pb-1">
          <span className="text-xl">New Position</span>
          <div className="flex items-center gap-2">
            <Button
              disabled={isCreating}
              onClick={() => nav({ to: "/admin/positions" })}
              size="sm"
            >
              <IconX />
              Cancel
            </Button>
            <Button
              disabled={isCreating}
              onClick={() => form.handleSubmit()}
              size="sm"
              variant="solid"
            >
              <IconCheck />
              Save
            </Button>
          </div>
        </div>

        <Field>
          <FieldLabel>Name</FieldLabel>
          <form.Field name="name">
            {(field) => (
              <Input
                autoFocus
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <FieldDescription>The unique name of this position.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Display</FieldLabel>
          <form.Field name="display">
            {(field) => (
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <FieldDescription>
            The name of this position shown throughout the application.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <form.Field name="description">
            {(field) => (
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <FieldDescription>
            A short description of this position.
          </FieldDescription>
        </Field>
      </div>
    </form>
  );
}
