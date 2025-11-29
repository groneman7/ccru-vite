import { cn } from "@/utils";
import type { ComponentProps } from "react";

// TODO: Prevent `Workspace` from being imported in anything beside `src/routes/__root.tsx`
export function Workspace({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-1 flex-col gap-2 p-4", className)} {...props}>
      {children}
    </div>
  );
}

type WorkspaceContentProps = ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal";
};

export function WorkspaceContent({
  children,
  className,
  orientation = "vertical",
  ...props
}: WorkspaceContentProps) {
  return (
    <div
      className={cn(
        "flex flex-1 p-4",
        orientation === "vertical" && "flex-col gap-4",
        orientation === "horizontal" && "flex-row gap-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function WorkspaceHeader({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-start gap-4 px-4 pt-4 text-2xl font-bold",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function WorkspaceNav({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-end gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
