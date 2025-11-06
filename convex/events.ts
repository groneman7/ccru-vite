import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
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
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", { ...args });
    return eventId;
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    return events;
  },
});

export const getEventById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    return event;
  },
});

export const getEventsByMonth = query({
  args: { year: v.string(), month: v.string() },
  handler: async (ctx, args) => {
    const start = dayjs(`${args.year}-${args.month}-01`).startOf("month");
    const end = start.add(1, "month");

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const eventsByMonth = await ctx.db
      .query("events")
      .withIndex("by_start")
      .filter((q) =>
        q.and(q.gte(q.field("timeStart"), startIso), q.lt(q.field("timeStart"), endIso))
      )
      .collect();
    return eventsByMonth;
  },
});
