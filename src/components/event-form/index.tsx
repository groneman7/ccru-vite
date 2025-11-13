import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useStore } from "@tanstack/react-form";
import { Button, useAppForm } from "@/src/components/ui";
import { ShiftFieldGroup, type ShiftDoc } from "./shift-field-group";
export type { ShiftDoc } from "./shift-field-group";
import { NameDescFieldGroup } from "./name-desc-field-group";
import { DateTimeFieldGroup } from "./date-time-field-group";
import { AddressFieldGroup } from "./address-field-group";
import dayjs from "dayjs";

type EventDoc = Doc<"events">;

type EventFormProps = {
  event?: EventDoc;
  shifts?: ShiftDoc[];
};

export function EventForm({ event, shifts = [] }: EventFormProps) {
  const nav = useNavigate();
  const allPositions = useQuery(api.positions.getAllPositions);
  const allUsers = useQuery(api.users.getAllUsers);
  const createEvent = useMutation(api.events.createEvent);
  const createShifts = useMutation(api.shifts.createShifts);
  const updateEvent = useMutation(api.events.updateEvent);
  const updateShiftSlots = useMutation(api.shifts.updateShiftSlots);

  const form = useAppForm({
    defaultValues: {
      eventName: event?.name || "",
      description: event?.description || "",
      location: event?.location || "",
      date: event?.timeStart
        ? dayjs(event.timeStart).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      timeStart: event?.timeStart ? dayjs(event.timeStart).format("h:mm A") : "",
      timeEnd: event?.timeEnd ? dayjs(event.timeEnd).format("h:mm A") : "",
      shifts: [...shifts],
    },
    onSubmit: async ({ value }) => {
      const eventData = {
        description: value.description || undefined,
        location: value.location || undefined,
        name: value.eventName,
        timeStart: dayjs(`${value.date} ${value.timeStart}`).toISOString(),
        timeEnd: value.timeEnd
          ? dayjs(`${value.date} ${value.timeEnd}`).toISOString()
          : undefined,
      };

      if (event) {
        // 1. Update event itself
        await updateEvent({ ...eventData, _id: event._id });

        // 2. Update shifts
        const newShifts = value.shifts
          .filter((s) => !s._id)
          .map(({ _id, ...rest }) => ({ ...rest, eventId: event._id }));
        const updatedShifts = value.shifts
          .filter((s) => !!s._id)
          .map(({ eventId, positionId, ...rest }) => ({ ...rest }));

        // TODO: 2a. If shift unchanged, skip
        // 2b. If shift new, create
        if (newShifts.length > 0) {
          await createShifts({ shifts: newShifts });
        }
        // 2c. If shift exists and changed, update
        if (updatedShifts.length > 0) {
          await updateShiftSlots({ shifts: updatedShifts });
        }
      } else {
        // 1. Create new event
        const newEventId = await createEvent({
          ...eventData,
          //   TODO: HARDCARDED ID
          createdBy: "j5799tyr8jpzygb3hb2rae2zs17tbwdz" as Id<"users">,
        });

        // 2. Create shifts if needed
        if (value.shifts.length > 0) {
          await createShifts({
            shifts: value.shifts.map((s) => ({
              eventId: newEventId,
              positionId: s.positionId as Id<"eventPositions">,
              slots: s.slots,
              quantity: s.slots.length,
            })),
          });
        }

        // 3. Navigate to new event
        nav({ to: "/calendar/events/$eventId", params: { eventId: newEventId } });
      }
    },
  });

  const store = useStore(form.store, (state) => state.values);

  if (!allPositions || !allUsers) return null;

  return (
    <div className="flex gap-2">
      <form
        className="flex-1 flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}>
        <NameDescFieldGroup
          form={form}
          fields={{ eventName: "eventName", description: "description" }}
        />
        <AddressFieldGroup
          form={form}
          fields={{ location: "location" }}
        />
        <DateTimeFieldGroup
          form={form}
          fields={{ date: "date", timeStart: "timeStart", timeEnd: "timeEnd" }}
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
          variant="solid">
          {event ? "Update" : "Create"}
        </Button>
      </form>
      <div className="w-144">
        <pre className="!font-mono">{JSON.stringify(store, null, 4)}</pre>
      </div>
    </div>
  );
}
