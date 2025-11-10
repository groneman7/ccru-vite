import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export const assignUserToShift = mutation({
  args: {
    shiftId: v.id("eventShifts"),
    userToAssignId: v.id("users"),
    userToReplaceId: v.optional(v.id("users")),
  },
  handler: async ({ db }, { shiftId, userToAssignId, userToReplaceId }) => {
    const shift = await db.get(shiftId);
    if (!shift) return; // Shift not found

    const userToAssign = await db.get(userToAssignId);
    if (!userToAssign) return; // User not found

    if (shift.slots.includes(userToAssignId)) return; // Already assigned

    // Copy slots array; find the index of a) the user to replace, or b) the first null slot; and insert the userId there
    const slots = [...shift.slots];
    const indexToReplace = userToReplaceId
      ? slots.findIndex((slot) => slot === userToReplaceId)
      : slots.findIndex((slot) => slot === null);
    if (indexToReplace === -1) return; // either userToReplaceId not found or no empty slots
    slots[indexToReplace] = userToAssignId;

    await db.patch(shiftId, { slots });
  },
});

export const getEventShifts = query({
  args: { eventId: v.id("events") },
  handler: async ({ db }, { eventId }) => {
    // 1. Fetch all event shifts for the given event ID
    const shifts = await db
      .query("eventShifts")
      .withIndex("by_eventId")
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .collect();

    // 2a. Get unique position IDs and initialize an empty map that will have event position ids as keys and their corresponding docs as values
    const uniquePositionIds = [...new Set(shifts.map((shift) => shift.positionId))];
    const positionsById = new Map<Id<"eventPositions">, Doc<"eventPositions">>();

    // 2b. Asynchronously fetch the event positions from the database and add them to the positionsById map
    await Promise.all(
      uniquePositionIds.map(async (positionId) => {
        const positionObj = await db.get(positionId);
        if (positionObj) {
          positionsById.set(positionId, positionObj);
        }
      })
    );

    // 3a. Get unique user IDs and initialize an empty map that will have user ids as keys and their corresponding docs as values
    const uniqueUserIds = [
      ...new Set(
        shifts.flatMap((shift) =>
          shift.slots.filter((slotUserId): slotUserId is Id<"users"> => Boolean(slotUserId))
        )
      ),
    ];
    const usersById = new Map<Id<"users">, Doc<"users">>();

    // 3b. Asynchronously fetch the users from the database and add them to the usersById map
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const user = await db.get(userId);
        if (user) {
          usersById.set(userId, user);
        }
      })
    );

    return shifts.map((shift) => {
      // 4. For each shift slot, either populate the user object or keep it null
      const populatedSlots = shift.slots.map((slotUserId) => {
        if (!slotUserId) return null;
        const user = usersById.get(slotUserId);
        return {
          userId: slotUserId,
          user,
          userName: user ? `${user.firstName} ${user.lastName}` : undefined,
        };
      });

      return {
        _id: shift._id,
        eventId: shift.eventId,
        position: positionsById.get(shift.positionId),
        slots: populatedSlots,
      };
    });
  },
});

export const unassignUserFromShift = mutation({
  args: {
    shiftId: v.id("eventShifts"),
    userId: v.optional(v.id("users")),
  },
  handler: async ({ db }, { shiftId, userId }) => {
    const shift = await db.get(shiftId);
    if (!shift) return; // Shift not found

    // TODO: if length is 0, we should probably delete it
    if (shift.slots.length === 0) return; // Nothing to unassign

    // Copy slots array, find the index of the userId to unassign, and remove it
    const slots = [...shift.slots];
    const slotIndexWithUserToUnassign = slots.findIndex((slot) => slot === userId);
    if (slotIndexWithUserToUnassign === -1) return; // User not assigned
    slots[slotIndexWithUserToUnassign] = null;

    await db.patch(shiftId, { slots });
  },
});

export const updateShiftSlots = mutation({
  args: {
    slots: v.array(v.union(v.id("users"), v.null())),
    shiftId: v.id("eventShifts"),
  },
  handler: async ({ db }, { slots, shiftId }) => {
    const shift = await db.get(shiftId);
    if (!shift) return; // Shift not found

    const test = await db.patch(shiftId, { slots });
  },
});
