import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~/client/components";
import { AddressFieldGroup } from "~/client/components/event-form/address-field-group";
import { DateTimeFieldGroup } from "~/client/components/event-form/date-time-field-group";
import { DescFieldGroup } from "~/client/components/event-form/desc-field-group";
import { useAppForm } from "~/client/components/form";
import { Button, Field, FieldLabel, Input } from "~/client/components/ui";
import { trpc } from "~/client/lib/router";
import dayjs from "dayjs";
import { CheckIcon, XIcon } from "lucide-react";
import { iso, object, string, union, null as zNull } from "zod";

export const Route = createFileRoute("/_app/calendar/events/new")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Create Event" }],
  }),
});

function RouteComponent() {
  // Queries & Mutations
  const { mutateAsync: createEvent, isPending: isCreating } = useMutation(
    trpc.calendar.events.createEvent.mutationOptions(),
  );

  // Hooks
  const nav = useNavigate();

  // Form
  const form = useAppForm({
    defaultValues: {
      eventName: "",
      description: "" as string | null,
      location: "" as string | null,
      date: dayjs().format("YYYY-MM-DD"),
      timeBegin: "",
      timeEnd: "" as string | null,
      // shifts: [] as Shift[],
    },
    validators: {
      // Validate the local form shape. Conversion to full ISO datetimes
      // happens in onSubmit when date and time fields are combined.
      onSubmit: object({
        eventName: string().min(1, "Please enter an event name."),
        description: union([string(), zNull()]),
        location: union([string(), zNull()]),
        date: iso.date(),
        timeBegin: string().min(1, "Please enter a start time."),
        timeEnd: union([string(), zNull()]),
      }),
    },
    onSubmit: async ({ value }) => {
      // 1. Create new event
      const newEventId = await createEvent({
        // TODO: HARDCARDED ID
        createdBy: "019bf727-12a8-7b06-b286-59e7719468c0",
        date: value.date,
        description: value.description,
        eventName: value.eventName,
        location: value.location,
        timeBegin: dayjs(`${value.date} ${value.timeBegin}`).toISOString(),
        timeEnd: value.timeEnd
          ? dayjs(`${value.date} ${value.timeEnd}`).toISOString()
          : null,
      });

      // 2. Create shifts if needed
      // if (value.shifts.length > 0) {
      //   createShifts.mutate({
      //     eventId: newEventId,
      //     shifts: value.shifts.map((s) => ({
      //       eventId: newEventId,
      //       positionId: s.positionId,
      //       quantity: s.slots.length,
      //     })),
      //   });
      // }

      // 3. Navigate to new event
      nav({
        to: "/calendar/events/$eventId",
        params: { eventId: newEventId.toString() },
      });
    },
  });

  // Render
  return (
    <>
      <WorkspaceHeader>New Event</WorkspaceHeader>
      <WorkspaceContent className="gap-16" orientation="horizontal">
        <div className="flex flex-1 flex-col gap-2 lg:max-w-md">
          <span className="text-xl font-semibold">Details</span>
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
                    Event name
                  </FieldLabel>
                  <Input
                    id={eventNameField.name}
                    name={eventNameField.name}
                    value={eventNameField.state.value}
                    onBlur={eventNameField.handleBlur}
                    onChange={(e) =>
                      eventNameField.handleChange(e.target.value)
                    }
                  />
                </Field>
              )}
            </form.Field>

            <DateTimeFieldGroup
              form={form}
              fields={{
                date: "date",
                timeBegin: "timeBegin",
                timeEnd: "timeEnd",
              }}
            />
            <AddressFieldGroup form={form} fields={{ location: "location" }} />
            <DescFieldGroup
              form={form}
              fields={{ eventName: "eventName", description: "description" }}
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                disabled={isCreating}
                type="button"
                onClick={() => nav({ to: "/calendar" })}
              >
                <XIcon />
                Cancel
              </Button>
              <Button
                disabled={isCreating}
                type="submit"
                variant="solid"
                onClick={() => form.handleSubmit()}
              >
                <CheckIcon />
                Save
              </Button>
            </div>
          </form>
        </div>
      </WorkspaceContent>
    </>
  );
}
