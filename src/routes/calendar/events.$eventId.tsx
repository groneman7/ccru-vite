import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
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
} from "@/src/components/ui";
import { WorkspaceContent, WorkspaceHeader } from "@/src/components";
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  Minus,
  OctagonAlert,
  Search,
  SquarePen,
} from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";
import { cn } from "@/src/components/utils";
import { useForm, useStore } from "@tanstack/react-form";

export const Route = createFileRoute("/calendar/events/$eventId")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Event" }],
  }),
});

type EventShiftProps = {
  allUsers?: Doc<"users">[];
  shift: {
    _id: Id<"eventShifts">;
    eventId: Id<"events">;
    position: Doc<"eventPositions"> | undefined;
    slots: ({
      userId: Id<"users">;
      user:
        | {
            _id: Id<"users">;
            _creationTime: number;
            clerkId?: string | undefined;
            firstName: string;
            lastName: string;
          }
        | undefined;
      userName: string | undefined;
    } | null)[];
  };
};

function EventShift({ shift, allUsers }: EventShiftProps) {
  const form = useForm({
    defaultValues: {
      slots: shift.slots.filter((s) => s !== null).map((s) => s.userId.toString()),
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const assignUserToShift = useMutation(api.shifts.assignUserToShift);
  const unassignUserFromShift = useMutation(api.shifts.unassignUserFromShift);

  const count = shift.slots.length;
  const filledSlots = shift.slots.filter((slot) => slot !== null).length;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 flex-1",
        isEditing && "border-l-4 border-blue-500 -ml-2.5 pl-1.5"
      )}>
      <div className="border-b border-border flex items-center justify-between flex-1">
        <span className="flex-1 font-semibold">
          {shift.position?.label ?? shift.position?.name}
        </span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button
              className="mb-1"
              size="sm"
              variant="solid"
              onClick={() => setIsEditing(false)}>
              <Check className="size-3 stroke-3" />
              Save changes
            </Button>
          ) : (
            <>
              <span>
                {filledSlots} of {count} filled
              </span>
              <SquarePen
                className="size-3 stroke-2 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setIsEditing(true)}
              />
            </>
          )}
        </div>
      </div>
      {isEditing ? (
        <form className="flex-1">
          <form.Field
            mode="array"
            name="slots">
            {(field) => (
              <div className="flex flex-col gap-1">
                <>
                  {field.state.value.map((_, i) => (
                    <form.Field
                      key={i}
                      name={`slots[${i}]`}>
                      {(subField) => (
                        <div className="flex items-center gap-2">
                          <Button
                            round
                            size="icon-xs"
                            onClick={() => field.removeValue(i)}>
                            <Minus />
                          </Button>
                          <Combobox
                            options={[
                              allUsers?.find((user) => user._id === field.state.value[i])!,
                              ...(allUsers?.filter(
                                (user) => !field.state.value.includes(user._id)
                              ) ?? []),
                            ]}
                            suffix={<Search />}
                            value={subField.state.value ?? undefined}
                            variant="underlined"
                            getId={(user) => user._id}
                            getLabel={(user) => `${user.firstName} ${user.lastName}`}
                            onSelect={(value) => subField.handleChange(value!)}
                          />
                        </div>
                      )}
                    </form.Field>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-5"></div>
                    <Combobox
                      clearOnSelect
                      options={allUsers?.filter(
                        (user) => !field.state.value.includes(user._id)
                      )}
                      suffix={<Search />}
                      variant="underlined"
                      getId={(user) => user._id}
                      getLabel={(user) => `${user.firstName} ${user.lastName}`}
                      onSelect={(value) => field.pushValue(value!)}
                    />
                  </div>
                </>
              </div>
            )}
          </form.Field>
        </form>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            {shift.slots.map(
              (s) =>
                s !== null && (
                  <span key={s.userId}>
                    {s.user!.firstName} {s.user!.lastName}
                  </span>
                )
            )}
          </div>
          {filledSlots !== count && (
            // TODO: Implement actual sign up button
            <span className="hover:underline cursor-pointer text-blue-600 select-none">
              Sign up
            </span>
          )}
        </>
      )}
    </div>
  );
}

function RouteComponent() {
  const { eventId } = Route.useParams();
  const nav = useNavigate();
  const event = useQuery(api.events.getEventById, { id: eventId as Id<"events"> });
  const deleteEvent = useMutation(api.events.deleteEvent);
  const eventShifts = useQuery(api.shifts.getEventShifts, { eventId: eventId as Id<"events"> });
  const allUsers = useQuery(api.users.getAllUsers);

  if (!event) return null;

  function handleDeleteEvent() {
    deleteEvent({ eventId: eventId as Id<"events"> });
    nav({ to: "/calendar" });
  }

  return (
    <>
      <WorkspaceHeader>{event.name}</WorkspaceHeader>
      <WorkspaceContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Delete Event</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <OctagonAlert className="stroke-red-600 size-6 stroke-3" />
                Delete event
              </AlertDialogTitle>
              <AlertDialogDescription>
                Deleting an event is irreversible. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex flex-col gap-1">
          <span className="flex gap-2 items-center">
            <Calendar className="size-4" />
            {dayjs(event.timeStart).format("dddd, MMMM D, YYYY")}
          </span>
          <span className="flex gap-2 items-center">
            <Clock className="size-4" />
            {dayjs(event.timeStart).format("h:mm A")}
            {event.timeEnd && ` – ${dayjs(event.timeEnd).format("h:mm A")}`}
          </span>
          {event.location && (
            <span className="flex gap-2 items-center">
              <MapPin className="size-4" />
              {event.location}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-6">
          {eventShifts ? (
            eventShifts.map((shift) => (
              <EventShift
                key={shift._id}
                allUsers={allUsers}
                shift={shift}
              />
            ))
          ) : (
            <div>No shifts</div>
          )}
        </div>
      </WorkspaceContent>
    </>
  );
}
