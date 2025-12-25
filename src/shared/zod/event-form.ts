import { iso, number, object, string, union, null as zNull } from "zod";

export const newEventForm = {
  schema: object({
    createdBy: number(), // ideally derive from session instead of input
    date: iso.date(),
    description: union([string(), zNull()]),
    eventName: string().min(1, "Please enter an event name."),
    location: union([string(), zNull()]),
    timeBegin: iso.datetime("Please enter a start time."),
    timeEnd: union([iso.datetime(), zNull()]),
  }),
};
