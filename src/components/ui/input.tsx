import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/components/utils/index";
import { InputDecoration } from "@/src/components/ui/index";

const inputVariants = cva(
    cn(
        "form-control has-focus-ring"
        // "dark:aria-invalid:ring-destructive/40",
        // "file:text-foreground border file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // "aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
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

export type InputProps = Omit<React.ComponentProps<"input">, "size" | "prefix"> &
    VariantProps<typeof inputVariants> & {
        prefix?: React.ReactNode;
        suffix?: React.ReactNode;
    };
export function Input({ className, id, prefix = null, size, suffix = null, type, ...props }: InputProps) {
    console.log(inputVariants());
    console.log(inputVariants({ size }));
    return (
        // TODO: Does this really need to be nested like this?
        // Note: When trying to apply `flex-1` directly with `cn(inputVariants...`, it loses its height.
        <div className="flex flex-1">
            <div className={cn(inputVariants({ size }), "px-2 flex-1")}>
                <InputDecoration>{prefix}</InputDecoration>
                <input
                    className={cn(prefix ? "pl-1" : "pl-0", suffix ? "pr-1" : "pr-0", className)}
                    id={id}
                    type={type}
                    {...props}
                />
                <InputDecoration>{suffix}</InputDecoration>
            </div>
        </div>
    );
}
