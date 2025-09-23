import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/components/utils";
import { InputDecoration } from "@/src/components/ui";

const inputVariants = cva(
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

export type InputProps = Omit<React.ComponentProps<"input">, "size" | "prefix"> &
    VariantProps<typeof inputVariants> & {
        prefix?: React.ReactNode;
        suffix?: React.ReactNode;
    };
// [&_input]:placeholder:text-muted-foreground
export function Input({ className, id, prefix = null, size, suffix = null, type, ...props }: InputProps) {
    return (
        <div className={cn(inputVariants({ size }), "relative w-full", className)}>
            <InputDecoration prefix>{prefix}</InputDecoration>
            <input
                className={cn("input", {
                    "pl-8": prefix,
                    "pr-8": suffix,
                })}
                id={id}
                type={type}
                {...props}
            />
            <InputDecoration>{suffix}</InputDecoration>
        </div>
    );
}
