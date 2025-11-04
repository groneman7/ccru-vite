import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/src/components/ui";
import { WorkspaceContent, WorkspaceHeader } from "@/src/components";
import { Calendar, Clock, Ellipsis, MapPin } from "lucide-react";
import dayjs from "dayjs";

export const Route = createFileRoute("/calendar/events/$eventId")({
  component: RouteComponent,
});

type EventShiftProps = {
  allUsers?: Doc<"users">[];
  shift: Doc<"eventShifts"> & {
    position: Doc<"eventPositions"> | undefined;
    userName: string | undefined;
  };
};
function EventShift({ shift, allUsers }: EventShiftProps) {
  const assignUserToShift = useMutation(api.shifts.assignUserToShift);
  const unassignUserFromShift = useMutation(api.shifts.unassignUserFromShift);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  return (
    <div className="flex w-96 gap-2">
      <span className="flex-1 font-semibold">
        {shift.position?.label ?? shift.position?.name}
      </span>
      <span className="flex-1">
        {shift.userName ?? (
          <span className="hover:underline cursor-pointer text-blue-600 select-none">
            Sign up
          </span>
        )}
      </span>
      <DropdownMenu
        open={actionsMenuOpen}
        onOpenChange={setActionsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="text"
            size="icon-sm">
            <Ellipsis className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right">
          {shift.userId ? (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Reassign</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <Command>
                      <CommandInput
                        placeholder="Search users..."
                        autoFocus
                      />
                      <CommandList>
                        <CommandEmpty>No users found</CommandEmpty>
                        <CommandGroup>
                          {allUsers?.map((user) => (
                            <CommandItem
                              key={user._id}
                              onSelect={() => {
                                assignUserToShift({
                                  shiftId: shift._id,
                                  userId: user._id,
                                });
                                setActionsMenuOpen(false);
                              }}>
                              {user.firstName} {user.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem
                onSelect={() => {
                  unassignUserFromShift({ shiftId: shift._id });
                  setActionsMenuOpen(false);
                }}>
                Unassign
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Assign</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <Command>
                    <CommandInput
                      placeholder="Search users..."
                      autoFocus
                    />
                    <CommandList>
                      <CommandEmpty>No users found</CommandEmpty>
                      <CommandGroup>
                        {allUsers?.map((user) => (
                          <CommandItem
                            key={user._id}
                            onSelect={() => {
                              assignUserToShift({ shiftId: shift._id, userId: user._id });
                              setActionsMenuOpen(false);
                            }}>
                            {user.firstName} {user.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function RouteComponent() {
  const { eventId } = Route.useParams();
  const event = useQuery(api.events.getEventById, { id: eventId as Id<"events"> });
  const eventShifts = useQuery(api.shifts.getEventShifts, { eventId: eventId as Id<"events"> });
  const allUsers = useQuery(api.users.getAllUsers);

  if (!event) return null;

  return (
    <>
      <WorkspaceHeader>{event.name}</WorkspaceHeader>
      <WorkspaceContent>
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
