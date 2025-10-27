import type { ComponentProps } from "react";
import { cn } from "@/src/components/utils";

// TODO: Prevent `Workspace` from being imported in anything beside `src/routes/__root.tsx`
export function Workspace({ children, className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex-1 flex flex-col gap-2", className)}
            {...props}>
            {children}
        </div>
    );
}

type WorkspaceContentProps = ComponentProps<"div"> & { orientation?: "vertical" | "horizontal" };

export function WorkspaceContent({ children, className, orientation = "vertical", ...props }: WorkspaceContentProps) {
    return (
        <div
            className={cn("flex-1 flex gap-4 p-4", orientation === "vertical" && "flex-col", className)}
            {...props}>
            {children}
        </div>
    );
}

export function WorkspaceHeader({ children, className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex gap-4 px-4 pt-4 items-center justify-start text-2xl font-bold", className)}
            {...props}>
            {children}
        </div>
    );
}

export function WorkspaceNav({ children, className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex gap-4 items-center justify-end", className)}
            {...props}>
            {children}
        </div>
    );
}
