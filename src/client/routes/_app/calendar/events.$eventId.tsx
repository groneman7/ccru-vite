import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import { AddressFieldGroup } from "~client/components/event-form/address-field-group";
import { DateTimeFieldGroup } from "~client/components/event-form/date-time-field-group";
import { DescFieldGroup } from "~client/components/event-form/desc-field-group";
import { useAppForm } from "~client/components/form";
import {
  Button,
  Combobox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~client/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~client/components/ui/select";
import { trpc } from "~client/lib/trpc";
import dayjs from "dayjs";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
  SquarePen,
  TextAlignStart,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

type UserForCombobox = { id: number; nameFirst: string; nameLast: string };

export const Route = createFileRoute("/_app/calendar/events/$eventId")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Event" }],
  }),
});

function RouteComponent() {
  // Params & Hooks
  const nav = useNavigate();
  const { eventId } = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);

  // Queries
  const { data: allPositions } = useQuery(
    trpc.calendar.positions.listAllPositions.queryOptions(),
  );
  const { data: allUsers } = useQuery(
    trpc.users.getUsersForCombobox.queryOptions(),
  );
  const { data: event, isLoading: eventIsLoading } = useQuery(
    trpc.calendar.events.getEvent.queryOptions({ eventId: Number(eventId) }),
  );
  const { data: shifts, isLoading: shiftsIsLoading } = useQuery(
    trpc.calendar.shifts.getActiveSlotsByEventId.queryOptions({
      eventId: Number(eventId),
    }),
  );

  // Mutations
  const updateEvent = useMutation(
    trpc.calendar.events.updateEventDetails.mutationOptions(),
  );

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

      await updateEvent.mutateAsync({
        ...eventData,
        eventId: Number(eventId),
      });

      nav({ reloadDocument: true });
    },
  });

  // Render
  if (eventIsLoading || shiftsIsLoading) return <div>Loading event</div>;
  if (!event) {
    console.error("Event not found");
    return <div>Event not found</div>;
  }
  return (
    <>
      <WorkspaceHeader>{event.name}</WorkspaceHeader>
      <WorkspaceContent
        className="gap-16"
        orientation="horizontal"
        toolbar={
          <div>
            <Button
              disabled={isEditing}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {/* <SquarePen /> */}
              Edit
            </Button>
          </div>
        }
      >
        {/* DETAILS */}
        <div className="flex flex-col gap-2 xl:w-md">
          <span className="border-b border-slate-300 pb-0.5 font-semibold">
            Details
          </span>
          {isEditing ? (
            // Form
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
              <AddressFieldGroup
                form={form}
                fields={{ location: "location" }}
              />
              <DescFieldGroup
                form={form}
                fields={{ eventName: "eventName", description: "description" }}
              />
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
            </form>
          ) : (
            // Display
            <div className="flex flex-col gap-4">
              {/* Date and time */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span className="flex-1">
                    {dayjs(event.timeBegin).format("dddd, MMMM D, YYYY")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span className="flex-1">{`${dayjs(event.timeBegin).format("h:mm A")}${event.timeEnd ? ` — ${dayjs(event.timeEnd).format("h:mm A")}` : null}`}</span>
                </div>
                <Button className="ml-6" size="sm" variant="link">
                  Add to calendar
                </Button>
              </div>
              {/* Location */}
              {event.location && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span className="flex-1">{event.location}</span>
                  </div>
                  <Button className="ml-6" size="sm" variant="link">
                    Get directions
                  </Button>
                </div>
              )}
              {/* Description */}
              {event.description && (
                <div className="flex items-start gap-2">
                  <TextAlignStart className="mt-1 size-4" />
                  {/* TODO: This doesn't currently render things like line breaks, and <pre> does not work. */}
                  <span className="flex-1">{event.description}</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* TEAMS */}
        <div className="flex flex-col gap-2 xl:w-lg">
          <div className="flex items-center justify-between gap-2 border-b border-slate-300 pb-0.5">
            <span className="font-semibold">Teams</span>
            <Button size="sm" variant="link">
              <Link
                to="/admin/matrix"
                search={{
                  eventId: event.id,
                }}
              >
                Open in Matrix
              </Link>
            </Button>
          </div>
          <div className="flex flex-col">
            {shifts &&
              shifts
                .sort((a, b) => a.positionLabel.localeCompare(b.positionLabel))
                .map((shift) => (
                  // Shift
                  <div
                    key={shift.id}
                    className="flex gap-4 divide-x divide-gray-300 border-gray-200 not-first:border-t not-first:*:pt-2 not-last:*:pb-6"
                  >
                    <div className="flex w-48 flex-col items-end gap-1 pr-4">
                      <span>{shift.positionLabel}</span>
                      <SlotQuantity
                        count={shift.slots.length}
                        shiftId={shift.id}
                        quantity={shift.quantity}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      {shift.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                              <UserRound className="size-8 translate-y-1 scale-120 fill-gray-500/30 stroke-0" />
                            </div>
                            <span>
                              {slot.user.nameFirst} {slot.user.nameLast}
                              {shift.positionId === 4 && ", MD"}
                            </span>
                          </div>
                          <DialogModifySlot
                            current={`${slot.user.nameFirst} ${slot.user.nameLast}`}
                            slotId={slot.id}
                            users={allUsers ?? []}
                          />
                        </div>
                      ))}
                      <DialogAssignSlot
                        label={shift.positionLabel}
                        shiftId={shift.id}
                        users={allUsers ?? []}
                      />
                      {/* {shift.slots.length < shift.quantity && (
                      <Button variant="link">Sign up</Button>
                    )} */}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </WorkspaceContent>
    </>
  );
}

type SlotQuantityProps = {
  count: number;
  shiftId: number;
  quantity: number;
};

function SlotQuantity({ count, shiftId, quantity }: SlotQuantityProps) {
  const nav = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<number>(quantity);

  const { mutate: updateSlotQuantity } = useMutation(
    trpc.calendar.shifts.updateSlotQuantity.mutationOptions({
      onSuccess: () => {
        nav({ reloadDocument: true });
      },
    }),
  );

  const minSlots = count;

  return (
    <div className="flex flex-col items-end gap-1">
      {isEditing ? (
        <>
          <div className="flex items-center gap-1">
            <Button
              disabled={value <= Math.max(minSlots, 1)}
              round
              size="icon-xs"
              variant="text"
              onClick={() => setValue((v) => v - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <Input
              className="w-12 [&_input]:text-center"
              inputMode="numeric"
              size="sm"
              type="text"
              value={value}
              onBeforeInput={(e) => {
                if (
                  e.nativeEvent.data &&
                  !/^[0-9]+$/.test(e.nativeEvent.data)
                ) {
                  e.preventDefault();
                }
              }}
              onBlur={(e) =>
                Number(e.target.value) < minSlots && setValue(minSlots)
              }
              onChange={(e) => setValue(Number(e.target.value))}
            />
            <Button
              round
              size="icon-xs"
              type="button"
              variant="text"
              onClick={() => setValue((v) => v + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="filled"
              onClick={() => {
                setIsEditing(false);
                setValue(quantity);
              }}
            >
              <X />
            </Button>
            <Button
              size="icon-sm"
              variant="filled"
              onClick={() => {
                if (value !== quantity) {
                  updateSlotQuantity({
                    shiftId: shiftId,
                    quantity: value,
                  });
                } else {
                  setIsEditing(false);
                }
              }}
            >
              <Check />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-sm">{`${count} of ${quantity} filled`}</span>
          <Button
            size="icon-xs"
            variant="text"
            onClick={() => setIsEditing(true)}
          >
            <SquarePen className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

type DialogAssignSlotProps = {
  label: string;
  shiftId: number;
  users: UserForCombobox[];
};

function DialogAssignSlot({ label, shiftId, users }: DialogAssignSlotProps) {
  const nav = useNavigate();
  const [userToAssign, setUserToAssign] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { mutate: assignSlot } = useMutation(
    trpc.calendar.shifts.assignUserToShift.mutationOptions({
      onSuccess: () => {
        nav({ reloadDocument: true });
      },
    }),
  );

  return (
    <Dialog
      onOpenChange={(open) => {
        // Reset state when dialog is closed
        if (!open) {
          setUserToAssign(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="link">Assign</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign User</DialogTitle>
          <DialogDescription>
            Assign a user for <span className="font-semibold">{label}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-3/5 flex-col gap-1">
          <span className="text-sm font-semibold">Assign to</span>
          <Combobox
            options={users}
            getId={(user) => user.id.toString()}
            getLabel={(user) => `${user.nameFirst} ${user.nameLast}`}
            onSelect={setUserToAssign}
            value={userToAssign!}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <Tooltip
            open={tooltipOpen && userToAssign === null}
            onOpenChange={setTooltipOpen}
          >
            <TooltipTrigger asChild>
              <div className="has-[:disabled]:cursor-not-allowed">
                <Button
                  disabled={!userToAssign}
                  variant="solid"
                  onClick={() => {
                    assignSlot({
                      shiftId,
                      userId: Number(userToAssign),
                    });
                  }}
                >
                  Modify
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Select a new user for this slot or remove it instead
            </TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DialogModifySlotProps = {
  current: string;
  slotId: number;
  users: UserForCombobox[];
};
function DialogModifySlot({ current, slotId, users }: DialogModifySlotProps) {
  const nav = useNavigate();
  const [action, setAction] = useState<"remove" | "reassign" | "">("");
  const [newUserToAssign, setNewUserToAssign] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { mutate: reassignSlot } = useMutation(
    trpc.calendar.shifts.reassignSlot.mutationOptions({
      onSuccess: () => {
        nav({ reloadDocument: true });
      },
    }),
  );

  const { mutate: deleteSlot } = useMutation(
    trpc.calendar.shifts.deleteSlot.mutationOptions({
      onSuccess: () => {
        nav({ reloadDocument: true });
      },
    }),
  );

  return (
    <Dialog
      onOpenChange={(open) => {
        // Reset state when dialog is closed
        if (!open) {
          setAction("");
          setNewUserToAssign(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="link">
          Modify
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modify Slot</DialogTitle>
          <DialogDescription>Remove or reassign this user.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remove">Remove</SelectItem>
              <SelectItem value="reassign">Reassign</SelectItem>
            </SelectContent>
          </Select>
          {action === "remove" && (
            <div>
              You are removing <span className="font-semibold">{current}</span>{" "}
              from this slot.
            </div>
          )}
          {action === "reassign" && (
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Current user</span>
                <div className="flex h-9 items-center justify-start">
                  <span>{current}</span>
                </div>
              </div>
              <ArrowRight className="size-4" />
              <div className="flex w-3/5 flex-col gap-1">
                <span className="text-sm font-semibold">Reassign to</span>
                <Combobox
                  options={users}
                  getId={(user) => user.id.toString()}
                  getLabel={(user) => `${user.nameFirst} ${user.nameLast}`}
                  onSelect={setNewUserToAssign}
                  value={newUserToAssign!}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <Tooltip
            open={
              tooltipOpen &&
              (action === "" ||
                (action === "reassign" && newUserToAssign === null))
            }
            onOpenChange={setTooltipOpen}
          >
            <TooltipTrigger asChild>
              <div className="has-[:disabled]:cursor-not-allowed">
                <Button
                  className="cursor-not-allowed"
                  disabled={
                    !action || (action === "reassign" && !newUserToAssign)
                  }
                  variant="solid"
                  onClick={() => {
                    if (action === "") return;
                    if (action === "reassign") {
                      reassignSlot({
                        slotId,
                        userId: Number(newUserToAssign),
                      });
                    }
                    if (action === "remove") {
                      deleteSlot({
                        slotId,
                      });
                    }
                  }}
                >
                  Modify
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {action === ""
                ? "Select an action to continue"
                : action === "reassign" &&
                  "Select a new user for this slot or remove it instead"}
            </TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// // {/* TEAMS */}
// <div className="flex w-md flex-col gap-2">
//   <div className="flex items-center justify-between gap-2 border-b border-slate-300 pb-0.5">
//     <span className="font-semibold">Teams</span>
//     <Button size="sm" variant="link">
//       <Link
//         to="/admin/matrix"
//         search={{
//           eventId: event.id,
//         }}
//       >
//         Open in Matrix
//       </Link>
//     </Button>
//   </div>
//   <div className="flex flex-col gap-6">
//     {shifts &&
//       shifts.map((shift) => (
//         // Shift
//         <div key={shift.id} className="flex flex-col gap-2 border-l-4 pl-2">
//           {/* Shift header with position title and slot quantity */}
//           <div className="flex items-center justify-between gap-2">
//             <span className="font-semibold">{shift.positionLabel}</span>
//             {/* shift slot quantity */}
//             <span>{`${shift.slots.length} of ${shift.quantity} filled`}</span>
//           </div>
//           {/* Shift slots */}
//           <div className="flex flex-col gap-1 pl-1">
//             {shift.slots.map((slot) => (
//               <div
//                 key={slot.id}
//                 className="flex items-center justify-between gap-2"
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
//                     <UserRound className="size-8 translate-y-1 scale-120 fill-gray-500/30 stroke-0" />
//                   </div>
//                   <span>
//                     {slot.user.nameFirst} {slot.user.nameLast}
//                   </span>
//                 </div>
//                 {/* <div>
//                           <DialogModifySlot
//                             current={`${slot.user.nameFirst} ${slot.user.nameLast}`}
//                             slotId={slot.id}
//                             users={allUsers ?? []}
//                           />
//                         </div> */}
//               </div>
//             ))}
//             {/* <DialogAssignSlot
//                       label={shift.positionLabel}
//                       users={allUsers ?? []}
//                     /> */}
//             {shift.slots.length < shift.quantity && (
//               <Button variant="link">Sign up</Button>
//             )}
//           </div>
//         </div>
//       ))}
//   </div>
// </div>;

// {
//   /* TEAMS */
// }
// <div className="flex w-md flex-col gap-2">
//   <span className="border-b border-slate-300 pb-0.5 font-semibold">Teams</span>
//   <div className="flex flex-col gap-6">
//     {shifts &&
//       shifts.map((shift) => (
//         // Shift
//         <div key={shift.id} className="flex flex-col gap-2 border-l-4 pl-2">
//           {/* Shift header with position title and slot quantity */}
//           <div className="flex items-center justify-between gap-2">
//             <span className="font-semibold">{shift.positionLabel}</span>
//             {/* shift slot quantity */}
//             <div className="flex items-center gap-2">
//               <span>{`${shift.slots.length} of ${shift.quantity} filled`}</span>
//               <Button size="sm" variant="link">
//                 Change quantity
//               </Button>
//             </div>
//           </div>
//           {/* Shift slots */}
//           <div className="flex flex-col gap-1 pl-1">
//             {shift.slots.map((slot) => (
//               <div
//                 key={slot.id}
//                 className="flex items-center justify-between gap-2"
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
//                     <UserRound className="size-8 translate-y-1 scale-120 fill-gray-500/30 stroke-0" />
//                   </div>
//                   <span>
//                     {slot.user.nameFirst} {slot.user.nameLast}
//                   </span>
//                 </div>
//                 <div>
//                   <DialogModifySlot
//                     current={`${slot.user.nameFirst} ${slot.user.nameLast}`}
//                     slotId={slot.id}
//                     users={allUsers ?? []}
//                   />
//                 </div>
//               </div>
//             ))}
//             <DialogAssignSlot
//               label={shift.positionLabel}
//               users={allUsers ?? []}
//             />
//             {shift.slots.length < shift.quantity && (
//               <Button variant="link">Sign up</Button>
//             )}
//           </div>
//         </div>
//       ))}
//   </div>
// </div>;
