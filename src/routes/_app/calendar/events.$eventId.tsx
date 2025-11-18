import { WorkspaceContent, WorkspaceHeader } from "@/components";
import { EventForm } from "@/components/event-form";
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
  Input,
} from "@/components/ui";
import { cn } from "@/components/utils";
import { trpc } from "@/lib/trpc";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
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
  X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/calendar/events/$eventId")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Event" }],
  }),
});

// type EventShiftProps = {
//   allUsers?: Doc<"users">[];
//   shift: {
//     _id: Id<"eventShifts">;
//     eventId: Id<"events">;
//     position: Doc<"eventPositions"> | undefined;
//     slots: ({
//       userId: Id<"users">;
//       user:
//         | {
//             _id: Id<"users">;
//             _creationTime: number;
//             clerkId?: string | undefined;
//             firstName: string;
//             lastName: string;
//           }
//         | undefined;
//       userName: string | undefined;
//     } | null)[];
//   };
// };

// function EventShift({ shift, allUsers }: EventShiftProps) {
//   const test = useCurrentUser();
//   const updateShiftSlots = useMutation(api.shifts.updateShiftSlots);
//   const [isEditing, setIsEditing] = useState(false);
//   const form = useForm({
//     defaultValues: {
//       slots: shift.slots.filter((s) => s !== null).map((s) => s.userId.toString()),
//       quantity: shift.slots.length,
//     },
//     onSubmit: async ({ value }) => {
//       const slots: (Id<"users"> | null)[] = [];
//       const test = value.slots.length;
//       const { quantity } = value;

//       if (test < 1) {
//         slots.push(null);
//       } else if (test < quantity) {
//         slots.push(...(value.slots as Id<"users">[]), ...Array(quantity - test).fill(null));
//       } else if (test === quantity) {
//         slots.push(...(value.slots as Id<"users">[]));
//       } else {
//         console.error(
//           "An unexpected condition occured while updating shift slots. Changes were not saved."
//         );
//       }

//       await updateShiftSlots({ slots, shiftId: shift._id });
//       setIsEditing(false);
//     },
//   });
//   const minSlots = useStore(form.store, (state) => state.values.slots.length);

//   const assignUserToShift = useMutation(api.shifts.assignUserToShift);
//   const unassignUserFromShift = useMutation(api.shifts.unassignUserFromShift);

//   const count = shift.slots.length;
//   const filledSlots = shift.slots.filter((slot) => slot !== null).length;

//   return (
//     <div
//       className={cn(
//         "flex flex-col gap-1 flex-1",
//         isEditing && "border-l-4 border-blue-500 -ml-2.5 pl-1.5"
//       )}>
//       <div className="border-b border-border flex items-center justify-between flex-1">
//         <span className="flex-1 font-semibold">
//           {shift.position?.label ?? shift.position?.name}
//         </span>
//         <div className="flex items-center gap-2 mb-1">
//           {isEditing ? (
//             <>
//               <form.Field name="quantity">
//                 {(field) => (
//                   <div className="flex items-center gap-1">
//                     <Button
//                       disabled={
//                         field.state.value <= Math.max(form.state.values.slots.length, 1)
//                       }
//                       round
//                       size="icon-xs"
//                       variant="text"
//                       onClick={() => field.handleChange((v) => v - 1)}>
//                       <Minus className="size-3" />
//                     </Button>
//                     <Input
//                       className="w-12 [&_input]:text-center"
//                       inputMode="numeric"
//                       size="sm"
//                       type="text"
//                       value={field.state.value}
//                       onBeforeInput={(e) => {
//                         if (e.nativeEvent.data && !/^[0-9]+$/.test(e.nativeEvent.data)) {
//                           e.preventDefault();
//                         }
//                       }}
//                       onBlur={(e) =>
//                         Number(e.target.value) < minSlots && field.handleChange(minSlots)
//                       }
//                       onChange={(e) => field.handleChange(Number(e.target.value))}
//                     />
//                     <Button
//                       round
//                       size="icon-xs"
//                       type="button"
//                       variant="text"
//                       onClick={() => field.handleChange((v) => v + 1)}>
//                       <Plus className="size-3" />
//                     </Button>
//                   </div>
//                 )}
//               </form.Field>
//               <Button
//                 onClick={() => {
//                   form.reset();
//                   setIsEditing(false);
//                 }}
//                 size="sm">
//                 <X className="size-4 stroke-3 mt-[0.5px]" />
//                 Cancel
//               </Button>
//               <Button
//                 size="sm"
//                 variant="solid"
//                 onClick={form.handleSubmit}>
//                 <Check className="size-4 stroke-3 mt-[0.5px]" />
//                 Save changes
//               </Button>
//             </>
//           ) : (
//             <>
//               <span>
//                 {filledSlots} of {count} filled
//               </span>
//               <SquarePen
//                 className="size-3 stroke-2 text-muted-foreground hover:text-foreground cursor-pointer"
//                 onClick={() => setIsEditing(true)}
//               />
//             </>
//           )}
//         </div>
//       </div>
//       {isEditing ? (
//         <form className="flex-1">
//           <form.Field
//             mode="array"
//             name="slots">
//             {(slotsField) => (
//               <div className="flex flex-col gap-1">
//                 <>
//                   {slotsField.state.value.map((_, i) => (
//                     <form.Field
//                       key={i}
//                       name={`slots[${i}]`}>
//                       {(slotUserField) => (
//                         <div className="flex items-center gap-2">
//                           <Button
//                             round
//                             size="icon-xs"
//                             onClick={() => slotsField.removeValue(i)}>
//                             <Minus className="size-3 stroke-3" />
//                           </Button>
//                           <Combobox
//                             options={[
//                               allUsers?.find((user) => user._id === slotsField.state.value[i])!,
//                               ...(allUsers?.filter(
//                                 (user) => !slotsField.state.value.includes(user._id)
//                               ) ?? []),
//                             ]}
//                             suffix={<Search />}
//                             value={slotUserField.state.value ?? undefined}
//                             variant="underlined"
//                             getId={(user) => user._id}
//                             getLabel={(user) => `${user.firstName} ${user.lastName}`}
//                             onSelect={(value) => slotUserField.handleChange(value!)}
//                           />
//                         </div>
//                       )}
//                     </form.Field>
//                   ))}
//                   <div className="flex items-center gap-2">
//                     <div className="w-5"></div>
//                     <Combobox
//                       clearOnSelect
//                       options={allUsers?.filter(
//                         (user) => !slotsField.state.value.includes(user._id)
//                       )}
//                       placeholder="Search users..."
//                       suffix={<Search />}
//                       variant="underlined"
//                       getId={(user) => user._id}
//                       getLabel={(user) => `${user.firstName} ${user.lastName}`}
//                       onSelect={(value) => {
//                         slotsField.pushValue(value!);
//                         if (slotsField.state.value.length > form.state.values.quantity) {
//                           form.state.values.quantity = slotsField.state.value.length;
//                         }
//                       }}
//                     />
//                   </div>
//                 </>
//               </div>
//             )}
//           </form.Field>
//         </form>
//       ) : (
//         <>
//           <div className="flex flex-col gap-1">
//             {shift.slots.map(
//               (s) =>
//                 s !== null && (
//                   <div
//                     key={s.userId}
//                     className="flex gap-1 items-center rounded-sm">
//                     <span
//                       key={s.userId}
//                       className={cn(
//                         s.userId === test.currentUser?._id && "font-semibold text-blue-800"
//                       )}>
//                       {s.user!.firstName} {s.user!.lastName}
//                     </span>
//                     {s.userId === test.currentUser?._id && (
//                       <X
//                         className="size-4 cursor-pointer text-muted-foreground hover:text-foreground"
//                         onClick={() =>
//                           test.currentUser
//                             ? unassignUserFromShift({ shiftId: shift._id, userId: s.userId })
//                             : console.error("Current user not found while trying to unassign")
//                         }
//                       />
//                     )}
//                   </div>
//                 )
//             )}
//           </div>
//           {filledSlots !== count && (
//             <div>
//               <Button
//                 variant="link"
//                 onClick={() =>
//                   test.currentUser
//                     ? assignUserToShift({
//                         shiftId: shift._id,
//                         userToAssignId: test.currentUser._id as Id<"users">,
//                       })
//                     : console.error("Current user not found while trying to sign up")
//                 }>
//                 Sign up
//               </Button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

function RouteComponent() {
  const { eventId } = Route.useParams();
  const { data: event, isLoading: eventIsLoading } = useQuery(
    trpc.events.getEventById.queryOptions({ eventId: Number(eventId) }),
  );
  const { data: shifts, isLoading: shiftsIsLoading } = useQuery(
    trpc.events.getSlotsByEventId.queryOptions({ eventId: Number(eventId) }),
  );
  if (eventIsLoading || shiftsIsLoading) return <div>Loading event</div>;
  // const nav = useNavigate();
  // const event = useQuery(api.events.getEventById, {
  //   id: eventId as Id<"events">,
  // });
  // const eventShifts = useQuery(api.shifts.getEventShifts, {
  //   eventId: eventId as Id<"events">,
  // });
  // const deleteEvent = useMutation(api.events.deleteEvent);

  // if (!event) return null;
  // if (!eventShifts) return null;

  // const mappedShifts = eventShifts.map((shift) => {
  //   const totalSlots = shift.slots.length;
  //   return { ...shift };
  // });

  // function handleDeleteEvent() {
  //   deleteEvent({ eventId: eventId as Id<"events"> });
  //   nav({ to: "/calendar" });
  // }

  return (
    <>
      {/* <WorkspaceHeader>{event.name}</WorkspaceHeader> */}
      <WorkspaceContent>
        <EventForm event={event} shifts={shifts} />
        {/* <AlertDialog>
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
        {eventShifts && (
          <div className="flex flex-col gap-6">
            {eventShifts.map((shift) => (
              <EventShift
                key={shift._id}
                allUsers={allUsers}
                shift={shift}
              />
            ))}
          </div>
        )} */}
      </WorkspaceContent>
    </>
  );
}
