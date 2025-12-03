import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppForm } from "~client/components/form";
import { Button } from "~client/components/ui";
import { trpc } from "~client/lib/trpc";
import type { Event, Shift } from "~server/db/types";
import { newEventForm } from "~shared/zod";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { array, number, object } from "zod";
import { AddressFieldGroup } from "./address-field-group";
import { DateTimeFieldGroup } from "./date-time-field-group";
import { DescFieldGroup } from "./desc-field-group";
import { ShiftFieldGroup } from "./shift-field-group";

type ShiftSlot = Shift["slots"][number];
type ShiftMap = Map<number, Shift>;

const buildShiftIndex = (list: Shift[] = []): ShiftMap =>
  new Map(
    list
      .filter((s): s is Shift & { id: number } => !!s.id)
      .map((shift) => [
        shift.id!,
        {
          ...shift,
          slots: shift.slots.map((slot) => ({
            ...slot,
            userId: slot.user.id ?? null,
          })),
        },
      ]),
  );

const indexSlots = (slots: ShiftSlot[] = new Array<ShiftSlot>()) =>
  new Map(
    slots
      .filter((slot): slot is ShiftSlot & { id: number } => !!slot.id)
      .map((slot) => [slot.id!, slot]),
  );

function diffShifts(original: ShiftMap, current: Shift[]) {
  const currentMap = buildShiftIndex(current.filter((s) => !!s.id));
  const newShifts = current.filter((s) => !s.id);
  const removedShifts = [...original.keys()].filter(
    (id) => !currentMap.has(id),
  );

  const addedSlots = [];
  const removedSlots = [];
  const reassignedSlots = [];

  for (const [id, next] of currentMap.entries()) {
    const prev = original.get(id);
    if (!prev) continue;

    const prevSlots = indexSlots(prev.slots);
    const nextSlots = indexSlots(next.slots);

    for (const [slotId, slot] of nextSlots.entries()) {
      if (!prevSlots.has(slotId)) {
        addedSlots.push({ shiftId: id, slot });
      } else {
        const from = prevSlots.get(slotId)!;
        if (from.user.id !== slot.user.id) {
          reassignedSlots.push({ shiftId: id, from, to: slot });
        }
      }
    }

    for (const [slotId, slot] of prevSlots.entries()) {
      if (!nextSlots.has(slotId)) {
        removedSlots.push({ shiftId: id, slot });
      }
    }
  }

  return {
    newShifts,
    removedShifts,
    addedSlots,
    removedSlots,
    reassignedSlots,
  };
}

type EventFormProps = {
  event?: Event;
  shifts?: Shift[];
};

export function EventForm({ event, shifts = [] }: EventFormProps) {
  const nav = useNavigate();

  const { data: allPositions } = useQuery(
    trpc.events.getAllPositions.queryOptions(),
  );
  const { data: allUsers } = useQuery(
    trpc.users.getUsersForCombobox.queryOptions(),
  );
  const createEvent = useMutation(trpc.events.createEvent.mutationOptions());
  const createShifts = useMutation(trpc.events.createShifts.mutationOptions());
  const updateEvent = useMutation(trpc.events.updateEvent.mutationOptions());
  // const updateShiftSlots = useMutation(api.shifts.updateShiftSlots);

  const snapshotRef = useRef<() => ShiftMap>(() => buildShiftIndex(shifts));
  useEffect(() => {
    snapshotRef.current = buildShiftIndex(shifts);
  }, [shifts]);

  const form = useAppForm({
    defaultValues: {
      eventName: event?.name || "",
      description: event?.description || null,
      location: event?.location,
      date: event?.timeBegin
        ? dayjs(event.timeBegin).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      timeBegin: event?.timeBegin
        ? dayjs(event.timeBegin).format("h:mm A")
        : "",
      timeEnd: event?.timeEnd ? dayjs(event.timeEnd).format("h:mm A") : null,
      shifts: shifts,
    },
    validators: {
      onSubmit: {
        ...newEventForm.schema,
        // shifts: array(
        //   object({
        //     id: number(),
        //     eventId: number(),
        //     positionId: number(),
        //     quantity: number(),

        //   }),
        // ),
      },
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

        const comparison = diffShifts(snapshotRef.current, value.shifts);
        console.groupCollapsed("Shift diff");
        console.log("New shifts", comparison.newShifts);
        console.log("Removed shifts", comparison.removedShifts);
        console.log("Slot adds", comparison.addedSlots);
        console.log("Slot removals", comparison.removedSlots);
        console.log("Slot reassignments", comparison.reassignedSlots);
        console.groupEnd();

        // 2. Update shifts
        // const newShifts = value.shifts
        //   .filter((s) => !s.id)
        //   .map(({ id, ...rest }) => ({ ...rest, eventId: event.id }));
        // const updatedShifts = value.shifts
        //   .filter((s) => !!s.id)
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
        <DescFieldGroup
          form={form}
          fields={{ eventName: "eventName", description: "description" }}
        />
        <DateTimeFieldGroup
          form={form}
          fields={{ date: "date", timeBegin: "timeBegin", timeEnd: "timeEnd" }}
        />
        <AddressFieldGroup form={form} fields={{ location: "location" }} />
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
