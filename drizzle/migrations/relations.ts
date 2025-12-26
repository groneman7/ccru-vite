import { relations } from "drizzle-orm/relations";
import { eventShifts, eventShiftSlots, users, events, eventPositions, attributeKeys, attributeValues, userAttributesInAuthz } from "./schema";

export const eventShiftSlotsRelations = relations(eventShiftSlots, ({one}) => ({
	eventShift: one(eventShifts, {
		fields: [eventShiftSlots.shiftId],
		references: [eventShifts.id]
	}),
	user: one(users, {
		fields: [eventShiftSlots.userId],
		references: [users.id]
	}),
}));

export const eventShiftsRelations = relations(eventShifts, ({one, many}) => ({
	eventShiftSlots: many(eventShiftSlots),
	event: one(events, {
		fields: [eventShifts.eventId],
		references: [events.id]
	}),
	eventPosition: one(eventPositions, {
		fields: [eventShifts.positionId],
		references: [eventPositions.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	eventShiftSlots: many(eventShiftSlots),
	events: many(events),
	userAttributesInAuthzs: many(userAttributesInAuthz),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventShifts: many(eventShifts),
	user: one(users, {
		fields: [events.createdBy],
		references: [users.id]
	}),
}));

export const eventPositionsRelations = relations(eventPositions, ({many}) => ({
	eventShifts: many(eventShifts),
}));

export const attributeValuesRelations = relations(attributeValues, ({one, many}) => ({
	attributeKey: one(attributeKeys, {
		fields: [attributeValues.keyId],
		references: [attributeKeys.id]
	}),
	userAttributesInAuthzs: many(userAttributesInAuthz),
}));

export const attributeKeysRelations = relations(attributeKeys, ({many}) => ({
	attributeValues: many(attributeValues),
}));

export const userAttributesInAuthzRelations = relations(userAttributesInAuthz, ({one}) => ({
	attributeValue: one(attributeValues, {
		fields: [userAttributesInAuthz.attributeId],
		references: [attributeValues.id]
	}),
	user: one(users, {
		fields: [userAttributesInAuthz.userId],
		references: [users.id]
	}),
}));