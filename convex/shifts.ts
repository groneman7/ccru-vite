import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

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

export const assignUserToShift = mutation({
    args: {
        shiftId: v.id("eventShifts"),
        userId: v.id("users"),
    },
    handler: async (ctx, { shiftId, userId }) => {
        const shift = await ctx.db.get(shiftId);
        if (!shift) return; // Shift not found

        const user = await ctx.db.get(userId);
        if (!user) return; // User not found

        await ctx.db.patch(shiftId, { userId });
    },
});

export const unassignUserFromShift = mutation({
    args: {
        shiftId: v.id("eventShifts"),
    },
    handler: async (ctx, { shiftId }) => {
        const shift = await ctx.db.get(shiftId);
        if (!shift) return; // Shift not found

        await ctx.db.patch(shiftId, { userId: undefined });
    },
});
