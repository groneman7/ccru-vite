import { useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { iso, object, string } from "zod";
import { Button, useAppForm } from "../ui";

const OPTIONS = [
  { id: "1", name: "Option 1" },
  { id: "2", name: "Option 2" },
  { id: "3", name: "Option 3" },
  { id: "4", name: "Option 4" },
  { id: "5", name: "Option 5" },
  { id: "6", name: "Option 6" },
];

const FORM_SCHEMA = object({
  name: string().min(1, "Name is required."),
  date: iso.date("Date is required."),
  time: iso.time({ precision: -1, error: "Time is required." }),
  description: string(),
  option: string(),
});

export function TestForm() {
  const form = useAppForm({
    defaultValues: {
      name: "",
      date: null as string | null,
      time: "",
      description: "",
      option: "",
    },
    validators: {
      onSubmit: FORM_SCHEMA,
    },
    onSubmit: ({ value }) => {
      toast("You submitted the following values:", {
        description: <pre>{JSON.stringify(value, null, 2)}</pre>,
        position: "bottom-right",
      });
    },
  });

  const store = useStore(form.store, (state) => state.values);

  return (
    <div className="flex gap-4">
      <form
        className="flex flex-1 flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppField name="name">
          {(nameField) => (
            <nameField.InputField
              description="Here is a simple name field."
              label="Name"
              placeholder="Kylo Ren"
            />
          )}
        </form.AppField>
        <form.AppField name="date">
          {(dateField) => (
            <dateField.DateField
              description="Here is a simple date field."
              label="Date"
              placeholder="Choose a date..."
            />
          )}
        </form.AppField>
        <form.AppField name="time">
          {(timeField) => (
            <timeField.TimeField
              description="Here is a simple time field."
              label="Time"
              placeholder="e.g., 1:00 PM or 1300"
            />
          )}
        </form.AppField>
        <form.AppField name="description">
          {(descriptionField) => (
            <descriptionField.TextareaField
              description="Here is a simple description field. Optional."
              label="Description"
              placeholder="Describe the event"
            />
          )}
        </form.AppField>
        <form.AppField name="option">
          {(optionField) => (
            <optionField.ComboboxField
              maxTagCount={4}
              multiple
              label="Option"
              options={OPTIONS}
              getLabel={(o) => o.name}
            />
          )}
        </form.AppField>
        <Button type="submit">Submit form</Button>
      </form>
      <div className="w-120">
        <pre>{JSON.stringify(store, null, 2)}</pre>
      </div>
    </div>
  );
}
