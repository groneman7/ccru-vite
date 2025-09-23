import * as React from "react";
import { cn } from "@/src/components/utils";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function DaypickerCalendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            navLayout={"around"}
            classNames={{
                months: "select-none flex flex-col",
                month: "flex flex-col gap-2 items-center",
                month_caption: "mt-1",
                caption_label: "font-medium",
                nav: "flex items-center",
                day: cn("size-9 p-0 aria-selected:opacity-100", "rounded-sm", "hover:bg-accent", "cursor-pointer"),
                day_button: "h-full w-full rounded-sm",
                selected: "bg-primary text-primary-foreground font-semibold hover:bg-primary-hover",
                today: "[&_button]:border [&_button]:border-accent",
                root: "!p-0",
                weekdays: "border-b border-border",
                ...classNames,
            }}
            components={{
                NextMonthButton: ({ className, onClick }) => (
                    <ChevronRight
                        className={cn("p-1 h-6 w-6 rounded absolute top-3 right-3 hover:bg-accent", className)}
                        onClick={onClick as unknown as React.MouseEventHandler<SVGSVGElement>}
                    />
                ),
                PreviousMonthButton: ({ className, onClick }) => (
                    <ChevronLeft
                        className={cn("p-1 h-6 w-6 rounded absolute top-3 left-3 hover:bg-accent", className)}
                        onClick={onClick as unknown as React.MouseEventHandler<SVGSVGElement>}
                    />
                ),
            }}
            // components={{
            //     IconLeft: ({ className, ...props }) => (
            //         <ChevronLeft
            //             className={cn("h-4 w-4", className)}
            //             {...props}
            //         />
            //     ),
            //     IconRight: ({ className, ...props }) => (
            //         <ChevronRight
            //             className={cn("h-4 w-4", className)}
            //             {...props}
            //         />
            //     ),
            // }}
            {...props}
        />
    );
}
