import { withFieldGroup } from "@/components//form";
import { Field, FieldLabel, Input } from "@/components/ui";

export const DescFieldGroup = withFieldGroup<
  { description: string },
  unknown,
  {}
>({
  render: ({ group }) => {
    return (
      <>
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
