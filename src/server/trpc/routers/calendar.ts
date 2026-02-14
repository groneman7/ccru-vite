import { db } from "~/server/db";
import {
  eventsInCalendar as events,
  positionsInCalendar as positions,
  junctionShiftsInCalendar as shifts,
  junctionSlotsInCalendar as slots,
  junctionTemplatePositionsInCalendar as templatePositions,
  templatesInCalendar as templates,
  userInBetterAuth as users,
} from "~/server/db/schema";
import { publicProcedure, router } from "~/server/trpc/trpc";
import { newEventForm } from "~/shared/zod";
import dayjs from "dayjs";
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

const timeSchema = string().regex(
  /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
  "Time must be in HH:MM or HH:MM:SS format.",
);

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
    createTemplate: publicProcedure
      .input(
        object({
          eventName: string().min(1),
          description: union([string(), zNull()]),
          location: union([string(), zNull()]),
          timeBegin: timeSchema,
          timeEnd: union([timeSchema, zNull()]),
        }),
      )
      .mutation(async ({ input }) => {
        const normalizeTime = (value: string) =>
          value.length === 5 ? `${value}:00` : value;

        // `templates.name` is a unique internal identifier.
        const name = `${input.eventName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
        const [row] = await db
          .insert(templates)
          .values({
            name,
            display: input.eventName.trim(),
            description: input.description,
            location: input.location,
            timeBegin: normalizeTime(input.timeBegin),
            timeEnd: input.timeEnd ? normalizeTime(input.timeEnd) : null,
          })
          .returning({ id: templates.id });

        return row.id;
      }),
    getTemplateById: publicProcedure
      .input(object({ templateId: uuidv7() }))
      .query(async ({ input }) => {
        const [row] = await db
          .select()
          .from(templates)
          .where(eq(templates.id, input.templateId));
        return row;
      }),
    getTemplatePositionsByTemplateId: publicProcedure
      .input(object({ templateId: uuidv7() }))
      .query(async ({ input }) => {
        const rows = await db
          .select({
            id: templatePositions.id,
            quantity: templatePositions.quantity,
            positionId: positions.id,
            positionName: positions.name,
            positionDisplay: positions.display,
            positionDescription: positions.description,
          })
          .from(templatePositions)
          .innerJoin(positions, eq(templatePositions.positionId, positions.id))
          .where(eq(templatePositions.templateId, input.templateId));

        return rows.map((row) => ({
          id: row.id,
          quantity: row.quantity,
          position: {
            id: row.positionId,
            name: row.positionName,
            display: row.positionDisplay,
            description: row.positionDescription,
          },
        }));
      }),
    /**
     * Lists all templates.
     * @returns Array of templates
     */
    listAllTemplates: publicProcedure.query(async () => {
      const rows = await db.select().from(templates);
      return rows;
    }),
    createTemplatePositions: publicProcedure
      .input(
        object({
          templateId: uuidv7(),
          templatePositionsToCreate: array(
            object({
              positionId: uuidv7(),
              quantity: number().int().positive(),
            }),
          ),
        }),
      )
      .mutation(async ({ input }) => {
        const existing = await db
          .select({
            positionId: templatePositions.positionId,
          })
          .from(templatePositions)
          .where(eq(templatePositions.templateId, input.templateId));
        const existingPositionIds = new Set(
          existing.map((row) => row.positionId),
        );

        const newRows = input.templatePositionsToCreate.filter(
          (row) => !existingPositionIds.has(row.positionId),
        );

        if (newRows.length === 0) return;

        await db.insert(templatePositions).values(
          newRows.map((row) => ({
            templateId: input.templateId,
            positionId: row.positionId,
            quantity: row.quantity,
          })),
        );
      }),
    deleteTemplatePosition: publicProcedure
      .input(object({ templatePositionId: uuidv7() }))
      .mutation(async ({ input }) => {
        await db
          .delete(templatePositions)
          .where(eq(templatePositions.id, input.templatePositionId));
      }),
    updateTemplateDetails: publicProcedure
      .input(
        object({
          templateId: uuidv7(),
          name: string().min(1).optional(),
          eventName: string().min(1).optional(),
          description: union([string(), zNull()]).optional(),
          location: union([string(), zNull()]).optional(),
          timeBegin: timeSchema.optional(),
          timeEnd: union([timeSchema, zNull()]).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { templateId, name, eventName, timeBegin, timeEnd, ...rest } =
          input;
        const normalizeTime = (value: string) =>
          value.length === 5 ? `${value}:00` : value;

        await db
          .update(templates)
          .set({
            ...rest,
            ...(name ? { name: name.trim() } : {}),
            ...(eventName ? { display: eventName.trim() } : {}),
            ...(timeBegin ? { timeBegin: normalizeTime(timeBegin) } : {}),
            ...(timeEnd !== undefined
              ? { timeEnd: timeEnd ? normalizeTime(timeEnd) : null }
              : {}),
          })
          .where(eq(templates.id, templateId));
      }),
    updateTemplatePositionQuantity: publicProcedure
      .input(
        object({
          templatePositionId: uuidv7(),
          quantity: number().int().positive(),
        }),
      )
      .mutation(async ({ input }) => {
        await db
          .update(templatePositions)
          .set({ quantity: input.quantity })
          .where(eq(templatePositions.id, input.templatePositionId));
      }),
    createEventFromTemplate: publicProcedure
      .input(
        object({
          templateId: uuidv7(),
          date: iso.date(),
          createdBy: uuidv7(),
        }),
      )
      .mutation(async ({ input }) => {
        const [template] = await db
          .select()
          .from(templates)
          .where(eq(templates.id, input.templateId));

        if (!template) {
          throw new Error("Template not found.");
        }

        const [eventRow] = await db
          .insert(events)
          .values({
            name: template.display,
            description: template.description,
            location: template.location,
            timeBegin: dayjs(
              `${input.date} ${template.timeBegin}`,
            ).toISOString(),
            timeEnd: template.timeEnd
              ? dayjs(`${input.date} ${template.timeEnd}`).toISOString()
              : null,
            createdBy: input.createdBy,
          })
          .returning({ id: events.id });

        const rows = await db
          .select({
            positionId: templatePositions.positionId,
            quantity: templatePositions.quantity,
          })
          .from(templatePositions)
          .where(eq(templatePositions.templateId, input.templateId));

        if (rows.length > 0) {
          await db.insert(shifts).values(
            rows.map((row) => ({
              eventId: eventRow.id,
              positionId: row.positionId,
              quantity: row.quantity,
            })),
          );
        }

        return eventRow.id;
      }),
  },
});
