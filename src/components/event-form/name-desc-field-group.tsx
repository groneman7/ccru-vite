import { Field, FieldLabel, Input, withFieldGroup } from "@/components/ui";

export const NameDescFieldGroup = withFieldGroup<
  { eventName: string; description: string },
  unknown,
  {}
>({
  render: ({ group }) => {
    return (
      <>
        <group.Field name="eventName">
          {(eventNameField) => (
            <Field>
              <FieldLabel htmlFor={eventNameField.name}>Event name</FieldLabel>
              <Input
                id={eventNameField.name}
                name={eventNameField.name}
                value={eventNameField.state.value}
                onBlur={eventNameField.handleBlur}
                onChange={(e) => eventNameField.handleChange(e.target.value)}
              />
            </Field>
          )}
        </group.Field>
        <group.Field name="description">
          {(descriptionField) => (
            <Field>
              <FieldLabel htmlFor={descriptionField.name}>
                Description
              </FieldLabel>
              <Input
                id={descriptionField.name}
                name={descriptionField.name}
                value={descriptionField.state.value}
                onBlur={descriptionField.handleBlur}
                onChange={(e) => descriptionField.handleChange(e.target.value)}
              />
            </Field>
          )}
        </group.Field>
      </>
    );
  },
});
