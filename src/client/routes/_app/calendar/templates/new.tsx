import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AddressFieldGroup } from "~/client/components/event-form/address-field-group";
import { DescFieldGroup } from "~/client/components/event-form/desc-field-group";
import { useAppForm } from "~/client/components/form";
import { Button, Field, FieldLabel, Input } from "~/client/components/ui";
import { queryClient, trpc } from "~/client/lib/router";
import { CheckIcon, XIcon } from "lucide-react";
import { object, string, union, null as zNull } from "zod";

const timeSchema = string().regex(
  /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
  "Please enter a valid time.",
);

export const Route = createFileRoute("/_app/calendar/templates/new")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | New Event Template" }],
  }),
});

function RouteComponent() {
  const nav = useNavigate();
  const templatesListKey = trpc.calendar.templates.listAllTemplates.queryKey();
  const { mutateAsync: createTemplate, isPending: isCreating } = useMutation(
    trpc.calendar.templates.createTemplate.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: templatesListKey });
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      eventName: "",
      description: "" as string | null,
      location: "" as string | null,
      timeBegin: "",
      timeEnd: "" as string | null,
    },
    validators: {
      onSubmit: object({
        eventName: string().min(1, "Please enter a template name."),
        description: union([string(), zNull()]),
        location: union([string(), zNull()]),
        timeBegin: timeSchema,
        timeEnd: union([timeSchema, zNull()]),
      }),
    },
    onSubmit: async ({ value }) => {
      const templateId = await createTemplate({
        eventName: value.eventName.trim(),
        description: value.description || null,
        location: value.location || null,
        timeBegin: value.timeBegin,
        timeEnd: value.timeEnd || null,
      });

      nav({
        to: "/calendar/templates/$templateId",
        params: { templateId },
      });
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-2 lg:max-w-md">
      <span className="text-xl font-semibold">New Template</span>
      <form
        className="flex flex-1 flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="eventName">
          {(eventNameField) => (
            <Field>
              <FieldLabel htmlFor={eventNameField.name}>
                Template name
              </FieldLabel>
              <Input
                autoFocus
                id={eventNameField.name}
                name={eventNameField.name}
                value={eventNameField.state.value}
                onBlur={eventNameField.handleBlur}
                onChange={(e) => eventNameField.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>

        <div className="flex gap-2">
          <form.AppField name="timeBegin">
            {(field) => (
              <field.TimeField
                label="Start time"
                placeholder="e.g., 1:00 PM or 1300"
              />
            )}
          </form.AppField>
          <form.AppField name="timeEnd">
            {(field) => (
              <field.TimeField
                label="End time"
                placeholder="e.g., 1:00 PM or 1300"
              />
            )}
          </form.AppField>
        </div>
        <AddressFieldGroup form={form} fields={{ location: "location" }} />
        <DescFieldGroup
          form={form}
          fields={{ eventName: "eventName", description: "description" }}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            disabled={isCreating}
            type="button"
            onClick={() => nav({ to: "/calendar/templates" })}
          >
            <XIcon />
            Cancel
          </Button>
          <Button
            disabled={isCreating}
            variant="solid"
            onClick={() => form.handleSubmit()}
          >
            <CheckIcon />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
