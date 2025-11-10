import type { Dayjs } from "dayjs";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/src/components/ui";
import { cn } from "@/src/components/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { Link, useNavigate } from "@tanstack/react-router";

type EventDoc = Doc<"events">;

type CalendarProps = {
  events?: EventDoc[];
  month: Dayjs;
};

export function Calendar({ events, month }: CalendarProps) {
  const navigate = useNavigate();
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const startOfCalendar = startOfMonth.startOf("week");
  const endOfCalendar = endOfMonth.endOf("week");

  const DATES: Dayjs[] = [];
  let currentDate = startOfCalendar;

  // Loop for adding calendar dates to DATES array for each calendar week, starting with startOfCalendar.
  while (currentDate.isBefore(endOfCalendar) || currentDate.isSame(endOfCalendar, "day")) {
    DATES.push(currentDate);
    currentDate = currentDate.add(1, "day");
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 p-2">
        {/* Calendar Header */}
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center">
            <Button
              onClick={() =>
                navigate({
                  to: "/calendar/$year/$month",
                  params: {
                    year: month.subtract(1, "month").format("YYYY"),
                    month: month.subtract(1, "month").format("M"),
                  },
                  replace: true,
                })
              }
              size="icon"
              variant="text">
              <ChevronLeft
                className="mr-0.5"
                size={20}
              />
            </Button>
            <div className="flex items-center">
              <span className="w-40 text-center text-xl font-bold select-none">
                {month.format("MMMM YYYY")}
              </span>
            </div>
            <Button
              onClick={() =>
                navigate({
                  to: "/calendar/$year/$month",
                  params: {
                    year: month.add(1, "month").format("YYYY"),
                    month: month.add(1, "month").format("M"),
                  },
                  replace: true,
                })
              }
              size="icon"
              variant="text">
              <ChevronRight
                className="ml-0.5"
                size={20}
              />
            </Button>
          </div>
          <Link to="/calendar/events/new">
            <Button>New Event</Button>
          </Link>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="flex flex-col flex-1">
        <WeekdayHeaders />
        {/* Dates */}
        <div
          className={cn(
            "grid h-full flex-1 grid-cols-7",
            DATES.length / 7 === 6 ? "grid-rows-6" : "grid-rows-5"
          )}>
          {DATES.map((date, index) => {
            const eventsOnDate: EventDoc[] | undefined = events
              ? events.filter(
                  (event) => dayjs(event.timeStart).isSame(date, "day")
                  // || (event.timeEnd && date.isBetween(event.timeStart, event.timeEnd, "day", "[]"))
                )
              : undefined;
            return (
              // Calendar Cell
              <div
                key={date.format("YYYY-MM-DD")}
                className={cn(
                  "flex flex-col items-stretch justify-start transition-colors duration-75",
                  // canEdit && "hover:bg-accent/25 cursor-pointer",
                  date.isSame(month, "month") ? "bg-white" : "bg-secondary/20",
                  index % 7 < 6 && "border-r",
                  date.isBefore(endOfCalendar.subtract(1, "week")) && "border-b-1"
                )}>
                {/* Date */}
                <div
                  className={cn(
                    "mt-3 flex h-7 w-7 select-none items-center justify-center self-center rounded-full p-1 text-sm font-semibold",
                    date.isSame(dayjs(), "date") && "bg-primary text-white",
                    !date.isSame(month, "month") && "text-secondary-foreground/60"
                  )}>
                  {date.isSame(month, "month") ? date.date() : date.format("MMM D")}
                </div>
                {/* Events on date */}
                <div className="flex flex-col gap-1 p-2">
                  {eventsOnDate &&
                    eventsOnDate?.length > 0 &&
                    eventsOnDate.map((event) => (
                      <Link
                        key={event._id}
                        to="/calendar/events/$eventId"
                        params={{ eventId: event._id }}
                        className="bg-accent hover:bg-accent-hover active:bg-accent-active/75 flex cursor-pointer select-none overflow-hidden text-ellipsis whitespace-nowrap rounded-sm px-1 text-sm transition-colors duration-75"
                        // onClick={(e) => {
                        //     e.stopPropagation();
                        //     onEventClick?.(e.currentTarget.id);
                        // }}
                      >
                        {event.name}
                      </Link>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekdayHeaders() {
  return (
    <div className="border-secondary grid grid-cols-7 border-b">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="text-sm text-center py-2">
          {day}
        </div>
      ))}
    </div>
  );
}
