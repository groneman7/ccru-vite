import {
  DatePicker,
  Field,
  FieldLabel,
  TimePicker,
  withFieldGroup,
} from "@/components/ui";
import dayjs from "dayjs";

export const DateTimeFieldGroup = withFieldGroup<
  { date: string; timeStart: string; timeEnd: string },
  unknown,
  {}
>({
  render: ({ group }) => {
    return (
      <>
        <group.Field name="date">
          {(dateField) => (
            <Field>
              <FieldLabel>Date</FieldLabel>
              <DatePicker
                // id={dateField.name}
                // name={dateField.name}
                value={dayjs(dateField.state.value)}
                // onBlur={dateField.handleBlur}
                onChange={(value) =>
                  dateField.handleChange(dayjs(value).format("YYYY-MM-DD"))
                }
              />
            </Field>
          )}
        </group.Field>
        <group.Field name="timeStart">
          {(timeStartField) => (
            <Field>
              <FieldLabel>Start time</FieldLabel>
              <TimePicker
                id={timeStartField.name}
                name={timeStartField.name}
                placeholder="e.g., 1:00 PM or 1300"
                value={timeStartField.state.value}
                onBlur={timeStartField.handleBlur}
                onChange={timeStartField.handleChange}
              />
            </Field>
          )}
        </group.Field>
        <group.Field name="timeEnd">
          {(timeEndField) => (
            <Field>
              <FieldLabel>End time</FieldLabel>
              <TimePicker
                id={timeEndField.name}
                name={timeEndField.name}
                placeholder="e.g., 1:00 PM or 1300"
                value={timeEndField.state.value}
                onBlur={timeEndField.handleBlur}
                onChange={timeEndField.handleChange}
              />
            </Field>
          )}
        </group.Field>
      </>
    );
  },
});
