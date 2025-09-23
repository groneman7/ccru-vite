import { useState } from "react";
import dayjs from "dayjs";
import { Button, DaypickerCalendar, Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui";
import { CalendarIcon } from "lucide-react";

export type DatePickerProps = {
    value?: Date;
    format?: string;
    onChange?: (value?: Date) => void;
    placeholder?: string;
};

export function DatePicker({ value, format, placeholder, onChange }: DatePickerProps) {
    const [selected, setSelected] = useState(value || new Date());
    const [open, setOpen] = useState(false);

    function handleChange(e: Date | undefined) {
        onChange?.(e);
        setSelected(e || new Date());
        setOpen(false);
    }

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="daypicker">
                    {selected ? (
                        dayjs(selected).format(format || "dddd, MMMM D, YYYY")
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="p-1 flex w-auto"
                sideOffset={8}>
                <DaypickerCalendar
                    mode="single"
                    selected={selected}
                    onSelect={handleChange}
                    // disabled={(date) => date < new Date()}
                />
            </PopoverContent>
        </Popover>
    );
}
