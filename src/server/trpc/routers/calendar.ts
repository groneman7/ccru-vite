import { db } from "~/server/db";
import {
  eventsInCalendar as events,
  positionsInCalendar as positions,
  junctionShiftsInCalendar as shifts,
  junctionSlotsInCalendar as slots,
  templatesInCalendar as templates,
  userInBetterAuth as users,
} from "~/server/db/schema";
import type { Slot } from "~/server/db/types";
import { publicProcedure, router } from "~/server/trpc/trpc";
import { newEventForm } from "~/shared/zod";
import { and, count, eq, gte, lt } from "drizzle-orm";
import {
  array,
  iso,
  number,
  object,
  string,
  union,
  uuidv7,
  null as zNull,
} from "zod";

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

        const rows = await db.query.eventsInCalendar.findMany({
          where: and(gte(events.timeBegin, start), lt(events.timeBegin, end)),
        });

        return rows;
      }),
    /**
     * Gets an event by ID.
     * @param eventId
     * @returns An event
     */
    getEventDetailsById: publicProcedure
      .input(object({ eventId: uuidv7() }))
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
          eventId: uuidv7(),
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
    getPositionById: publicProcedure
      .input(object({ positionId: uuidv7() }))
      .query(async ({ input }) => {
        const { positionId } = input;
        const [row] = await db
          .select()
          .from(positions)
          .where(eq(positions.id, positionId));
        return row;
      }),
    /**
     * Lists all positions.
     * @returns Array of positions
     */
    listAllPositions: publicProcedure.query(async () => {
      const rows = await db.select().from(positions);
      return rows;
    }),
    /**
     * Creates a new position.
     * @returns The new position's ID.
     */
    createPosition: publicProcedure
      .input(
        object({
          name: string().min(1),
          display: string().min(1),
          description: union([string(), zNull()]).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const [row] = await db
          .insert(positions)
          .values({
            name: input.name,
            display: input.display,
            description: input.description ?? null,
          })
          .returning({ id: positions.id });
        return row.id;
      }),
    /**
     * Updates details for the position with the given ID.
     * @param positionId
     * @param positionData
     */
    updatePositionDetails: publicProcedure
      .input(
        object({
          positionId: uuidv7(),
          name: string().min(1).optional(),
          display: string().min(1).optional(),
          description: union([string(), zNull()]).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { positionId, ...positionData } = input;
        await db
          .update(positions)
          .set({ ...positionData })
          .where(eq(positions.id, positionId));
      }),
  },
  shifts: {
    /**
     * Creates a new slot for the given user on the given shift.
     * @param shiftId
     * @param userId
     */
    assignUserToShift: publicProcedure
      .input(object({ shiftId: uuidv7(), userId: uuidv7() }))
      .mutation(async ({ input }) => {
        const { shiftId, userId } = input;

        // 1. Insert slot
        const [newSlot] = await db
          .insert(slots)
          .values({ shiftId, userId })
          .returning({ slotId: slots.id });

        // 2. Update slot quantity if needed
        const [slotCount] = await db
          .select({ value: count() })
          .from(slots)
          .where(and(eq(slots.shiftId, shiftId), eq(slots.status, "active")));

        const [slotQuantity] = await db
          .select({ value: shifts.quantity })
          .from(shifts)
          .where(eq(shifts.id, shiftId));

        if (slotCount.value > slotQuantity.value) {
          await db
            .update(shifts)
            .set({ quantity: slotCount.value })
            .where(eq(shifts.id, shiftId));
        }

        return {
          shiftId,
          userId,
          slotId: newSlot.slotId,
          quantity: Math.max(slotCount.value, slotQuantity.value),
        };
      }),
    /**
     * Creates new shifts for the given event.
     * @param eventId
     * @param shifts Array of shifts to create
     */
    createShifts: publicProcedure
      .input(
        object({
          eventId: uuidv7(),
          shiftsToCreate: array(
            object({
              positionId: uuidv7(),
              quantity: number().int().positive(),
            }),
          ),
        }),
      )
      .mutation(async ({ input }) => {
        const { eventId, shiftsToCreate } = input;
        await db.insert(shifts).values(
          shiftsToCreate.map((s) => ({
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
          shifts: array(object({ shiftId: uuidv7(), userId: uuidv7() })),
        }),
      )
      .mutation(async ({ input }) => {
        const { shifts } = input;
        await db
          .insert(slots)
          .values(
            shifts.map((s) => ({ shiftId: s.shiftId, userId: s.userId })),
          );
      }),
    /**
     * Delets the slot with the given ID.
     * @param slotId
     */
    deleteSlot: publicProcedure
      .input(object({ slotId: uuidv7() }))
      .mutation(async ({ input }) => {
        const { slotId } = input;
        await db
          .update(slots)
          .set({ status: "deleted" })
          .where(eq(slots.id, slotId));
      }),
    /**
     * Deletes the shift with the given ID.
     * @param shiftId
     */
    deleteShift: publicProcedure
      .input(object({ shiftId: uuidv7() }))
      .mutation(async ({ input }) => {
        const { shiftId } = input;
        await db
          .update(shifts)
          .set({ status: "deleted" })
          .where(eq(shifts.id, shiftId));
      }),
    getShiftsByEventId: publicProcedure
      .input(object({ eventId: uuidv7() }))
      .query(async ({ input: { eventId } }) => {
        const rows = await db
          .select({
            shiftId: shifts.id,
            quantity: shifts.quantity,
            positionId: positions.id,
            positionName: positions.name,
            positionDisplay: positions.display,
            positionDescription: positions.description,
            slotId: slots.id,
            userId: users.id,
            userDisplayName: users.displayName,
            userImage: users.image,
          })
          .from(shifts)
          .innerJoin(positions, eq(shifts.positionId, positions.id))
          .leftJoin(
            slots,
            and(eq(shifts.id, slots.shiftId), eq(slots.status, "active")),
          )
          .leftJoin(users, eq(slots.userId, users.id))
          .where(and(eq(shifts.eventId, eventId), eq(shifts.status, "active")));

        const grouped = Array.from(
          rows.reduce(
            (map, row) => {
              const shift = map.get(row.shiftId) ?? {
                id: row.shiftId,
                quantity: row.quantity,
                position: {
                  id: row.positionId,
                  name: row.positionName,
                  display: row.positionDisplay,
                  description: row.positionDescription,
                },
                slots: [] as Array<{
                  id: string;
                  user: {
                    id: string;
                    displayName: string;
                    image: string | null;
                  };
                }>,
              };

              if (row.slotId && row.userId && row.userDisplayName) {
                shift.slots.push({
                  id: row.slotId,
                  user: {
                    id: row.userId,
                    displayName: row.userDisplayName,
                    image: row.userImage,
                  },
                });
              }

              map.set(row.shiftId, shift);
              return map;
            },
            new Map<
              string,
              {
                id: string;
                quantity: number;
                position: {
                  id: string;
                  name: string;
                  display: string;
                  description: string | null;
                };
                slots: Array<{
                  id: string;
                  user: {
                    id: string;
                    displayName: string;
                    image: string | null;
                  };
                }>;
              }
            >(),
          ),
        ).map(([, shift]) => shift);

        return grouped;
      }),
    /**
     * Updates the userId on the slot with the given ID.
     * @param slotId
     * @param userId
     */
    reassignSlot: publicProcedure
      .input(object({ slotId: uuidv7(), userId: uuidv7() }))
      .mutation(async ({ input }) => {
        const { slotId, userId } = input;
        await db.update(slots).set({ userId }).where(eq(slots.id, slotId));
      }),
    /**
     * Updates the quantity of the shift with the given ID.
     * @param shiftId
     * @param quantity
     */
    updateSlotQuantity: publicProcedure
      .input(object({ shiftId: uuidv7(), quantity: number() }))
      .mutation(async ({ input }) => {
        const { shiftId, quantity } = input;
        await db.update(shifts).set({ quantity }).where(eq(shifts.id, shiftId));
      }),
  },
  templates: {
    /**
     * Lists all templates.
     * @returns Array of templates
     */
    listAllTemplates: publicProcedure.query(async () => {
      const rows = await db.select().from(templates);
      return rows;
    }),
  },
});
