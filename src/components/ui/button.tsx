import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/components/utils";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
    cn(
        "cursor-pointer inline-flex items-center px-3 justify-center gap-2 whitespace-nowrap rounded transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "group-data-[render=together]:rounded-none group-data-[render=together]:shadow-none group-data-[render=together]:first:rounded-l group-data-[render=together]:last:rounded-r group-data-[render=together]:hover:z-10"
    ),
    {
        variants: {
            variant: {
                solid: "form-control bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active border-0",
                outline:
                    "form-control text-primary/80 border border-primary/50 hover:border-primary hover:text-primary active:border-primary-active",
                filled: "form-control bg-accent/50 text-primary hover:bg-accent/70 active:bg-accent border-0",
                text: "form-control bg-transparent text-secondary-foreground hover:bg-accent/60 active:bg-accent border-0",
                link: "px-0 text-primary underline-offset-4 hover:underline border-0",
                daypicker: "px-2 form-control font-normal w-full",
            },
            size: {
                sm: "h-7",
                md: "h-9",
                lg: "h-11",
                "icon-sm": "size-7",
                "icon-md": "size-9",
                "icon-lg": "size-11",
            },
            width: {
                fill: "flex-1",
                // block: "!block",
            },
        },
        defaultVariants: {
            variant: "solid",
            size: "md",
        },
    }
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild = false, className, size, width, variant, ...props }: ButtonProps) {
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, width, className }))}
            {...props}
        />
    );
}
