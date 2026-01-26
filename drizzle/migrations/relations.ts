import { relations } from "drizzle-orm/relations";
import { userInBetterAuth, eventsInCalendar, attributeKeysInAuthz, attributeValuesInAuthz, junctionShiftsInCalendar, positionsInCalendar, junctionUserAttributesInAuthz, junctionSlotsInCalendar } from "./schema";

export const eventsInCalendarRelations = relations(eventsInCalendar, ({one, many}) => ({
	userInBetterAuth: one(userInBetterAuth, {
		fields: [eventsInCalendar.createdBy],
		references: [userInBetterAuth.id]
	}),
	junctionShiftsInCalendars: many(junctionShiftsInCalendar),
}));

export const userInBetterAuthRelations = relations(userInBetterAuth, ({many}) => ({
	eventsInCalendars: many(eventsInCalendar),
	junctionUserAttributesInAuthzs: many(junctionUserAttributesInAuthz),
	junctionSlotsInCalendars: many(junctionSlotsInCalendar),
}));

export const attributeValuesInAuthzRelations = relations(attributeValuesInAuthz, ({one, many}) => ({
	attributeKeysInAuthz: one(attributeKeysInAuthz, {
		fields: [attributeValuesInAuthz.keyId],
		references: [attributeKeysInAuthz.id]
	}),
	junctionUserAttributesInAuthzs: many(junctionUserAttributesInAuthz),
}));

export const attributeKeysInAuthzRelations = relations(attributeKeysInAuthz, ({many}) => ({
	attributeValuesInAuthzs: many(attributeValuesInAuthz),
}));

export const junctionShiftsInCalendarRelations = relations(junctionShiftsInCalendar, ({one, many}) => ({
	eventsInCalendar: one(eventsInCalendar, {
		fields: [junctionShiftsInCalendar.eventId],
		references: [eventsInCalendar.id]
	}),
	positionsInCalendar: one(positionsInCalendar, {
		fields: [junctionShiftsInCalendar.positionId],
		references: [positionsInCalendar.id]
	}),
	junctionSlotsInCalendars: many(junctionSlotsInCalendar),
}));

export const positionsInCalendarRelations = relations(positionsInCalendar, ({many}) => ({
	junctionShiftsInCalendars: many(junctionShiftsInCalendar),
}));

export const junctionUserAttributesInAuthzRelations = relations(junctionUserAttributesInAuthz, ({one}) => ({
	userInBetterAuth: one(userInBetterAuth, {
		fields: [junctionUserAttributesInAuthz.userId],
		references: [userInBetterAuth.id]
	}),
	attributeValuesInAuthz: one(attributeValuesInAuthz, {
		fields: [junctionUserAttributesInAuthz.valueId],
		references: [attributeValuesInAuthz.id]
	}),
}));

export const junctionSlotsInCalendarRelations = relations(junctionSlotsInCalendar, ({one}) => ({
	junctionShiftsInCalendar: one(junctionShiftsInCalendar, {
		fields: [junctionSlotsInCalendar.shiftId],
		references: [junctionShiftsInCalendar.id]
	}),
	userInBetterAuth: one(userInBetterAuth, {
		fields: [junctionSlotsInCalendar.userId],
		references: [userInBetterAuth.id]
	}),
}));