import { Field, FieldLabel, Input, withFieldGroup } from "@/src/components/ui";

export const AddressFieldGroup = withFieldGroup<{ location: string }, unknown, {}>({
  render: ({ group }) => {
    return (
      <>
        <group.Field name="location">
          {(locationField) => (
            <Field>
              <FieldLabel htmlFor={locationField.name}>Location</FieldLabel>
              <Input
                id={locationField.name}
                name={locationField.name}
                value={locationField.state.value}
                onBlur={locationField.handleBlur}
                onChange={(e) => locationField.handleChange(e.target.value)}
              />
            </Field>
          )}
        </group.Field>
      </>
    );
  },
});
