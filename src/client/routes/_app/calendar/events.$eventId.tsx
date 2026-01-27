import { useStore } from "@tanstack/react-form";
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
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
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
import type { Position, UserForCombobox } from "~shared/types";
import dayjs from "dayjs";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckIcon,
  Clock,
  FilePenIcon,
  MapPin,
  Minus,
  Plus,
  PlusIcon,
  SquarePen,
  TextAlignStart,
  UserRound,
  X,
  XIcon,
} from "lucide-react";
import { useState } from "react";

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
  const { data: allUsers } = useQuery(
    trpc.users.getUsersForCombobox.queryOptions(),
  );
  const { data: event, isLoading: eventIsLoading } = useQuery(
    trpc.calendar.events.getEvent.queryOptions({ eventId: eventId }),
  );
  const { data: shifts, isLoading: shiftsIsLoading } = useQuery(
    trpc.calendar.shifts.getActiveSlotsByEventId.queryOptions({
      eventId: eventId,
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
        eventId: eventId,
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
              <FilePenIcon />
              Edit
            </Button>
          </div>
        }
      >
        {/* DETAILS */}
        <div className="flex flex-1 flex-col gap-2 lg:max-w-md">
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
                  <XIcon />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  onClick={() => form.handleSubmit()}
                >
                  <CheckIcon />
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
        <div className="flex flex-1 flex-col gap-2 lg:max-w-lg">
          <div className="flex items-center justify-between gap-2 border-b border-slate-300 pb-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Teams</span>
            </div>
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
          <div className="flex flex-col gap-4">
            {shifts &&
              shifts
                .sort((a, b) =>
                  a.positionDisplay.localeCompare(b.positionDisplay),
                )
                .map((shift) => (
                  <div
                    key={shift.id}
                    className="flex gap-2 rounded-md p-4 shadow-sm"
                  >
                    <div className="flex w-40 flex-col">
                      <span>{shift.positionDisplay}</span>
                      <SlotQuantity
                        count={shift.slots.length}
                        shiftId={shift.id}
                        quantity={shift.quantity}
                      />
                    </div>
                    <div>
                      {shift.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                              <UserRound className="size-8 translate-y-1 scale-120 fill-gray-500/30 stroke-0" />
                            </div>
                            <span>{slot.user.displayName}</span>
                          </div>
                          <DialogModifySlot
                            current={`${slot.user.nameFirst} ${slot.user.nameLast}`}
                            slotId={slot.id}
                            users={allUsers ?? []}
                          />
                        </div>
                      ))}
                      <DialogAssignSlot
                        label={shift.positionDisplay}
                        shiftId={shift.id}
                        users={allUsers ?? []}
                      />
                      {/* {shift.slots.length < shift.quantity && (
    <Button variant="link">Sign up</Button>
  )} */}
                    </div>
                    <div></div>
                  </div>
                ))}
            <DialogAddShift
              eventId={event.id}
              existingShifts={
                shifts
                  ?.sort((a, b) =>
                    a.positionDisplay.localeCompare(b.positionDisplay),
                  )
                  .map((s) => s.positionId) ?? []
              }
            />
          </div>
        </div>
      </WorkspaceContent>
    </>
  );
}

type SlotQuantityProps = {
  count: number;
  shiftId: string;
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
    <div className="flex flex-col gap-1">
      {isEditing ? (
        <>
          <div className="flex items-center gap-1">
            <Button
              disabled={value <= Math.max(minSlots, 1)}
              size="icon-xs"
              variant="ghost"
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
              size="icon-xs"
              type="button"
              variant="ghost"
              onClick={() => setValue((v) => v + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setValue(quantity);
              }}
            >
              <X />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
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
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <SquarePen className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

type DialogAddShiftProps = {
  eventId: string;
  existingShifts: string[]; // Array of shift IDs
};
function DialogAddShift({ eventId, existingShifts }: DialogAddShiftProps) {
  const nav = useNavigate();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { data: positions, isLoading: positionsIsLoading } = useQuery(
    trpc.calendar.positions.listAllPositions.queryOptions(),
  );

  const { mutate: addShifts } = useMutation(
    trpc.calendar.shifts.createShifts.mutationOptions({
      onSuccess: () => {
        nav({ reloadDocument: true });
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      shiftsToCreate: [] as { position: Position; quantity: number }[],
    },
    onSubmit: async ({ value }) => {
      const shiftsToCreate = value.shiftsToCreate.map((s) => ({
        positionId: s.position.id,
        quantity: s.quantity,
      }));

      addShifts({ eventId, shiftsToCreate });
    },
  });

  const length = useStore(
    form.store,
    (state) => state.values.shiftsToCreate.length,
  );

  return (
    <Dialog onOpenChange={(open) => !open && form.reset()}>
      <DialogTrigger
        render={
          <Button variant="ghost">
            <PlusIcon />
            Add
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add Shifts</DialogTitle>
          <DialogDescription>Add shifts for this event.</DialogDescription>
        </DialogHeader>
        <div className="flex w-3/5 flex-col gap-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <form.Field mode="array" name="shiftsToCreate">
              {(shiftsToCreateField) => (
                <div>
                  {shiftsToCreateField.state.value.map((shift, i) => (
                    <div key={shift.position.id} className="flex gap-2">
                      <form.Field name={`shiftsToCreate[${i}].position`}>
                        {(positionField) => (
                          <div>{positionField.state.value.display}</div>
                        )}
                      </form.Field>
                      <form.Field name={`shiftsToCreate[${i}].quantity`}>
                        {(quantityField) => (
                          <div>{quantityField.state.value}</div>
                        )}
                      </form.Field>
                    </div>
                  ))}
                  <Combobox
                    items={positions?.filter(
                      (position) =>
                        !existingShifts.includes(position.id) &&
                        !form.state.values.shiftsToCreate.some(
                          (s) => s.position.id === position.id,
                        ),
                    )}
                    itemToStringLabel={(position: Position) => position.display}
                    onValueChange={(v) =>
                      v &&
                      shiftsToCreateField.pushValue({
                        position: v,
                        quantity: 1,
                      })
                    }
                  >
                    <ComboboxInput placeholder="Search positions..." />
                    <ComboboxContent>
                      <ComboboxEmpty>No positions found.</ComboboxEmpty>
                      <ComboboxList>
                        {(position: Position) => (
                          <ComboboxItem key={position.id} value={position}>
                            <div className="flex flex-1 items-center justify-between">
                              <span>{position.display}</span>
                              <span className="text-xs text-gray-500">
                                {position.name}
                              </span>
                            </div>
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              )}
            </form.Field>
          </form>
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button>
                <XIcon />
                Cancel
              </Button>
            }
          />
          <Tooltip
            open={tooltipOpen && length === 0}
            onOpenChange={setTooltipOpen}
          >
            <TooltipTrigger
              render={
                <div className="has-[:disabled]:cursor-not-allowed">
                  <Button
                    disabled={length === 0}
                    variant="solid"
                    onClick={() => {
                      if (length === 0) return;
                      form.handleSubmit();
                    }}
                  >
                    <CheckIcon />
                    Save
                  </Button>
                </div>
              }
            />
            <TooltipContent>Select positions to add</TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DialogAssignSlotProps = {
  label: string;
  shiftId: string;
  users: UserForCombobox[];
};

function DialogAssignSlot({ label, shiftId, users }: DialogAssignSlotProps) {
  const nav = useNavigate();
  const [userToAssign, setUserToAssign] = useState<
    (typeof users)[number] | null
  >(null);
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
      <DialogTrigger render={<Button variant="link">Assign</Button>} />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Assign User</DialogTitle>
          <DialogDescription>
            Assign a user for <span className="font-semibold">{label}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-3/5 flex-col gap-1">
          <span className="text-sm font-semibold">Assign to</span>
          <Combobox
            items={users}
            value={userToAssign}
            itemToStringLabel={(user: (typeof users)[number]) =>
              `${user.display}`
            }
            onValueChange={setUserToAssign}
          >
            <ComboboxInput placeholder="Search users..." />
            <ComboboxContent>
              <ComboboxEmpty>No users found.</ComboboxEmpty>
              <ComboboxList>
                {(user) => (
                  <ComboboxItem key={user.id} value={user}>
                    {user.display}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button>
                <XIcon />
                Cancel
              </Button>
            }
          />
          <Tooltip
            open={tooltipOpen && userToAssign === null}
            onOpenChange={setTooltipOpen}
          >
            <TooltipTrigger
              render={
                <div className="has-[:disabled]:cursor-not-allowed">
                  <Button
                    disabled={!userToAssign}
                    variant="solid"
                    onClick={() => {
                      if (!userToAssign) return;
                      assignSlot({
                        shiftId,
                        userId: userToAssign.id,
                      });
                    }}
                  >
                    <CheckIcon />
                    Save
                  </Button>
                </div>
              }
            />
            <TooltipContent>Select a user to assign</TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DialogModifySlotProps = {
  current: string;
  slotId: string;
  users: UserForCombobox[];
};
function DialogModifySlot({ current, slotId, users }: DialogModifySlotProps) {
  const nav = useNavigate();
  const [action, setAction] = useState<string>("");
  const [newUserToAssign, setNewUserToAssign] = useState<
    (typeof users)[number] | null
  >(null);
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
    <Dialog onOpenChange={(open) => !open && setAction("")}>
      <DialogTrigger render={<Button variant="link">Modify</Button>} />
      <DialogContent showCloseButton={false}>
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
                  items={users}
                  value={newUserToAssign}
                  itemToStringLabel={(user: (typeof users)[number]) =>
                    `${user.display}`
                  }
                  onValueChange={setNewUserToAssign}
                >
                  <ComboboxInput placeholder="Search users..." />
                  <ComboboxContent>
                    <ComboboxEmpty>No users found.</ComboboxEmpty>
                    <ComboboxList>
                      {(user) => (
                        <ComboboxItem key={user.id} value={user}>
                          {user.display}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button>
                <XIcon />
                Cancel
              </Button>
            }
          />
          <Tooltip
            open={
              tooltipOpen &&
              (action === "" ||
                (action === "reassign" && newUserToAssign === null))
            }
            onOpenChange={setTooltipOpen}
          >
            <TooltipTrigger
              render={
                <div className="has-[:disabled]:cursor-not-allowed">
                  <Button
                    disabled={!newUserToAssign}
                    variant="solid"
                    onClick={() => {
                      if (action === "") return;
                      if (action === "reassign") {
                        if (!newUserToAssign) return;
                        reassignSlot({
                          slotId,
                          userId: newUserToAssign.id,
                        });
                      }
                      if (action === "remove") {
                        deleteSlot({
                          slotId,
                        });
                      }
                    }}
                  >
                    <CheckIcon />
                    Save
                  </Button>
                </div>
              }
            />
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
