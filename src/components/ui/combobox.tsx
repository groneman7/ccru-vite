import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/components/utils";
import { Command as ComboboxPrimitive } from "cmdk";
import { InputDecoration, Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/src/components/ui";
import { Check } from "lucide-react";

////////////////////////

function BaseCombobox({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive>) {
    return (
        <ComboboxPrimitive
            data-slot="combobox"
            className={cn("flex flex-col w-full", className)}
            {...props}
        />
    );
}

type ComboboxInputProps = VariantProps<typeof comboboxVariants> &
    Omit<React.ComponentProps<typeof ComboboxPrimitive.Input>, "prefix"> & {
        clearButton?: boolean;
        popoverOpen?: boolean;
        prefix?: React.ReactNode;
        suffix?: React.ReactNode;
        onClear?: () => void;
    };
function ComboboxInput({
    className,
    clearButton,
    id,
    placeholder,
    prefix,
    size,
    suffix,
    onClear,
    ...props
}: ComboboxInputProps) {
    return (
        <div
            data-slot="combobox-input-wrapper"
            className={cn(comboboxVariants({ size }), "relative")}>
            <InputDecoration prefix>{prefix}</InputDecoration>
            <ComboboxPrimitive.Input
                data-slot="combobox-input"
                className={cn("input", {
                    "pl-8": prefix,
                    "pr-8": suffix,
                })}
                id={id}
                placeholder={placeholder}
                {...props}
            />
            <InputDecoration>{suffix}</InputDecoration>
        </div>
    );
}

function ComboboxList({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.List>) {
    return (
        <ComboboxPrimitive.List
            data-slot="combobox-list"
            className={cn("max-h-[300px] bg-popover scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
            {...props}
        />
    );
}

function ComboboxEmpty({ ...props }: React.ComponentProps<typeof ComboboxPrimitive.Empty>) {
    return (
        <ComboboxPrimitive.Empty
            data-slot="combobox-empty"
            className="py-6 text-center text-sm"
            {...props}
        />
    );
}

function ComboboxGroup({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Group>) {
    return (
        <ComboboxPrimitive.Group
            data-slot="command-group"
            className={cn(
                "p-0 text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
                className
            )}
            {...props}
        />
    );
}

// function ComboboxSeparator({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Separator>) {
//     return (
//         <ComboboxPrimitive.Separator
//             data-slot="command-separator"
//             className={cn("bg-border -mx-1 h-px", className)}
//             {...props}
//         />
//     );
// }

function ComboboxItem({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Item>) {
    return (
        <ComboboxPrimitive.Item
            data-slot="combobox-item"
            className={cn(
                "pr-8",
                "data-[selected=true]:select-item-hover",
                "dark:data-[selected=true]:dark-select-item-hover",
                "relative flex cursor-default items-center gap-2 rounded-sm pl-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        />
    );
}

////////////////

const comboboxVariants = cva(
    cn(
        "form-control",
        "dark:aria-invalid:ring-destructive/40",
        "file:text-foreground border file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
    ),
    {
        variants: {
            size: {
                sm: "h-7",
                md: "h-9",
                lg: "h-11 text-lg",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

type HasId = { id: string };
type HasLabel = { label: string };

export type ComboboxProps<TOption> = VariantProps<typeof comboboxVariants> & {
    className?: string;
    id?: string;
    options?: TOption[];
    placeholder?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    value?: TOption;
    onBlur?: () => void;
    onFocus?: () => void;
    onSelect?: (option: TOption | null) => void;
    render?: (option: TOption) => React.ReactNode;
} & (TOption extends HasId ? {} : { getId: (option: TOption) => string }) &
    (TOption extends HasLabel ? {} : { getLabel: (option: TOption) => string });

export function Combobox<T>({
    className,
    id,
    options,
    placeholder,
    prefix,
    size,
    suffix,
    value,
    onBlur,
    onFocus,
    onSelect,
    render,
    ...props
}: ComboboxProps<T>) {
    const getId =
        "getId" in props ? (props as { getId: (option: T) => string }).getId : (option: T) => (option as HasId).id;
    const getLabel =
        "getLabel" in props
            ? (props as { getLabel: (option: T) => string }).getLabel
            : (option: T) => (option as HasLabel).label;

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<T | undefined>(value !== undefined ? value : undefined);

    const [query, setQuery] = useState<string>("");

    function renderOptions(options?: T[]) {
        return options?.map((option, i) => {
            // if ("options" in (option as { options: T[] })) {
            //     return (
            //         <ComboboxGroup key={getId(option)}>
            //             <span className="pl-4 text-muted-foreground px-2 py-1.5 text-xs">{getLabel(option)}</span>
            //             {renderOptions(option.options)}
            //         </ComboboxGroup>
            //     );
            // }

            return (
                <ComboboxItem
                    key={getId(option)}
                    className={cn(
                        selected && getId(selected) === getId(option) && "!bg-accent !text-primary !font-semibold"
                    )}
                    value={getId(option)}
                    onSelect={() => {
                        handleSetValue(option);
                    }}>
                    <Check
                        className={cn(
                            selected && getId(selected) === getId(option) ? "opacity-100" : "opacity-0",
                            "size-4 stroke-3",
                            "text-primary dark:text-foreground"
                        )}
                    />
                    {render ? render(option) : getLabel(option)}
                </ComboboxItem>
            );
        });
    }

    const handleSetValue = (option: T) => {
        onSelect?.(option);
        // if (!value) {
        //     setSelected(option);
        // }
        setSelected(option);
        setQuery("");
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setOpen(true);
        }
    };

    const handleClearValue = () => {
        onSelect?.(null);
        setQuery("");
        setOpen(false);
    };

    return (
        <BaseCombobox>
            <Popover
                open={open}
                onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <ComboboxInput
                        className={cn(
                            comboboxVariants({ size }),
                            selected && !open && "[&_input]:placeholder:text-foreground",
                            open && "[&_input]:placeholder:transition-colors [&_input]:placeholder:duration-100",
                            className
                        )}
                        id={id}
                        // clearButton={clearButton}
                        placeholder={selected ? getLabel(selected) : placeholder}
                        prefix={prefix}
                        suffix={suffix}
                        value={query}
                        onBlur={() => onBlur?.()}
                        onClear={handleClearValue}
                        onClick={(e) => open && e.preventDefault()}
                        onFocus={() => {
                            setOpen(true);
                            onFocus?.();
                        }}
                        onKeyDown={handleKeyDown}
                        onValueChange={(value) => setQuery(value)}
                    />
                </PopoverTrigger>
                <PopoverAnchor />
                <PopoverContent
                    align="start"
                    avoidCollisions={false}
                    className={cn("w-full min-w-[var(--radix-popover-trigger-width)]", "p-1")}
                    collisionPadding={4}
                    sideOffset={8}
                    onEscapeKeyDown={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                    }}
                    onOpenAutoFocus={(e) => e.preventDefault()}>
                    <ComboboxEmpty>Empty</ComboboxEmpty>
                    <ComboboxList>{renderOptions(options)}</ComboboxList>
                </PopoverContent>
            </Popover>
        </BaseCombobox>
    );
}
