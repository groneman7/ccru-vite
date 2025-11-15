import {
  /* AsyncComboboxField, */ ComboboxField,
  DateField,
  TextField,
} from "@/components/ui";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    /* AsyncComboboxField, */ ComboboxField,
    DateField,
    TextField,
  },
  formComponents: {},
});

export {
  fieldContext,
  formContext,
  withForm,
  withFieldGroup,
  useAppForm,
  useFieldContext,
  useFormContext,
};
