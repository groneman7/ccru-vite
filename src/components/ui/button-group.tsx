import { cn } from "@/src/components/utils";

type ButtonGroupProps = {
    children: React.ReactNode;
};
export function ButtonGroup({ children }: ButtonGroupProps) {
    return (
        <div
            className={cn(
                // "border-2 border-red-500",
                "group flex w-full items-center rounded data-[render=separate]:gap-1 data-[render=separate]:flex-wrap"
            )}>
            {children}
        </div>
    );
}
