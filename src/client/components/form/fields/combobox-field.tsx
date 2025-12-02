import {
  Combobox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  type ComboboxProps,
} from "~client/components//ui";
import { useFieldContext, type CommonInputProps } from "~client/components/form";

// TODO: Implement focus input when label clicked.
type ComboboxFieldProps<T> = CommonInputProps & ComboboxProps<T>;
export function ComboboxField<T>({
  description,
  label,
  ...props
}: ComboboxFieldProps<T>) {
  const field = useFieldContext<string | string[]>();
  const { errors } = field.state.meta;

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Combobox
        id={field.name}
        value={field.state.value}
        onSelect={field.handleChange}
        {...props}
      />
      {errors.length > 0 ? (
        <FieldError errors={field.state.meta.errors} />
      ) : description ? (
        <FieldDescription>{description}</FieldDescription>
      ) : null}
    </Field>
  );
}
