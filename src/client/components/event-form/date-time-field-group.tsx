import { withFieldGroup } from "~client/components/form";
import { DatePicker, Field, FieldLabel, TimePicker } from "~client/components/ui";
import dayjs from "dayjs";

export const DateTimeFieldGroup = withFieldGroup<
  { date: string; timeBegin: string; timeEnd: string },
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
                onSelect={(value) =>
                  dateField.handleChange(dayjs(value).format("YYYY-MM-DD"))
                }
              />
            </Field>
          )}
        </group.Field>
        <div className="flex gap-2">
          <group.Field name="timeBegin">
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
        </div>
      </>
    );
  },
});
