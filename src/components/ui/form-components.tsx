import { Combobox, DatePicker, Input, /* Spinner, */ useFieldContext, type ComboboxProps } from "@/src/components/ui";
import { Label } from "./label";
// import { useState } from "react";

// Common interfaces --------------------------------------------------------------------------

interface CommonFieldProps {
    label?: string;
}

interface CommonInputProps extends CommonFieldProps {
    placeholder?: string;
}

// Async combobox -----------------------------------------------------------------------------

// type AsyncComboboxFieldProps<T> = CommonInputProps &
//     Omit<ComboboxProps<T>, "options"> & { getOptions: QueryFunction<T[]> };
// export function AsyncComboboxField<T>({ label, getOptions, ...props }: AsyncComboboxFieldProps<T>) {
//     const field = useFieldContext<T>();
//     const [queryEnabled, setQueryEnabled] = useState(false);
//     // const { data: options, isFetching } = useQuery({
//     //     queryKey: ["aysnc_combobox", field.name],
//     //     queryFn: getOptions,
//     //     enabled: queryEnabled,
//     //     staleTime: Infinity,
//     // });

//     return (
//         <div className="flex flex-col gap-1 flex-1">
//             <Label htmlFor={field.name}>{label}</Label>{" "}
//             {/* @ts-expect-error - I'm not really sure why it's mad about this. */}
//             <Combobox
//                 onBlur={() => setQueryEnabled(false)}
//                 onFocus={() => setQueryEnabled(true)}
//                 id={field.name}
//                 options={[]}
//                 // options={options}
//                 // suffix={isFetching && <Spinner />}
//                 value={field.state.value}
//                 onSelect={field.handleChange}
//                 {...props}
//             />
//         </div>
//     );
// }

// Combobox -----------------------------------------------------------------------------------

type ComboboxFieldProps<T> = CommonInputProps & ComboboxProps<T>;
export function ComboboxField<T>({ label, ...props }: ComboboxFieldProps<T>) {
    const field = useFieldContext<T>();

    return (
        <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor={field.name}>{label}</Label>{" "}
            <Combobox
                id={field.name}
                value={field.state.value}
                onSelect={field.handleChange}
                {...props}
            />
        </div>
    );
}

// Date ---------------------------------------------------------------------------------------

type DateFieldProps = CommonInputProps;
export function DateField({ label }: DateFieldProps) {
    const field = useFieldContext<Date>();

    return (
        <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor={field.name}>{label}</Label>
            <DatePicker
                format={"YYYY-MM-DD"}
                value={field.state.value}
                onChange={(date) => field.handleChange(date)}
            />
        </div>
    );
}

// Text ---------------------------------------------------------------------------------------

interface TextFieldProps extends CommonInputProps {
    textarea?: boolean;
}
export function TextField({ label, placeholder /* textarea */ }: TextFieldProps) {
    const field = useFieldContext<string>();

    return (
        <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor={field.name}>{label}</Label>
            <Input
                className="border border-blue-4500"
                id={field.name}
                placeholder={placeholder}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
            />
        </div>
    );
}
