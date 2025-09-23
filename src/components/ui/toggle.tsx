import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/components/utils";

const toggleVariants = cva(
    cn(
        "inline-flex items-center justify-center gap-2 rounded whitespace-nowrap outline-none",
        "focus-within:focus-ring focus-visible:focus-ring",
        "text-sm font-medium",
        "hover:bg-accent/60 hover:text-accent-foregroundactive:bg-accent",
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        "transition-[color,box-shadow]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
    ),

    {
        variants: {
            variant: {
                default: "bg-transparent",
                outline: "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "h-9 px-2 min-w-9",
                sm: "h-8 px-1.5 min-w-8",
                lg: "h-10 px-2.5 min-w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Toggle({
    className,
    variant,
    size,
    ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
    return (
        <TogglePrimitive.Root
            data-slot="toggle"
            className={cn(toggleVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Toggle, toggleVariants };
