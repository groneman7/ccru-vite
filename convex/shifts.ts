import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

type ShiftDoc = Doc<"eventShifts">;

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

export const createShifts = mutation({
  args: {
    shifts: v.array(
      v.object({
        eventId: v.id("events"),
        positionId: v.id("eventPositions"),
        quantity: v.number(),
        slots: v.array(v.id("users")),
      })
    ),
  },
  handler: async ({ db }, { shifts }) => {
    for (const shift of shifts) {
      await db.insert("eventShifts", {
        eventId: shift.eventId,
        positionId: shift.positionId,
        slots: shift.slots,
        quantity: shift.quantity,
      });
    }
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

    return shifts.map((shift) => {
      const { _id, eventId, positionId, slots, quantity } = shift;
      return { _id, eventId, positionId, slots, quantity };
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
    // TODO: finish this (need to actually remove the user from the shift lmao)

    await db.patch(shiftId, { slots });
  },
});

export const updateShiftSlots = mutation({
  args: {
    shifts: v.array(
      v.object({
        _id: v.id("eventShifts"),
        quantity: v.number(),
        slots: v.array(v.id("users")),
      })
    ),
  },
  handler: async ({ db }, { shifts }) => {
    for (const shift of shifts) {
      await db.patch(shift._id, shift);
    }
  },
});
