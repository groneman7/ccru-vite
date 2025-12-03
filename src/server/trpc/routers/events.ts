import { db } from "~server/db";
import {
  eventPositions,
  events,
  eventShifts,
  eventShiftSlots,
  users,
} from "~server/db/schema";
import type { Slot } from "~server/db/types";
import { publicProcedure, router } from "~server/trpc/trpc";
import { newEventForm } from "~shared/zod";
import { and, eq, gte, lt } from "drizzle-orm";
import { array, iso, number, object, string } from "zod";

export const eventsRouter = router({
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
  createShifts: publicProcedure
    // Note: Currently, events and shifts are created separately. This could be wrapped into a single transaction in the future, but for now, I don't see that being necessary because not every event will necessarily have shifts at first.
    .input(
      object({
        eventId: number(),
        shifts: array(
          object({ positionId: number(), quantity: number().int().positive() }),
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
        .values(shifts.map((s) => ({ shiftId: s.shiftId, userId: s.userId })));
    }),
  getAllPositions: publicProcedure.query(async () => {
    const rows = await db.select().from(eventPositions);
    return rows;
  }),
  getEventById: publicProcedure
    .input(object({ eventId: number() }))
    .query(async ({ input }) => {
      const { eventId } = input;
      const [row] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));
      return row;
    }),
  getEventsByMonth: publicProcedure
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
  getSlotsByEventId: publicProcedure
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
        .leftJoin(eventShiftSlots, eq(eventShifts.id, eventShiftSlots.shiftId))
        .leftJoin(users, eq(eventShiftSlots.userId, users.id))
        .where(eq(eventShifts.eventId, eventId));

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
  updateEvent: publicProcedure
    .input(
      object({
        eventId: number(),
        name: string().min(1),
        description: string().optional(),
        location: string().optional(),
        timeBegin: iso.datetime().optional(),
        timeEnd: iso.datetime().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { eventId, ...eventData } = input;
      await db
        .update(events)
        .set({ ...eventData })
        .where(eq(events.id, eventId));
    }),
});
