import { cn } from "@/src/components/utils/index";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  cn(
    "rounded hover:z-30",
    "flex items-center justify-center gap-1",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "shrink-0 px-4 whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ),
  {
    variants: {
      variant: {
        solid:
          "has-focus-ring bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        outline:
          "has-focus-ring border border-primary/50 text-primary/80 hover:border-primary hover:text-primary active:border-primary-active [.input-group_&]:border-border [.input-group_&]:hover:border-red-500",
        filled:
          "!focus-visible:border-red-500 has-focus-ring bg-accent/50 text-primary hover:bg-accent/70 active:border active:!border-red-500 active:bg-accent",
        text: "has-focus-ring bg-transparent text-secondary-foreground hover:bg-accent/60 active:bg-accent",
        link: "w-auto cursor-pointer border-0 px-0 text-primary underline-offset-4 hover:underline",
        daypicker:
          "has-focus-ring w-full border border-border px-2 font-normal",
      },
      size: {
        sm: "h-7 text-sm",
        md: "h-9",
        lg: "h-11 text-lg",
        "icon-xs": "size-5 p-0",
        "icon-sm": "size-7 p-0",
        icon: "size-9 p-0",
        "icon-lg": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; round?: boolean };

function Button({
  asChild = false,
  className,
  round,
  size,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),

        round && "rounded-full",
      )}
      type={type}
      {...props}
    />
  );
}

export { buttonVariants, Button };
