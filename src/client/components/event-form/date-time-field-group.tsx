import { withFieldGroup } from "~/client/components/form";
import {
  DatePicker,
  Field,
  FieldLabel,
  TimePicker,
} from "~/client/components/ui";
import dayjs from "dayjs";

export const DateTimeFieldGroup = withFieldGroup<
  { date: string; timeBegin: string; timeEnd: string | null },
  unknown,
  {}
>({
  render: ({ group }) => {
    return (
      <>
        <group.AppField name="date">
          {(dateField) => <dateField.DateField label="Date" />}
        </group.AppField>
        <div className="flex gap-2">
          <group.AppField name="timeBegin">
            {(timeStartField) => (
              <timeStartField.TimeField
                label="Start time"
                placeholder="e.g., 1:00 PM or 1300"
              />
            )}
          </group.AppField>
          <group.AppField name="timeEnd">
            {(timeEndField) => (
              <timeEndField.TimeField
                label="Start time"
                placeholder="e.g., 1:00 PM or 1300"
              />
            )}
          </group.AppField>
        </div>
      </>
    );
  },
});
