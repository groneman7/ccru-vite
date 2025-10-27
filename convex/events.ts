import { v } from "convex/values";
import { /* mutation, */ query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import dayjs from "dayjs";

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
            .filter((q) => q.and(q.gte(q.field("timeStart"), startIso), q.lt(q.field("timeStart"), endIso)))
            .collect();
        return eventsByMonth;
    },
});

export const getEventShifts = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const eventShifts = await ctx.db
            .query("eventShifts")
            .withIndex("by_eventId")
            .filter((q) => q.eq(q.field("eventId"), args.eventId))
            .collect();

        const uniquePositionIds = [...new Set(eventShifts.map((shift) => shift.positionId))];
        const positionsById = new Map<Id<"eventPositions">, Doc<"eventPositions">>();
        await Promise.all(
            uniquePositionIds.map(async (positionId) => {
                const position = await ctx.db.get(positionId);
                if (position) {
                    positionsById.set(positionId, position);
                }
            })
        );

        const uniqueUserIds = [...new Set(eventShifts.flatMap((shift) => (shift.userId ? [shift.userId] : [])))];
        const usersById = new Map<Id<"users">, Doc<"users">>();
        await Promise.all(
            uniqueUserIds.map(async (userId) => {
                const user = await ctx.db.get(userId);
                if (user) {
                    usersById.set(userId, user);
                }
            })
        );

        return eventShifts.map((shift) => {
            const user = shift.userId ? usersById.get(shift.userId) : undefined;
            const userName = user ? `${user.firstName} ${user.lastName}` : undefined;
            return {
                ...shift,
                position: positionsById.get(shift.positionId),
                userName,
            };
        });
    },
});
