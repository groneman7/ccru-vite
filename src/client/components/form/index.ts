import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { ReactNode } from "react";
import {
  ComboboxField,
  DateField,
  InputField,
  TextareaField,
  TimeField,
} from "./fields";

export interface CommonFieldProps {
  description?: ReactNode;
  label?: ReactNode;
}

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ComboboxField,
    DateField,
    InputField,
    TextareaField,
    TimeField,
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
