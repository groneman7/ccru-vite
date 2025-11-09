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
} from "@/src/components/ui";
import { WorkspaceContent, WorkspaceHeader } from "@/src/components";
import { Calendar, Clock, MapPin, OctagonAlert } from "lucide-react";
import dayjs from "dayjs";

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

function EventShift({ shift /* , allUsers */ }: EventShiftProps) {
  console.log(shift);
  const assignUserToShift = useMutation(api.shifts.assignUserToShift);
  const unassignUserFromShift = useMutation(api.shifts.unassignUserFromShift);

  const count = shift.slots.length;
  const filledSlots = shift.slots.filter((slot) => slot !== null).length;

  return (
    <div className="flex flex-col gap-1 flex-1">
      <div className="border-b border-border flex items-center justify-between flex-1">
        <span className="flex-1 font-semibold">
          {shift.position?.label ?? shift.position?.name}
        </span>
        <span>
          {filledSlots} of {count} filled
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {shift.slots.map(
          (s) =>
            s !== null && (
              <span>
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
        <div className="flex flex-col gap-4">
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
