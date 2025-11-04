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
  InputGroup,
  InputGroupCombobox,
  InputGroupInput,
  TimePicker,
} from "@/src/components/ui";
import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Shift = {
  positionId: string;
  quantity: number;
};

type CreateEventFormSchema = {
  eventName: string;
  description: string;
  location: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  shifts: Shift[];
};

const DEFAULT_SHIFTS: Shift[] = [];

export const Route = createFileRoute("/calendar/events/new")({
  component: RouteComponent,
});

function RouteComponent() {
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

      const test = {
        name: value.eventName,
        description: value.description || undefined,
        location: value.location || undefined,
        timeStart,
        timeEnd: timeEnd || undefined,
      };
      // TODO: HARDCARDED ID
      await createEvent({
        createdBy: "j5799tyr8jpzygb3hb2rae2zs17tbwdz" as Id<"users">,
        ...test,
      });
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
                        <InputGroup key={i}>
                          <form.Field name={`shifts[${i}].positionId`}>
                            {(subField) => {
                              return (
                                // <InputGroupInput />
                                <InputGroupCombobox
                                  options={getAllPositions?.filter(
                                    (item) =>
                                      item._id === field.state.value[i].positionId ||
                                      !field.state.value
                                        .map((shift) => shift.positionId)
                                        .includes(item._id)
                                  )}
                                  value={subField.state.value}
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
                            {(subField) => {
                              return (
                                <InputGroupInput
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                />
                              );
                            }}
                          </form.Field>
                        </InputGroup>
                      );
                    })}
                    <Combobox
                      clearOnSelect
                      options={getAllPositions?.filter(
                        (item) =>
                          !field.state.value.map((shift) => shift.positionId).includes(item._id)
                      )}
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
              disabled
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
