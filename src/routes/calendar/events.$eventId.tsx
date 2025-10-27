import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { WorkspaceContent, WorkspaceHeader } from "@/src/components";
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
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { Calendar, Clock, Ellipsis, MapPin } from "lucide-react";

export const Route = createFileRoute("/calendar/events/$eventId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { eventId } = Route.useParams();
    const event = useQuery(api.events.getEventById, { id: eventId as Id<"events"> });
    const eventShifts = useQuery(api.events.getEventShifts, { eventId: eventId as Id<"events"> });
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
                            <div
                                key={shift._id}
                                className="flex w-96 gap-2">
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            variant="text"
                                            size="icon-sm">
                                            <Ellipsis className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right">
                                        {shift.userId ? (
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
                                                                        <CommandItem>
                                                                            {user.firstName} {user.lastName}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                        ) : (
                                            <DropdownMenuItem>Assign</DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))
                    ) : (
                        <div>No shifts</div>
                    )}
                </div>
            </WorkspaceContent>
        </>
    );
}
