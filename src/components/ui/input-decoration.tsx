import { cn } from "@/src/components/utils";

type InputDecorationProps = { children: React.ReactNode; prefix?: boolean };
/**
Renders a prefix or suffix to an input. By default, a suffix is rendered. Pass `prefix` to render a prefix instead.
 */
export function InputDecoration({ children }: InputDecorationProps) {
    return children ? (
        <span className={cn("h-full flex items-center [&_svg]:size-4 [&_svg]:stroke-2 pointer-events-none")}>
            {children}
        </span>
    ) : null;
}
