import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useStore } from "@tanstack/react-form";
import { Button, useAppForm } from "@/src/components/ui";
import { ShiftFieldGroup, type Shift } from "./shift-field-group";
export type { Shift } from "./shift-field-group";
import { NameDescFieldGroup } from "./name-desc-field-group";
import { DateTimeFieldGroup } from "./date-time-field-group";
import { AddressFieldGroup } from "./address-field-group";
import dayjs from "dayjs";

type EventDoc = Doc<"events">;
type ShiftDoc = Doc<"eventShifts">;

// {
//     _id: Id<"eventShifts">;
//     eventId: Id<"events">;
//     position: {
//         _id: Id<"eventPositions">;
//         _creationTime: number;
//         description?: string | undefined;
//         label?: string | undefined;
//         name: string;
//     } | undefined;
//     slots: ({
//         userId: Id<"users">;
//         user: {
//             _id: Id<"users">;
//             _creationTime: number;
//             tokenIdentifier?: string | undefined;
//             imageUrl?: string | undefined;
//             firstName: string;
//             lastName: string;
//         } | undefined;
//         userName: string | undefined;
//     } | null)[];
// }[] | undefined

type EventFormProps = {
  event?: EventDoc;
  shifts?: ShiftDoc[];
};

export function EventForm({ event, shifts }: EventFormProps) {
  const allUsers = useQuery(api.users.getAllUsers);
  const allPositions = useQuery(api.positions.getAllPositions);
  const createEvent = useMutation(api.events.createEvent);

  const nav = useNavigate();

  const form = useAppForm({
    defaultValues: {
      eventName: event?.name || "",
      description: event?.description || "",
      location: event?.location || "",
      date: event?.timeStart
        ? dayjs(event.timeStart).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      timeStart: event?.timeStart ? dayjs(event.timeStart).format("HH:mm") : "",
      timeEnd: event?.timeEnd ? dayjs(event.timeEnd).format("HH:mm") : "",
      shifts: shifts || ([] as Shift[]),
    },
    onSubmit: async ({ value }) => {
      const isNew = !event;

      const timeStart = dayjs(`${value.date} ${value.timeStart}`).toISOString();
      const timeEnd = value.timeEnd
        ? dayjs(`${value.date} ${value.timeEnd}`).toISOString()
        : undefined;

      if (isNew) {
        // Create new event
        const eventCreated = await createEvent({
          //   TODO: HARDCARDED ID
          createdBy: "j5799tyr8jpzygb3hb2rae2zs17tbwdz" as Id<"users">,
          name: value.eventName,
          description: value.description || undefined,
          location: value.location || undefined,
          timeStart,
          timeEnd: timeEnd || undefined,
          shifts: value.shifts.map((s) => ({
            positionId: s.positionId as Id<"eventPositions">,
            slots: s.slots,
            quantity: s.quantity,
          })),
        });
        nav({ to: "/calendar/events/$eventId", params: { eventId: eventCreated._id } });
      } else {
        // Update existing event
      }
    },
  });

  const store = useStore(form.store, (state) => state.values);

  return (
    <div className="flex gap-4">
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
          type="submit"
          variant="solid">
          {event ? "Update" : "Create"}
        </Button>
      </form>
      {/* <div className="w-96">
        <pre className="!font-mono">{JSON.stringify(store, null, 4)}</pre>
      </div> */}
    </div>
  );
}
