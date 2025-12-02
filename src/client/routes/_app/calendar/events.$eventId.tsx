import { trpc } from "~client/lib/trpc";
import { cn } from "~client/utils";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import { EventForm } from "~client/components/event-form";
import { AddressFieldGroup } from "~client/components/event-form/address-field-group";
import { DateTimeFieldGroup } from "~client/components/event-form/date-time-field-group";
import { DescFieldGroup } from "~client/components/event-form/desc-field-group";
import {
  ShiftFieldGroup,
  type ShiftFormValue,
} from "~client/components/event-form/shift-field-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Combobox,
  Field,
  Input,
} from "~client/components/ui";
import type { Shift } from "~server/db/types";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  Minus,
  OctagonAlert,
  Plus,
  Search,
  SquarePen,
  TextAlignStart,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppForm } from "~client/components/form";

type ShiftSlot = Shift["slots"][number];
type ShiftMap = Map<number, Shift>;

export const Route = createFileRoute("/_app/calendar/events/$eventId")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Event" }],
  }),
});

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
  const updatedShiftQuantities = [];
  const removedSlots = [];
  const reassignedSlots = [];

  for (const [id, next] of currentMap.entries()) {
    const prev = original.get(id);
    if (!prev) continue;

    if (prev.quantity !== next.quantity) {
      updatedShiftQuantities.push({
        shiftId: id,
        from: prev.quantity,
        to: next.quantity,
      });
    }

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
    updatedShiftQuantities,
    removedSlots,
    reassignedSlots,
  };
}

function RouteComponent() {
  // Params & Hooks
  const nav = useNavigate();
  const { eventId } = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const snapshotRef = useRef<ShiftMap>(() => buildShiftIndex(shifts));

  // Queries
  const { data: allPositions } = useQuery(
    trpc.events.getAllPositions.queryOptions(),
  );
  const { data: allUsers } = useQuery(
    trpc.users.getUsersForCombobox.queryOptions(),
  );
  const { data: event, isLoading: eventIsLoading } = useQuery(
    trpc.events.getEventById.queryOptions({ eventId: Number(eventId) }),
  );
  const { data: shifts, isLoading: shiftsIsLoading } = useQuery(
    trpc.events.getSlotsByEventId.queryOptions({ eventId: Number(eventId) }),
  );

  // Mutations
  const updateEvent = useMutation(trpc.events.updateEvent.mutationOptions());

  // Tanstack Form
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
      shifts: shifts as ShiftFormValue[],
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

      // 1. Update event
      await updateEvent.mutateAsync({
        ...eventData,
        eventId: Number(eventId),
      });

      // 2. Update shifts (e.g., add/remove shifts, update shift quanitities, add/remove slots, reassign users)
      const diff = diffShifts(snapshotRef.current, value.shifts);
      console.groupCollapsed("Diff");
      console.log("New shifts", diff.newShifts);
      console.log("Removed shifts", diff.removedShifts);
      console.log("Slot adds", diff.addedSlots);
      console.log("Shift quantity changes", diff.updatedShiftQuantities);
      console.log("Slot removals", diff.removedSlots);
      console.log("Slot reassignments", diff.reassignedSlots);
      console.groupEnd();

      // 2a. TODO: Create new shifts
      if (diff.newShifts.length > 0) {
      }

      // 2b. TODO: Delete removed shifts
      if (diff.removedShifts.length > 0) {
      }

      // 2c. TODO: Update shift quantities
      if (diff.updatedShiftQuantities.length > 0) {
      }

      // 2d. TODO: Add slots to existing shifts
      if (diff.addedSlots.length > 0) {
      }

      // 2e. TODO: Remove slots from existing shifts
      if (diff.removedSlots.length > 0) {
      }

      // 2f. TODO: Reassign users to existing shifts
      if (diff.reassignedSlots.length > 0) {
      }

      // 3. Finish up - Could consider doing an optimistic update here instead of page reload
      // nav({ reloadDocument: true });
    },
  });

  // Effects
  useEffect(() => {
    snapshotRef.current = buildShiftIndex(shifts);
  }, [shifts]);

  // Render
  if (eventIsLoading || shiftsIsLoading) return <div>Loading event</div>;
  if (!event) {
    console.error("Event not found");
    return <div>Event not found</div>;
  }
  return (
    <>
      <form
        className="flex flex-1 flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <WorkspaceHeader>
          {isEditing ? (
            <form.Field name="eventName">
              {(eventNameField) => (
                <Field>
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
          ) : (
            <div className="flex items-center gap-2">
              <span>{event.name}</span>
              <Button
                round
                size="icon"
                variant="text"
                onClick={() => setIsEditing(!isEditing)}
              >
                <SquarePen className="size-4" />
              </Button>
            </div>
          )}
        </WorkspaceHeader>
        <WorkspaceContent orientation="vertical">
          {/* Form fields */}
          {isEditing ? (
            <DescFieldGroup
              form={form}
              fields={{ eventName: "eventName", description: "description" }}
            />
          ) : (
            event.description && (
              <div>
                <TextAlignStart className="size-4" />
                <span>{event.description}</span>
              </div>
            )
          )}
          {isEditing ? (
            <DateTimeFieldGroup
              form={form}
              fields={{
                date: "date",
                timeBegin: "timeBegin",
                timeEnd: "timeEnd",
              }}
            />
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                <span>
                  {dayjs(event.timeBegin).format("dddd, MMMM D, YYYY")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{dayjs(event.timeBegin).format("h:mm A")}</span>
                {event.timeEnd && (
                  <span> – {dayjs(event.timeEnd).format("h:mm A")}</span>
                )}
              </div>
            </div>
          )}
          {isEditing ? (
            <AddressFieldGroup form={form} fields={{ location: "location" }} />
          ) : (
            event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                <span>{event.location}</span>
              </div>
            )
          )}
          {isEditing ? (
            <ShiftFieldGroup
              form={form}
              positions={allPositions ?? []}
              users={allUsers || []}
              fields={{ shifts: "shifts" }}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {shifts &&
                shifts.map((shift) => (
                  // Shift
                  <div key={shift.id} className="flex flex-col gap-1">
                    {/* Underlined shift header with position title and slot quantity */}
                    <div className="flex items-center justify-between gap-2 border-b border-muted-foreground pb-1">
                      <span className="font-semibold">
                        {shift.positionLabel}
                      </span>
                      {/* shift slot quantity */}
                      <span>
                        {shift.slots.length} of
                        {shift.quantity} filled
                      </span>
                    </div>
                    {/* Shift slots */}
                    <div className="flex flex-col px-1">
                      {shift.slots.map((slot) => (
                        <div key={slot.id}>
                          <span>
                            {slot.user.nameFirst} {slot.user.nameLast}
                          </span>
                        </div>
                      ))}
                      {shift.slots.length < shift.quantity && (
                        <div>
                          <Button variant="link">Sign up</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
          {isEditing && (
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={() => {
                  form.reset();
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="solid">
                Save
              </Button>
            </div>
          )}
        </WorkspaceContent>
      </form>
    </>
  );
}
