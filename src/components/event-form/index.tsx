import { Button, useAppForm } from "@/components/ui";
import type { Event, Shift } from "@/db/types";
import { trpc } from "@/lib/trpc";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { AddressFieldGroup } from "./address-field-group";
import { DateTimeFieldGroup } from "./date-time-field-group";
import { NameDescFieldGroup } from "./name-desc-field-group";
import { ShiftFieldGroup } from "./shift-field-group";

type EventFormProps = {
  event?: Event;
  shifts?: Shift[];
};

export function EventForm({ event, shifts = [] }: EventFormProps) {
  const nav = useNavigate();

  const { data: allPositions } = useQuery(
    trpc.events.getAllPositions.queryOptions(),
  );
  const { data: allUsers } = useQuery(trpc.users.getAllUsers.queryOptions());
  const createEvent = useMutation(trpc.events.createEvent.mutationOptions());
  const createShifts = useMutation(trpc.events.createShifts.mutationOptions());
  const updateEvent = useMutation(trpc.events.updateEvent.mutationOptions());
  // const updateShiftSlots = useMutation(api.shifts.updateShiftSlots);

  const form = useAppForm({
    defaultValues: {
      eventName: event?.name || "",
      description: event?.description || "",
      location: event?.location || "",
      date: event?.timeBegin
        ? dayjs(event.timeBegin).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      timeBegin: event?.timeBegin
        ? dayjs(event.timeBegin).format("h:mm A")
        : "",
      timeEnd: event?.timeEnd ? dayjs(event.timeEnd).format("h:mm A") : "",
      shifts: shifts,
    },
    onSubmit: async ({ value }) => {
      const eventData = {
        description: value.description || undefined,
        location: value.location || undefined,
        name: value.eventName,
        timeBegin: dayjs(`${value.date} ${value.timeBegin}`).toISOString(),
        timeEnd: value.timeEnd
          ? dayjs(`${value.date} ${value.timeEnd}`).toISOString()
          : undefined,
      };

      if (event) {
        // 1. Update event itself
        updateEvent.mutate({
          ...eventData,
          eventId: event.id,
        });

        // 2. Update shifts
        // const newShifts = value.shifts
        //   .filter((s) => !s._id)
        //   .map(({ _id, ...rest }) => ({ ...rest, eventId: event.id }));
        // const updatedShifts = value.shifts
        //   .filter((s) => !!s._id)
        //   .map(({ eventId, positionId, ...rest }) => ({ ...rest }));

        // TODO: 2a. If shift unchanged, skip
        // 2b. If shift new, create
        // if (newShifts.length > 0) {
        //   createShifts.mutate({ eventId: event.id, shifts: newShifts });
        // }
        // 2c. If shift exists and changed, update
        // if (updatedShifts.length > 0) {
        //   await updateShiftSlots({ shifts: updatedShifts });
        // }
      } else {
        // 1. Create new event
        const newEventId = await createEvent.mutateAsync({
          ...eventData,
          //   TODO: HARDCARDED ID
          createdBy: 1,
        });

        // 2. Create shifts if needed
        if (value.shifts.length > 0) {
          createShifts.mutate({
            eventId: newEventId,
            shifts: value.shifts.map((s) => ({
              eventId: newEventId,
              positionId: s.positionId,
              quantity: s.slots.length,
            })),
          });
        }

        // 3. Navigate to new event
        nav({
          to: "/calendar/events/$eventId",
          params: { eventId: newEventId.toString() },
        });
      }
    },
  });

  const store = useStore(form.store, (state) => state.values);

  if (!allPositions || !allUsers) return null;

  return (
    <div className="flex gap-2">
      <form
        className="flex flex-1 flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <NameDescFieldGroup
          form={form}
          fields={{ eventName: "eventName", description: "description" }}
        />
        <AddressFieldGroup form={form} fields={{ location: "location" }} />
        <DateTimeFieldGroup
          form={form}
          fields={{ date: "date", timeBegin: "timeBegin", timeEnd: "timeEnd" }}
        />
        <ShiftFieldGroup
          form={form}
          positions={allPositions ?? []}
          users={allUsers || []}
          fields={{ shifts: "shifts" }}
        />
        <Button
          // disabled
          type="submit"
          variant="solid"
        >
          {event ? "Update" : "Create"}
        </Button>
      </form>
      <div className="w-144">
        <pre className="!font-mono">{JSON.stringify(store, null, 4)}</pre>
      </div>
    </div>
  );
}
