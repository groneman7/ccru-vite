import { useEffect, useRef, useState } from "react";
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
            className={cn("flex flex-col", className)}
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
        tags?: React.ReactNode[];
        onClear?: () => void;
    };

function ComboboxInput({
    className,
    clearButton: _clearButton,
    id,
    placeholder,
    popoverOpen: _popoverOpen,
    prefix,
    size,
    suffix,
    tags,
    onClear: _onClear,
    ...props
}: ComboboxInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            data-slot="combobox-input-wrapper"
            className={cn(comboboxVariants({ size }), "px-2")}>
            <InputDecoration prefix>{prefix}</InputDecoration>
            <div
                className={cn(
                    "flex h-full w-full items-center gap-2",
                    prefix ? "pl-1" : "pl-0",
                    suffix ? "pr-1" : "pr-0"
                )}
                onMouseDown={(event) => {
                    const inputElement = inputRef.current;
                    if (!inputElement) return;

                    if (event.target instanceof Node && !inputElement.contains(event.target)) {
                        event.preventDefault();
                        inputElement.focus();
                    }
                }}>
                {tags}
                <ComboboxPrimitive.Input
                    data-slot="combobox-input"
                    className={cn(
                        "input flex-1 min-w-0 bg-transparent p-0 shadow-none outline-none focus:outline-none focus-visible:outline-none"
                    )}
                    ref={inputRef}
                    id={id}
                    placeholder={placeholder}
                    {...props}
                />
            </div>
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
                // "pr-8",
                "px-2 py-1.5",
                "data-[selected=true]:select-item-hover",
                "dark:data-[selected=true]:dark-select-item-hover",
                "relative flex cursor-default items-center gap-2 rounded-sm text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        />
    );
}

////////////////

// Why is this all the way down here?
const comboboxVariants = cva(
    cn(
        "form-control has-focus-ring",
        "dark:aria-invalid:ring-destructive/40",
        "file:text-foreground border file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
    ),
    {
        variants: {
            size: {
                sm: "h-7 text-sm",
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

type BaseComboboxProps<TOption> = VariantProps<typeof comboboxVariants> & {
    className?: string;
    containerClassName?: string;
    id?: string;
    options?: TOption[];
    placeholder?: string;
    clearOnSelect?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    onBlur?: () => void;
    onFocus?: () => void;
    render?: (option: TOption) => React.ReactNode;
    inputProps?: Omit<
        React.ComponentProps<typeof ComboboxPrimitive.Input>,
        "value" | "onValueChange" | "ref" | "className"
    >;
} & (TOption extends HasId ? {} : { getId: (option: TOption) => string }) &
    (TOption extends HasLabel ? {} : { getLabel: (option: TOption) => string });

type SingleComboboxProps<TOption> = {
    multiple?: false;
    value?: string;
    onSelect?: (value: string | null) => void;
};

type MultipleComboboxProps<TOption> = {
    multiple: true;
    value?: string[];
    onSelect?: (values: string[]) => void;
    maxTagCount?: number;
};

export type ComboboxProps<TOption> = BaseComboboxProps<TOption> &
    (SingleComboboxProps<TOption> | MultipleComboboxProps<TOption>);

function arraysEqual(a: string[], b: string[]) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

export function Combobox<T>({
    className,
    id,
    options,
    placeholder,
    prefix,
    size,
    suffix,
    onBlur,
    onFocus,
    clearOnSelect = false,
    inputProps,
    multiple = false,
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
    const [selectedIds, setSelectedIds] = useState<string | string[] | undefined>(() => {
        if (multiple) {
            return (props as MultipleComboboxProps<T>).value ?? [];
        }

        return (props as SingleComboboxProps<T>).value ?? undefined;
    });

    const externalValue = multiple
        ? ((props as MultipleComboboxProps<T>).value ?? [])
        : ((props as SingleComboboxProps<T>).value ?? undefined);

    useEffect(() => {
        if (multiple) {
            const incoming = Array.isArray(externalValue) ? externalValue : [];
            setSelectedIds((prev) => {
                if (Array.isArray(prev) && arraysEqual(prev, incoming)) {
                    return prev;
                }

                return incoming;
            });

            return;
        }

        const incoming = typeof externalValue === "string" ? externalValue : undefined;
        setSelectedIds((prev) => {
            if (typeof prev === "string" && prev === incoming) {
                return prev;
            }

            if (prev === undefined && incoming === undefined) {
                return prev;
            }

            return incoming;
        });
    }, [externalValue, multiple]);

    const [query, setQuery] = useState<string>("");
    const {
        onBlur: inputOnBlur,
        onClick: inputOnClick,
        onFocus: inputOnFocus,
        onKeyDown: inputOnKeyDown,
        ...restInputProps
    } = inputProps ?? {};

    const hasSelection = multiple
        ? Array.isArray(selectedIds) && selectedIds.length > 0
        : typeof selectedIds === "string" && selectedIds.length > 0;

    const isSelected = (option: T) => {
        if (multiple) {
            if (!Array.isArray(selectedIds)) return false;
            return selectedIds.includes(getId(option));
        }

        return typeof selectedIds === "string" && selectedIds === getId(option);
    };

    const placeholderText = (() => {
        if (multiple) {
            return hasSelection ? "" : placeholder;
        }

        if (!clearOnSelect && typeof selectedIds === "string" && selectedIds.length > 0) {
            const option = options?.find((item) => getId(item) === selectedIds);
            if (option) {
                return getLabel(option);
            }
        }

        return placeholder;
    })();

    const maxTagCount = multiple ? (props as MultipleComboboxProps<T>).maxTagCount : undefined;
    let selectedTags: React.ReactNode[] | undefined;
    if (multiple && Array.isArray(selectedIds) && selectedIds.length > 0) {
        const limit = typeof maxTagCount === "number" && maxTagCount >= 0 ? maxTagCount : undefined;
        const visibleIds = limit !== undefined ? selectedIds.slice(0, limit) : selectedIds;
        const overflowCount = limit !== undefined ? selectedIds.length - visibleIds.length : 0;

        selectedTags = visibleIds.map((id) => {
            const option = options?.find((opt) => getId(opt) === id);
            const label = option ? getLabel(option) : id;

            return (
                <span
                    key={id}
                    className="bg-slate-200 text-foreground text-xs font-medium px-1.5 py-0.5 rounded-xs">
                    {label}
                </span>
            );
        });

        if (overflowCount > 0) {
            selectedTags.push(
                <span
                    key="combobox-overflow"
                    className="bg-slate-200 text-foreground text-xs font-medium px-1.5 py-0.5 rounded-xs">
                    + {overflowCount}
                </span>
            );
        }
    }

    const emitSelection = (nextSelection: string | string[] | undefined) => {
        if (multiple) {
            (props as MultipleComboboxProps<T>).onSelect?.(Array.isArray(nextSelection) ? nextSelection : []);
            return;
        }

        (props as SingleComboboxProps<T>).onSelect?.(
            typeof nextSelection === "string" && nextSelection.length > 0 ? nextSelection : null
        );
    };

    function renderOptions(options?: T[]) {
        return options?.map((option) => {
            return (
                <ComboboxItem
                    key={getId(option)}
                    className={cn(
                        "flex flex-1 items-center justify-between",
                        isSelected(option) && "!bg-accent !text-primary !font-semibold"
                    )}
                    value={getId(option)}
                    onSelect={() => {
                        handleSetValue(option);
                    }}>
                    {render ? render(option) : getLabel(option)}
                    <Check
                        className={cn(
                            isSelected(option) ? "opacity-100" : "opacity-0",
                            "size-4 stroke-3",
                            "text-primary dark:text-foreground"
                        )}
                    />
                </ComboboxItem>
            );
        });
    }

    const handleSetValue = (option: T) => {
        const optionId = getId(option);

        if (multiple) {
            setSelectedIds((prev) => {
                const current = Array.isArray(prev) ? prev : [];
                const isAlreadySelected = current.includes(optionId);
                const nextSelection = isAlreadySelected
                    ? current.filter((id) => id !== optionId)
                    : [...current, optionId];

                emitSelection(nextSelection);
                return nextSelection;
            });
        } else {
            emitSelection(optionId);
            if (clearOnSelect) {
                setSelectedIds(undefined);
            } else {
                setSelectedIds(optionId);
            }
            setOpen(false);
        }

        setQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setOpen(true);
        }
    };

    const handleClearValue = () => {
        if (multiple) {
            setSelectedIds([]);
            emitSelection([]);
        } else {
            setSelectedIds(undefined);
            emitSelection(undefined);
        }

        setQuery("");
        setOpen(false);
    };

    const shouldShowSelectedPlaceholder = hasSelection && !open && !(clearOnSelect && !multiple);

    return (
        <BaseCombobox>
            <Popover
                open={open}
                onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <ComboboxInput
                        className={cn(
                            comboboxVariants({ size }),
                            shouldShowSelectedPlaceholder &&
                                "[&_input]:placeholder:text-foreground [&_input]:!border-red-500",
                            open && "[&_input]:placeholder:transition-colors [&_input]:placeholder:duration-100",
                            className
                        )}
                        id={id}
                        // clearButton={clearButton}
                        placeholder={placeholderText}
                        prefix={prefix}
                        suffix={suffix}
                        tags={selectedTags}
                        value={query}
                        onBlur={(event) => {
                            inputOnBlur?.(event);
                            onBlur?.();
                        }}
                        onClear={handleClearValue}
                        onClick={(event) => {
                            inputOnClick?.(event);
                            if (open && !event.defaultPrevented) {
                                event.preventDefault();
                            }
                        }}
                        onFocus={(event) => {
                            setOpen(true);
                            inputOnFocus?.(event);
                            onFocus?.();
                        }}
                        onKeyDown={(event) => {
                            inputOnKeyDown?.(event);
                            if (!event.defaultPrevented) {
                                handleKeyDown(event);
                            }
                        }}
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
