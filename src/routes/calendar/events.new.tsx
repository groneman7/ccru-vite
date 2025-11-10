import { useMutation, useQuery } from "convex/react";
import { api } from "api";
import type { Id } from "@/convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, useStore } from "@tanstack/react-form";
import { WorkspaceContent, WorkspaceHeader } from "@/src/components";
import {
  Button,
  Combobox,
  DatePicker,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  TimePicker,
} from "@/src/components/ui";
import { cn } from "@/src/components/utils";
import { Minus, Plus, Search } from "lucide-react";
import dayjs from "dayjs";

type Shift = {
  positionId: string;
  slots: (Id<"users"> | null)[];
  quantity: number;
};

const DEFAULT_SHIFTS: Shift[] = [];

export const Route = createFileRoute("/calendar/events/new")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Create Event" }],
  }),
});

function RouteComponent() {
  const nav = useNavigate();
  const allUsers = useQuery(api.users.getAllUsers);
  const getAllPositions = useQuery(api.positions.getAllPositions);
  const createEvent = useMutation(api.events.createEvent);

  const form = useForm({
    defaultValues: {
      eventName: "",
      description: "",
      location: "",
      date: dayjs().format("YYYY-MM-DD"),
      timeStart: "",
      timeEnd: "",
      shifts: DEFAULT_SHIFTS,
    },
    onSubmit: async ({ value }) => {
      const timeStart = dayjs(`${value.date} ${value.timeStart}`).toISOString();
      const timeEnd = value.timeEnd
        ? dayjs(`${value.date} ${value.timeEnd}`).toISOString()
        : undefined;

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
    },
  });

  const store = useStore(form.store, (state) => state.values);

  return (
    <>
      <WorkspaceHeader>Create Event</WorkspaceHeader>
      <WorkspaceContent orientation="horizontal">
        <form
          className="flex-1"
          id="create-event-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}>
          <FieldGroup>
            <form.Field name="eventName">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Event Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Choose a name for your event"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="date">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Event Date</FieldLabel>
                    <DatePicker
                      value={dayjs(field.state.value)}
                      onChange={(value) =>
                        field.handleChange(dayjs(value).format("YYYY-MM-DD"))
                      }
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            {/* TODO: Add location autocomplete via some external API */}
            {/* TODO: Augment location autocomplete with recently used locations */}
            <form.Field name="location">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Choose a location for your event"
                      autoComplete="off"
                    />
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="timeStart">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Start Time</FieldLabel>
                    <TimePicker
                      placeholder="e.g., 1:00 PM or 1300"
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="timeEnd">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>End Time</FieldLabel>
                    <TimePicker
                      placeholder="e.g., 1:00 PM or 1300"
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            {/* TODO: Extract this cool stuff into a component of some sorts? */}
            {/* Info: This is a version of Epic's array fields that allow reselecting options, etc. */}
            <form.Field
              mode="array"
              name="shifts">
              {(shiftsArrayField) => {
                return (
                  <div className="flex flex-col gap-6">
                    {shiftsArrayField.state.value.map((_, i) => {
                      return (
                        <div
                          key={i}
                          className="border-2 border-red-500 flex flex-col gap-1 flex-1">
                          <div
                            key={i}
                            className="border-b border-border flex items-center justify-between flex-1">
                            <form.Field name={`shifts[${i}].positionId`}>
                              {(positionField) => {
                                return (
                                  <span className="flex-1 font-semibold">
                                    {
                                      getAllPositions?.find(
                                        (item) => item._id === positionField.state.value
                                      )?.label
                                    }
                                  </span>
                                );
                              }}
                            </form.Field>
                            <form.Field name={`shifts[${i}].quantity`}>
                              {(quantityField) => {
                                const minSlots = form.state.values.shifts[i].slots.length;
                                return (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      disabled={
                                        quantityField.state.value <=
                                        Math.max(form.state.values.shifts[i].slots.length, 1)
                                      }
                                      round
                                      size="icon-xs"
                                      variant="text"
                                      onClick={() => quantityField.handleChange((v) => v - 1)}>
                                      <Minus className="size-3" />
                                    </Button>
                                    <Input
                                      className="w-12 [&_input]:text-center"
                                      inputMode="numeric"
                                      size="sm"
                                      type="text"
                                      value={quantityField.state.value}
                                      onBeforeInput={(e) => {
                                        if (
                                          e.nativeEvent.data &&
                                          !/^[0-9]+$/.test(e.nativeEvent.data)
                                        ) {
                                          e.preventDefault();
                                        }
                                      }}
                                      onBlur={(e) =>
                                        Number(e.target.value) < minSlots &&
                                        quantityField.handleChange(minSlots)
                                      }
                                      onChange={(e) =>
                                        quantityField.handleChange(Number(e.target.value))
                                      }
                                    />
                                    <Button
                                      round
                                      size="icon-xs"
                                      type="button"
                                      variant="text"
                                      onClick={() => quantityField.handleChange((v) => v + 1)}>
                                      <Plus className="size-3" />
                                    </Button>
                                  </div>
                                );
                              }}
                            </form.Field>
                          </div>
                          <form.Field
                            mode="array"
                            name={`shifts[${i}].slots`}>
                            {(slotsArrayField) => (
                              <div className="flex flex-col gap-1">
                                <>
                                  {slotsArrayField.state.value
                                    .filter((s) => s !== null)
                                    .map((userId, j) => (
                                      <form.Field
                                        key={j}
                                        name={`shifts[${i}].slots[${j}]`}>
                                        {(slotUserField) => {
                                          const selectedUser =
                                            slotUserField.state.value && allUsers
                                              ? allUsers.find((user) => user._id === userId)
                                              : undefined;
                                          const availableUsers =
                                            allUsers?.filter(
                                              (user) =>
                                                !slotsArrayField.state.value.includes(
                                                  user._id
                                                ) || user._id === userId
                                            ) ?? [];

                                          const options = selectedUser
                                            ? [
                                                selectedUser,
                                                ...availableUsers.filter(
                                                  (user) => user._id !== selectedUser._id
                                                ),
                                              ]
                                            : availableUsers;

                                          return (
                                            <div className="flex items-center gap-2">
                                              <Button
                                                round
                                                size="icon-xs"
                                                onClick={() => slotsArrayField.removeValue(j)}>
                                                <Minus className="size-3 stroke-3" />
                                              </Button>
                                              <Combobox
                                                options={options}
                                                suffix={<Search />}
                                                value={userId}
                                                variant="underlined"
                                                getId={(user) => user._id}
                                                getLabel={(user) =>
                                                  `${user.firstName} ${user.lastName}`
                                                }
                                                onSelect={(value) =>
                                                  slotUserField.handleChange(
                                                    value as Id<"users">
                                                  )
                                                }
                                              />
                                            </div>
                                          );
                                        }}
                                      </form.Field>
                                    ))}
                                  <div className="flex items-center gap-2">
                                    <div className="w-5"></div>
                                    <Combobox
                                      clearOnSelect
                                      options={allUsers?.filter(
                                        (user) =>
                                          !slotsArrayField.state.value.includes(user._id)
                                      )}
                                      placeholder="Search users..."
                                      suffix={<Search />}
                                      variant="underlined"
                                      getId={(user) => user._id}
                                      getLabel={(user) => `${user.firstName} ${user.lastName}`}
                                      onSelect={(value) => {
                                        slotsArrayField.pushValue(value as Id<"users">);
                                        if (
                                          slotsArrayField.state.value.length >
                                          form.state.values.shifts[i].quantity
                                        ) {
                                          form.state.values.shifts[i].quantity =
                                            slotsArrayField.state.value.length;
                                        }
                                      }}
                                    />
                                  </div>
                                </>
                              </div>
                            )}
                          </form.Field>
                        </div>
                      );
                    })}
                    <Combobox
                      className={cn(shiftsArrayField.state.value.length > 0 && "mt-2")}
                      clearOnSelect
                      options={getAllPositions?.filter(
                        (item) =>
                          !shiftsArrayField.state.value
                            .map((shift) => shift.positionId)
                            .includes(item._id)
                      )}
                      placeholder="Add a shift..."
                      suffix={<Search />}
                      getId={(option) => option._id}
                      getLabel={(option) => option.label ?? option.name}
                      render={(option) =>
                        option.label ? (
                          <div className="flex flex-1 items-center justify-between">
                            <span>{option.label}</span>
                            <span className="text-xs text-slate-400">{option.name}</span>
                          </div>
                        ) : (
                          <span>{option.name}</span>
                        )
                      }
                      onSelect={(value) =>
                        shiftsArrayField.pushValue({
                          positionId: value!,
                          slots: [],
                          quantity: 1,
                        })
                      }
                    />
                  </div>
                );
              }}
            </form.Field>
            <Button
              //   disabled
              type="submit"
              variant="solid">
              Create
            </Button>
          </FieldGroup>
        </form>
        <div className="flex-1">
          <pre className="!font-mono">{JSON.stringify(store, null, 4)}</pre>
        </div>
      </WorkspaceContent>
    </>
  );
}
