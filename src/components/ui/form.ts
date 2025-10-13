import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { /* AsyncComboboxField, */ ComboboxField, DateField, TextField } from "@/src/components/ui";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: { /* AsyncComboboxField, */ ComboboxField, DateField, TextField },
    formComponents: {},
});

export { fieldContext, formContext, useFieldContext, useAppForm };
