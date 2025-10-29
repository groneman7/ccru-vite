import { useEffect, useState, type ChangeEvent, type ComponentProps, type FocusEvent } from "react";
import { Input } from "./input";
import { convert24to12, parseAndFormatTime } from "@/src/components/utils";

// TODO: This has the option of being uncontrolled, which I might not want to keep.

type TimePickerProps = Omit<ComponentProps<"input">, "onChange" | "value" | "defaultValue"> & {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
};

export function TimePicker({ value: valueProp, defaultValue = "", onChange, onBlur, ...props }: TimePickerProps) {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = valueProp !== undefined;

    useEffect(() => {
        if (isControlled) {
            setUncontrolledValue(valueProp);
        }
    }, [valueProp, isControlled]);

    const value = isControlled ? valueProp : uncontrolledValue;

    function handleInternalBlur(e: FocusEvent<HTMLInputElement>) {
        const rawInput = e.target.value;
        const parsed = parseAndFormatTime(rawInput);
        let finalValue = "";

        if (parsed) {
            finalValue = parsed.display;
        } else if (rawInput && /^\d{2}:\d{2}$/.test(rawInput)) {
            finalValue = convert24to12(rawInput);
        }

        if (isControlled) {
            onChange?.(finalValue);
        } else {
            setUncontrolledValue(finalValue);
        }

        onBlur?.(e);
    }

    function handleInternalChange(e: ChangeEvent<HTMLInputElement>) {
        if (isControlled) {
            onChange?.(e.target.value);
        } else {
            setUncontrolledValue(e.target.value);
        }
    }

    return (
        // @ts-expect-error - TODO: fix types
        <Input
            value={value}
            onBlur={handleInternalBlur}
            onChange={handleInternalChange}
            {...props}
        />
    );
}
