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
  //   positionLabel?: string;
  //   positionName: string;
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
          id: s.positionId as Id<"eventPositions">,
          quantity: s.quantity,
        })),
      });
      nav({ to: "/calendar/events/$eventId", params: { eventId: eventCreated._id } });
    },
  });

  const store = useStore(form.store, (state) => state.values);

  return (
    <>
      <WorkspaceHeader>Create New Event</WorkspaceHeader>
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
            <span className="text-lg">Shifts</span>
            {/* TODO: Extract this cool stuff into a component of some sorts? */}
            {/* Info: This is a version of Epic's array fields that allow reselecting options, etc. */}
            <form.Field
              mode="array"
              name="shifts">
              {(field) => {
                return (
                  <div className="flex flex-col gap-2">
                    {field.state.value.map((_, i) => {
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2">
                          <form.Field name={`shifts[${i}].positionId`}>
                            {(subField) => {
                              return (
                                <Combobox
                                  options={getAllPositions?.filter(
                                    (item) =>
                                      item._id === field.state.value[i].positionId ||
                                      !field.state.value
                                        .map((shift) => shift.positionId)
                                        .includes(item._id)
                                  )}
                                  suffix={<Search />}
                                  value={subField.state.value}
                                  variant="underlined"
                                  getId={(option) => option._id}
                                  getLabel={(option) => option.label ?? option.name}
                                  render={(option) =>
                                    option.label ? (
                                      <div className="flex flex-1 gap-2 items-baseline justify-between">
                                        <span>{option.label}</span>
                                        <span className="text-xs text-slate-400">
                                          {option.name}
                                        </span>
                                      </div>
                                    ) : (
                                      <span>{option.name}</span>
                                    )
                                  }
                                  onSelect={(value) => subField.handleChange(value!)}
                                />
                              );
                            }}
                          </form.Field>
                          <form.Field name={`shifts[${i}].quantity`}>
                            {(subField) => (
                              <div className="flex items-center gap-1">
                                <Button
                                  disabled={subField.state.value === 1}
                                  round
                                  size="icon-xs"
                                  variant="text"
                                  onClick={() => subField.handleChange((v) => v - 1)}>
                                  <Minus className="size-3" />
                                </Button>
                                <Input
                                  className="w-12 [&_input]:text-center"
                                  inputMode="numeric"
                                  type="text"
                                  value={subField.state.value}
                                  onBeforeInput={(e) => {
                                    if (
                                      e.nativeEvent.data &&
                                      !/^[0-9]+$/.test(e.nativeEvent.data)
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onBlur={(e) =>
                                    Number(e.target.value) <= 0 && subField.handleChange(1)
                                  }
                                  onChange={(e) =>
                                    subField.handleChange(Number(e.target.value))
                                  }
                                />
                                <Button
                                  round
                                  size="icon-xs"
                                  type="button"
                                  variant="filled"
                                  onClick={() => subField.handleChange((v) => v + 1)}>
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                            )}
                          </form.Field>
                        </div>
                      );
                    })}
                    <Combobox
                      className={cn(field.state.value.length > 0 && "mt-2")}
                      clearOnSelect
                      options={getAllPositions?.filter(
                        (item) =>
                          !field.state.value.map((shift) => shift.positionId).includes(item._id)
                      )}
                      placeholder="Add a position..."
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
                      onSelect={(value) => field.pushValue({ positionId: value!, quantity: 1 })}
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
