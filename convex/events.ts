import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import dayjs from "dayjs";

export const createEvent = mutation({
  args: {
    createdBy: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    timeStart: v.string(),
    timeEnd: v.optional(v.string()),
  },
  handler: async ({ db }, { ...event }) => {
    const eventId = await db.insert("events", { ...event });
    return eventId;
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async ({ db }, { eventId }) => {
    const shifts = await db
      .query("eventShifts")
      .withIndex("by_eventId")
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .collect();

    for (const shift of shifts) {
      await db.delete(shift._id);
    }

    await db.delete(eventId);
  },
});

export const getAllEvents = query({
  args: {},
  handler: async ({ db }) => {
    const events = await db.query("events").collect();
    return events;
  },
});

export const getEventById = query({
  args: { id: v.id("events") },
  handler: async ({ db }, { id }) => {
    const event = await db.get(id);
    return event;
  },
});

export const getEventsByMonth = query({
  args: { year: v.string(), month: v.string() },
  handler: async ({ db }, { year, month }) => {
    const start = dayjs(`${year}-${month}-01`).startOf("month");
    const end = start.add(1, "month");

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const eventsByMonth = await db
      .query("events")
      .withIndex("by_start")
      .filter((q) =>
        q.and(q.gte(q.field("timeStart"), startIso), q.lt(q.field("timeStart"), endIso))
      )
      .collect();
    return eventsByMonth;
  },
});

export const updateEvent = mutation({
  args: {
    _id: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    timeStart: v.string(),
    timeEnd: v.optional(v.string()),
  },
  handler: async ({ db }, { ...event }) => {
    const eventId = db.get(event._id);
    if (!eventId) return; // Event not found

    await db.patch(event._id, event);
  },
});
