import { Input, withFieldGroup } from "~client/components/ui";

export const AddressFields = withFieldGroup({
  defaultValues: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  },
  render: ({ group }) => (
    <div>
      address field group
      <group.Field name="line1">
        {(addressLine1Field) => (
          <Input
            name={addressLine1Field.name}
            value={addressLine1Field.state.value}
            onBlur={addressLine1Field.handleBlur}
            onChange={(e) => addressLine1Field.handleChange(e.target.value)}
          />
        )}
      </group.Field>
    </div>
  ),
});
