import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import { EventForm } from "~client/components/event-form";
import { AddressFieldGroup } from "~client/components/event-form/address-field-group";
import { DateTimeFieldGroup } from "~client/components/event-form/date-time-field-group";
import { DescFieldGroup } from "~client/components/event-form/desc-field-group";
import { useAppForm } from "~client/components/form";
import { Button } from "~client/components/ui";
import { trpc } from "~client/lib/trpc";
import { newEventForm } from "~shared/zod";
import dayjs from "dayjs";
import { intersection, iso, object, string, union } from "zod";

export const Route = createFileRoute("/_app/calendar/events/new")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Create Event" }],
  }),
});

function RouteComponent() {
  // Queries & Mutations
  const createEvent = useMutation(
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
      onSubmit: intersection(
        newEventForm.schema,
        object({ timeBegin: string().min(1) }),
      ),
      // onSubmit: {
      //   // ...newEventForm.schema,
      //   // shifts: array(
      //   //   object({
      //   //     id: number(),
      //   //     eventId: number(),
      //   //     positionId: number(),
      //   //     quantity: number(),
      //   //   }),
      //   // ),
      // },
    },
    onSubmit: async ({ value }) => {
      // 1. Create new event
      const newEventId = await createEvent.mutateAsync({
        // TODO: HARDCARDED ID
        createdBy: 1,
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

  const store = useStore(form.store, (state) => state.values);

  // Render
  return (
    <div className="flex gap-2">
      <form
        className="flex flex-1 flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <WorkspaceHeader>
          <form.AppField name="eventName">
            {(eventNameField) => (
              <eventNameField.InputField placeholder="Event name" size="lg" />
            )}
          </form.AppField>
        </WorkspaceHeader>
        <WorkspaceContent>
          <DescFieldGroup
            form={form}
            fields={{ eventName: "eventName", description: "description" }}
          />
          <DateTimeFieldGroup
            form={form}
            fields={{
              date: "date",
              timeBegin: "timeBegin",
              timeEnd: "timeEnd",
            }}
          />
          <AddressFieldGroup form={form} fields={{ location: "location" }} />
          <Button
            // disabled
            type="submit"
            variant="solid"
          >
            Create
          </Button>
        </WorkspaceContent>
      </form>
      <div className="w-96">
        <pre className="!font-mono text-sm">
          {JSON.stringify(store, null, 4)}
        </pre>
      </div>
    </div>
  );
}
