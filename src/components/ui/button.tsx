import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/components/utils/index";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  cn(
    "has-focus-ring rounded hover:z-30",
    // "cursor-pointer",
    "flex items-center justify-center gap-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    "px-4 whitespace-nowrap [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        solid:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        outline:
          "border text-primary/80 border border-primary/50 [.input-group_&]:border-border [.input-group_&]:hover:border-red-500 hover:border-primary hover:text-primary active:border-primary-active",
        filled:
          "bg-accent/50 text-primary hover:bg-accent/70 active:bg-accent active:border active:!border-red-500 !focus-visible:border-red-500",
        text: "bg-transparent text-secondary-foreground hover:bg-accent/60 active:bg-accent",
        link: "px-0 text-primary underline-offset-4 hover:underline border-0",
        daypicker: "px-2 font-normal w-full border border-border",
      },
      size: {
        "sm": "h-7 text-sm",
        "md": "h-9",
        "lg": "h-11 text-lg",
        "icon-xs": "size-5 p-0",
        "icon-sm": "size-7 p-0",
        "icon": "size-9 p-0",
        "icon-lg": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; fill?: boolean; round?: boolean };

export function Button({
  asChild = false,
  className,
  fill,
  round,
  size,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        fill && "flex-1",
        round && "rounded-full"
      )}
      {...props}
    />
  );
}
