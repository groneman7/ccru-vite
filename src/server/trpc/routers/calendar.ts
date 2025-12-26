import { db } from "~server/db";
import {
  eventPositions,
  events,
  eventShifts,
  eventShiftSlots,
  eventTemplates,
  users,
} from "~server/db/schema";
import type { Slot } from "~server/db/types";
import { publicProcedure, router } from "~server/trpc/trpc";
import { newEventForm } from "~shared/zod";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { array, iso, number, object, string, union, null as zNull } from "zod";

export const calendarRouter = router({
  events: {
    /**
     * Creates a new event.
     * @returns The new event's ID.
     */
    createEvent: publicProcedure
      .input(newEventForm.schema)
      .mutation(async ({ input }) => {
        const {
          eventName: name,
          description,
          location,
          timeBegin,
          timeEnd,
          createdBy,
        } = input;
        const [row] = await db
          .insert(events)
          .values({
            name,
            description,
            location,
            timeBegin,
            timeEnd,
            createdBy,
          })
          .returning({ id: events.id });
        return row.id;
      }),
    listEventsByMonth: publicProcedure
      .input(object({ month: number(), year: number() }))
      .query(async ({ input }) => {
        const { month, year } = input;
        const start = new Date(year, month - 1, 1).toISOString();
        const end = new Date(year, month, 1).toISOString();

        const rows = await db.query.events.findMany({
          where: and(gte(events.timeBegin, start), lt(events.timeBegin, end)),
        });

        return rows;
      }),
    /**
     * Gets an event by ID.
     * @param eventId
     * @returns An event
     */
    getEvent: publicProcedure
      .input(object({ eventId: number() }))
      .query(async ({ input }) => {
        const { eventId } = input;
        const [row] = await db
          .select()
          .from(events)
          .where(eq(events.id, eventId));
        return row;
      }),
    /**
     * Lists events by month.
     * @param month Month
     * @param year Year
     * @returns Array of events
     */
    /**
     * Updates details for the event with the given ID.
     * @param eventId
     * @param eventData
     */
    updateEventDetails: publicProcedure
      .input(
        object({
          eventId: number(),
          name: string().min(1).optional(),
          description: union([string(), zNull()]).optional(),
          location: union([string(), zNull()]).optional(),
          timeBegin: iso.datetime().optional(),
          timeEnd: union([iso.datetime(), zNull()]).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { eventId, ...eventData } = input;
        await db
          .update(events)
          .set({ ...eventData })
          .where(eq(events.id, eventId));
      }),
  },
  positions: {
    /**
     * Lists all positions.
     * @returns Array of positions
     */
    listAllPositions: publicProcedure.query(async () => {
      const rows = await db.select().from(eventPositions);
      return rows;
    }),
  },
  shifts: {
    /**
     * Creates a new slot for the given user on the given shift.
     * @param shiftId
     * @param userId
     */
    assignUserToShift: publicProcedure
      .input(object({ shiftId: number(), userId: number() }))
      .mutation(async ({ input }) => {
        const { shiftId, userId } = input;

        // 1. Insert slot
        await db.insert(eventShiftSlots).values({ shiftId, userId });

        // 2. Update slot quantity if needed
        const [slotCount] = await db
          .select({ value: count() })
          .from(eventShiftSlots)
          .where(
            and(
              eq(eventShiftSlots.shiftId, shiftId),
              eq(eventShiftSlots.status, "active"),
            ),
          );

        const [slotQuantity] = await db
          .select({ value: eventShifts.quantity })
          .from(eventShifts)
          .where(eq(eventShifts.id, shiftId));

        if (slotCount.value > slotQuantity.value) {
          await db
            .update(eventShifts)
            .set({ quantity: slotCount.value })
            .where(eq(eventShifts.id, shiftId));
        }
      }),
    /**
     * Creates new shifts for the given event.
     * @param eventId
     * @param shifts Array of shifts to create
     */
    createShifts: publicProcedure
      .input(
        object({
          eventId: number(),
          shifts: array(
            object({
              positionId: number(),
              quantity: number().int().positive(),
            }),
          ),
        }),
      )
      .mutation(async ({ input }) => {
        const { eventId, shifts } = input;
        await db.insert(eventShifts).values(
          shifts.map((s) => ({
            eventId,
            positionId: s.positionId,
            quantity: s.quantity,
          })),
        );
      }),
    /**
     * Creates new slots for the given shifts.
     * @deprecated Use `assignUserToShift` instead.
     */
    createSlots: publicProcedure
      .input(
        object({
          shifts: array(object({ shiftId: number(), userId: number() })),
        }),
      )
      .mutation(async ({ input }) => {
        const { shifts } = input;
        await db
          .insert(eventShiftSlots)
          .values(
            shifts.map((s) => ({ shiftId: s.shiftId, userId: s.userId })),
          );
      }),
    /**
     * Delets the slot with the given ID.
     * @param slotId
     */
    deleteSlot: publicProcedure
      .input(object({ slotId: number() }))
      .mutation(async ({ input }) => {
        const { slotId } = input;
        await db
          .update(eventShiftSlots)
          .set({ status: "deleted" })
          .where(eq(eventShiftSlots.id, slotId));
      }),
    /**
     * Gets the active slots for the event with the given ID.
     * @param eventId
     * @returns Array of slots
     */
    getActiveSlotsByEventId: publicProcedure
      .input(object({ eventId: number() }))
      .query(async ({ input }) => {
        const { eventId } = input;
        const rows = await db
          .select({
            shiftId: eventShifts.id,
            eventId: eventShifts.eventId,
            positionId: eventShifts.positionId,
            quantity: eventShifts.quantity,
            positionLabel: eventPositions.label,
            slotId: eventShiftSlots.id,
            userId: users.id,
            nameFirst: users.nameFirst,
            nameLast: users.nameLast,
          })
          .from(eventShifts)
          .innerJoin(
            eventPositions,
            eq(eventShifts.positionId, eventPositions.id),
          )
          .leftJoin(
            eventShiftSlots,
            and(
              eq(eventShifts.id, eventShiftSlots.shiftId),
              eq(eventShiftSlots.status, "active"),
            ),
          )
          .leftJoin(users, eq(eventShiftSlots.userId, users.id))
          .where(and(eq(eventShifts.eventId, eventId)));

        const grouped = Array.from(
          rows.reduce((map, row) => {
            const shift = map.get(row.shiftId) ?? {
              id: row.shiftId,
              eventId: row.eventId,
              positionId: row.positionId,
              positionLabel: row.positionLabel,
              quantity: row.quantity,
              slots: [] as Slot[],
            };

            if (row.slotId && row.userId) {
              shift.slots.push({
                id: row.slotId,
                user: {
                  id: row.userId,
                  nameFirst: row.nameFirst!,
                  nameLast: row.nameLast!,
                },
              });
            }

            map.set(row.shiftId, shift);
            return map;
          }, new Map<number, { id: number; eventId: number; positionId: number; positionLabel: string; quantity: number; slots: Slot[] }>()),
        ).map(([, shift]) => shift);

        return grouped;
      }),
    /**
     * Updates the userId on the slot with the given ID.
     * @param slotId
     * @param userId
     */
    reassignSlot: publicProcedure
      .input(object({ slotId: number(), userId: number() }))
      .mutation(async ({ input }) => {
        const { slotId, userId } = input;
        await db
          .update(eventShiftSlots)
          .set({ userId })
          .where(eq(eventShiftSlots.id, slotId));
      }),
    /**
     * Updates the quantity of the shift with the given ID.
     * @param shiftId
     * @param quantity
     */
    updateSlotQuantity: publicProcedure
      .input(object({ shiftId: number(), quantity: number() }))
      .mutation(async ({ input }) => {
        const { shiftId, quantity } = input;
        await db
          .update(eventShifts)
          .set({ quantity })
          .where(eq(eventShifts.id, shiftId));
      }),
  },
  templates: {
    /**
     * Lists all templates.
     * @returns Array of templates
     */
    listAllTemplates: publicProcedure.query(async () => {
      const rows = await db.select().from(eventTemplates);
      return rows;
    }),
  },
});
